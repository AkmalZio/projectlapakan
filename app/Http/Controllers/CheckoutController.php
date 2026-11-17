<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    private const CANDLE_UNIT_PRICE = 3000;

    private const SHIPPING_COURIERS = [
        'jnt_express' => [
            'name' => 'J&T Express',
            'service' => 'EZ',
            'cost' => 20000,
            'estimate' => '2-3 hari',
        ],
        'jne_reg' => [
            'name' => 'JNE',
            'service' => 'REG',
            'cost' => 18000,
            'estimate' => '2-4 hari',
        ],
        'sicepat_reg' => [
            'name' => 'SiCepat',
            'service' => 'REG',
            'cost' => 17000,
            'estimate' => '1-3 hari',
        ],
        'pos_reguler' => [
            'name' => 'Pos Indonesia',
            'service' => 'Pos Reguler',
            'cost' => 15000,
            'estimate' => '3-5 hari',
        ],
    ];

    /**
     * Delivery windows the buyer can pick, keyed by the value stored on the order.
     */
    private const DELIVERY_TIME_SLOTS = [
        '09:00 - 12:00' => 'Pagi (09:00 - 12:00 WIB)',
        '13:00 - 17:00' => 'Siang / Sore (13:00 - 17:00 WIB)',
        '18:00 - 20:00' => 'Malam (18:00 - 20:00 WIB)',
    ];

    private const MAX_CANDLES = 100;

    private const OWN_PRODUCT_MESSAGE = 'Anda tidak dapat membeli produk dari toko Anda sendiri.';

    /**
     * Display Step 1: Shipping & Delivery Info.
     *
     * Each store ships its own package, so candles and cake text are chosen per store
     * and end up on that store's order only.
     */
    public function shipping(Request $request): Response|RedirectResponse
    {
        $cart = $request->session()->get('checkout_cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Keranjang belanja Anda masih kosong.');
        }

        $cart = $this->withCurrentPrices($cart);
        $request->session()->put('checkout_cart', $cart);

        $user = $request->user();
        $shippingData = array_merge([
            'recipient_name' => $user?->name ?? '',
            'recipient_phone' => $user?->phone ?? '',
            'delivery_address' => $user?->address ?? '',
            'delivery_courier' => 'jnt_express',
            'delivery_date' => now()->addDay()->format('Y-m-d'),
            'delivery_time_slot' => array_key_first(self::DELIVERY_TIME_SLOTS),
            'greeting_card_message' => '',
            'notes' => '',
            'customizations' => [],
        ], $request->session()->get('checkout_shipping', []));

        $summary = $this->summarize($cart, $shippingData, $this->productsOf($cart));
        $shippingData['customizations'] = collect($summary['stores'])
            ->mapWithKeys(fn (array $store): array => [$store['store_id'] => [
                'candles_count' => $store['candles_count'],
                'cake_text' => $store['cake_text'] ?? '',
            ]])
            ->all();

        return Inertia::render('Checkout/Shipping', [
            'cartItems' => array_values($cart),
            'stores' => $summary['stores'],
            'subtotal' => $summary['subtotal'],
            'shippingCost' => $summary['shipping_cost'],
            'shippingCouriers' => self::SHIPPING_COURIERS,
            'deliveryTimeSlots' => self::DELIVERY_TIME_SLOTS,
            'maxCandles' => self::MAX_CANDLES,
            'storeCount' => count($summary['stores']),
            'candleUnitPrice' => self::CANDLE_UNIT_PRICE,
            'candleCost' => $summary['candle_cost'],
            'total' => $summary['total'],
            'shippingData' => $shippingData,
        ]);
    }

    public function startFromCart(Request $request): RedirectResponse
    {
        $cart = $request->session()->get('cart', []);

        if (empty($cart)) {
            $request->session()->forget(['checkout_cart', 'checkout_shipping', 'checkout_source']);

            return redirect()->route('cart.index')->with('error', 'Keranjang belanja Anda masih kosong.');
        }

        $request->session()->put('checkout_cart', $cart);
        $request->session()->put('checkout_source', 'cart');
        $request->session()->forget('checkout_shipping');

        return redirect()->route('checkout.shipping');
    }

    public function cancel(Request $request): RedirectResponse
    {
        $request->session()->forget(['checkout_cart', 'checkout_shipping', 'checkout_source']);

        return redirect()->route('cart.index')->with('success', 'Checkout dibatalkan. Keranjang Anda tetap tersimpan.');
    }

    /**
     * Save Step 1 data and proceed to Step 2: Payment.
     */
    public function saveShipping(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:100',
            'recipient_phone' => 'required|string|max:20',
            'delivery_address' => 'required|string|max:500',
            'delivery_courier' => ['required', 'string', Rule::in(array_keys(self::SHIPPING_COURIERS))],
            'delivery_date' => 'required|date|after_or_equal:today',
            'delivery_time_slot' => ['required', 'string', Rule::in(array_keys(self::DELIVERY_TIME_SLOTS))],
            'greeting_card_message' => 'nullable|string|max:250',
            'notes' => 'nullable|string|max:300',
            'customizations' => ['required', 'array', 'min:1'],
            'customizations.*' => ['required', 'array'],
            'customizations.*.candles_count' => 'required|integer|min:0|max:'.self::MAX_CANDLES,
            'customizations.*.cake_text' => 'nullable|string|max:100',
            'quantities' => ['required', 'array', 'min:1'],
            'quantities.*' => ['required', 'integer', 'min:1', 'max:99'],
        ], [
            'recipient_name.required' => 'Nama penerima wajib diisi.',
            'recipient_name.max' => 'Nama penerima maksimal 100 karakter.',
            'recipient_phone.required' => 'Nomor WhatsApp wajib diisi.',
            'recipient_phone.max' => 'Nomor WhatsApp maksimal 20 karakter.',
            'delivery_address.required' => 'Alamat pengiriman wajib diisi.',
            'delivery_address.max' => 'Alamat pengiriman maksimal 500 karakter.',
            'delivery_courier.required' => 'Pilih kurir pengiriman.',
            'delivery_courier.in' => 'Kurir yang dipilih tidak tersedia.',
            'delivery_date.required' => 'Tanggal pengiriman wajib diisi.',
            'delivery_date.date' => 'Tanggal pengiriman tidak valid.',
            'delivery_date.after_or_equal' => 'Tanggal pengiriman tidak boleh sebelum hari ini.',
            'delivery_time_slot.required' => 'Pilih slot waktu pengiriman.',
            'delivery_time_slot.in' => 'Slot waktu yang dipilih tidak tersedia.',
            'greeting_card_message.max' => 'Pesan kartu ucapan maksimal 250 karakter.',
            'notes.max' => 'Catatan maksimal 300 karakter.',
            'customizations.required' => 'Data kustomisasi kue tidak valid. Muat ulang halaman dan coba lagi.',
            'customizations.*.candles_count.required' => 'Jumlah lilin wajib diisi (isi 0 jika tidak perlu).',
            'customizations.*.candles_count.integer' => 'Jumlah lilin harus berupa angka.',
            'customizations.*.candles_count.min' => 'Jumlah lilin tidak boleh negatif.',
            'customizations.*.candles_count.max' => 'Jumlah lilin maksimal '.self::MAX_CANDLES.'.',
            'customizations.*.cake_text.max' => 'Tulisan di atas kue maksimal 100 karakter.',
            'quantities.required' => 'Jumlah produk checkout tidak valid. Muat ulang halaman dan coba lagi.',
            'quantities.*.required' => 'Jumlah produk wajib diisi.',
            'quantities.*.integer' => 'Jumlah produk harus berupa angka.',
            'quantities.*.min' => 'Jumlah produk minimal 1.',
            'quantities.*.max' => 'Jumlah produk maksimal 99.',
        ]);

        $cart = $request->session()->get('checkout_cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Keranjang belanja Anda masih kosong.');
        }

        $quantities = $validated['quantities'];

        if (! $this->haveSameKeys(array_keys($cart), array_keys($quantities))) {
            throw ValidationException::withMessages([
                'quantities' => 'Jumlah produk checkout tidak valid. Muat ulang halaman dan coba lagi.',
            ]);
        }

        $storeIds = $this->productsOf($cart)->pluck('store_id')->unique()->all();

        if (! $this->haveSameKeys($storeIds, array_keys($validated['customizations']))) {
            throw ValidationException::withMessages([
                'customizations' => 'Data kustomisasi kue tidak valid. Muat ulang halaman dan coba lagi.',
            ]);
        }

        foreach (array_keys($cart) as $key) {
            $cart[$key]['quantity'] = (int) $quantities[$key];
        }

        $validated['customizations'] = collect($validated['customizations'])
            ->map(fn (array $customization): array => [
                'candles_count' => (int) $customization['candles_count'],
                'cake_text' => filled($customization['cake_text'] ?? null) ? $customization['cake_text'] : null,
            ])
            ->all();

        $request->session()->put('checkout_cart', $cart);
        unset($validated['quantities']);
        $request->session()->put('checkout_shipping', $validated);

        return redirect()->route('checkout.payment');
    }

    /**
     * Display Step 2: choose the transfer destination and review one order per store.
     */
    public function payment(Request $request): Response|RedirectResponse
    {
        $cart = $request->session()->get('checkout_cart', []);
        $shipping = $request->session()->get('checkout_shipping');

        if (empty($cart)) {
            return redirect()->route('cart.index');
        }

        if (empty($shipping)) {
            return redirect()->route('checkout.shipping');
        }

        $cart = $this->withCurrentPrices($cart);
        $request->session()->put('checkout_cart', $cart);

        $courier = $this->courierOf($shipping);
        $summary = $this->summarize($cart, $shipping, $this->productsOf($cart));

        return Inertia::render('Checkout/Payment', [
            'cartItems' => array_values($cart),
            'shipping' => $shipping,
            'stores' => $summary['stores'],
            'subtotal' => $summary['subtotal'],
            'shippingCost' => $summary['shipping_cost'],
            'storeCount' => count($summary['stores']),
            'deliveryCourier' => $courier['name'],
            'deliveryEstimate' => $courier['estimate'],
            'candleUnitPrice' => self::CANDLE_UNIT_PRICE,
            'candleCost' => $summary['candle_cost'],
            'total' => $summary['total'],
            'paymentAccounts' => config('lapakan.payment_accounts'),
            'paymentWindowHours' => Order::PAYMENT_WINDOW_HOURS,
        ]);
    }

    /**
     * Create one unpaid order per store and clear the purchased items from the cart.
     * The buyer then transfers and uploads a proof from the order page.
     */
    public function process(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'string', Rule::in(array_keys(config('lapakan.payment_accounts')))],
        ], [
            'payment_method.required' => 'Pilih metode pembayaran.',
            'payment_method.in' => 'Metode pembayaran yang dipilih tidak tersedia.',
        ]);

        $cart = $request->session()->get('checkout_cart', []);
        $shipping = $request->session()->get('checkout_shipping');

        if (empty($cart) || empty($shipping)) {
            return redirect()->route('cart.index');
        }

        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $courier = $this->courierOf($shipping);

        $orderNumbers = DB::transaction(function () use ($cart, $shipping, $user, $courier, $validated): array {
            $products = Product::with('store:id,name,user_id')
                ->whereIn('id', array_column($cart, 'product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $variants = ProductVariant::whereIn('id', array_filter(array_column($cart, 'variant_id')))->lockForUpdate()->get()->keyBy('id');

            $this->ensureCartIsPurchasable($cart, $products, $variants, $user);

            $orderNumbers = [];

            foreach ($this->summarize($cart, $shipping, $products)['stores'] as $storeSummary) {
                $orderNumber = $this->generateOrderNumber();

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $user->id,
                    'store_id' => $storeSummary['store_id'],
                    'total_amount' => $storeSummary['total'],
                    'shipping_cost' => $storeSummary['shipping_cost'],
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                    'payment_method' => strtoupper($validated['payment_method']),
                    'payment_due_at' => now()->addHours(Order::PAYMENT_WINDOW_HOURS),
                    'delivery_type' => 'delivery',
                    'delivery_courier' => $courier['name'],
                    'delivery_date' => $shipping['delivery_date'],
                    'delivery_time_slot' => $shipping['delivery_time_slot'],
                    'recipient_name' => $shipping['recipient_name'],
                    'recipient_phone' => $shipping['recipient_phone'],
                    'delivery_address' => $shipping['delivery_address'],
                    'delivery_notes' => $shipping['notes'] ?? null,
                    'greeting_card_message' => $shipping['greeting_card_message'] ?? null,
                    'candles_count' => $storeSummary['candles_count'],
                ]);

                foreach ($storeSummary['items'] as $item) {
                    $product = $products[$item['product_id']];

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'product_variant_id' => $item['variant_id'] ?? null,
                        'product_name' => $item['name'],
                        'variant_name' => $item['variant_name'] ?? null,
                        'price' => $item['price'],
                        'quantity' => $item['quantity'],
                        'subtotal' => $item['price'] * $item['quantity'],
                        'cake_text' => $product->allows_custom_message
                            ? ($item['cake_text'] ?? $storeSummary['cake_text'])
                            : null,
                    ]);

                    $product->decrement('stock', $item['quantity']);

                    if (! empty($item['variant_id'])) {
                        $variants[$item['variant_id']]->decrement('stock', $item['quantity']);
                    }
                }

                $orderNumbers[] = $orderNumber;
            }

            return $orderNumbers;
        });

        if ($request->session()->get('checkout_source') !== 'buy_now') {
            $request->session()->put('cart', array_diff_key($request->session()->get('cart', []), $cart));
        }

        $request->session()->forget(['checkout_cart', 'checkout_shipping', 'checkout_source']);

        if (count($orderNumbers) > 1) {
            return redirect()->route('orders.index')
                ->with('success', 'Pesanan dibuat dan dipisah menjadi '.count($orderNumbers).' pesanan sesuai toko penjual. Transfer lalu unggah bukti pembayaran di detail setiap pesanan.');
        }

        return redirect()->route('orders.success', ['orderNumber' => $orderNumbers[0]]);
    }

    /**
     * Group the checkout items per store and price each group exactly as its order will be stored:
     * items subtotal + one shipping fee + that store's candles. Items whose product no longer exists
     * are left out; process() rejects them before anything is saved.
     *
     * @param  array<string, array<string, mixed>>  $cart
     * @param  array<string, mixed>  $shipping
     * @param  Collection<int, Product>  $products  keyed by id, with the store relation loaded
     * @return array{stores: list<array<string, mixed>>, subtotal: float, shipping_cost: int, candle_cost: int, total: float}
     */
    private function summarize(array $cart, array $shipping, Collection $products): array
    {
        $courier = $this->courierOf($shipping);
        $customizations = $shipping['customizations'] ?? [];

        $stores = collect($cart)
            ->filter(fn (array $item): bool => $products->has($item['product_id']))
            ->groupBy(fn (array $item): int => (int) $products[$item['product_id']]->store_id)
            ->map(function (Collection $items, int $storeId) use ($products, $customizations, $courier): array {
                $storeProducts = $items->map(fn (array $item): Product => $products[$item['product_id']]);
                $allowsCakeText = $storeProducts->contains(fn (Product $product): bool => (bool) $product->allows_custom_message);
                $candlesCount = (int) ($customizations[$storeId]['candles_count'] ?? 0);
                $cakeText = $allowsCakeText ? ($customizations[$storeId]['cake_text'] ?? null) : null;
                $subtotal = (float) $items->sum(fn (array $item): float => $item['price'] * $item['quantity']);
                $candleCost = $candlesCount * self::CANDLE_UNIT_PRICE;

                return [
                    'store_id' => $storeId,
                    'store_name' => $storeProducts->first()->store?->name ?? 'Toko',
                    'item_ids' => $items->pluck('id')->values()->all(),
                    'items' => $items->values()->all(),
                    'allows_cake_text' => $allowsCakeText,
                    'subtotal' => $subtotal,
                    'shipping_cost' => $courier['cost'],
                    'candles_count' => $candlesCount,
                    'candle_cost' => $candleCost,
                    'cake_text' => filled($cakeText) ? $cakeText : null,
                    'total' => $subtotal + $courier['cost'] + $candleCost,
                ];
            })
            ->values();

        return [
            'stores' => $stores->all(),
            'subtotal' => (float) $stores->sum('subtotal'),
            'shipping_cost' => (int) $stores->sum('shipping_cost'),
            'candle_cost' => (int) $stores->sum('candle_cost'),
            'total' => (float) $stores->sum('total'),
        ];
    }

    /**
     * @param  array<string, array{product_id: int}>  $cart
     * @return Collection<int, Product>
     */
    private function productsOf(array $cart): Collection
    {
        return Product::with('store:id,name,user_id')
            ->whereIn('id', array_column($cart, 'product_id'))
            ->get()
            ->keyBy('id');
    }

    /**
     * @param  array<string, mixed>  $shipping
     * @return array{name: string, service: string, cost: int, estimate: string}
     */
    private function courierOf(array $shipping): array
    {
        return self::SHIPPING_COURIERS[$shipping['delivery_courier'] ?? 'jnt_express'] ?? self::SHIPPING_COURIERS['jnt_express'];
    }

    /**
     * @param  array<int, int|string>  $expected
     * @param  array<int, int|string>  $given
     */
    private function haveSameKeys(array $expected, array $given): bool
    {
        $expected = array_map('strval', $expected);
        $given = array_map('strval', $given);

        return count($expected) === count($given) && ! array_diff($expected, $given) && ! array_diff($given, $expected);
    }

    /**
     * Reject the checkout when a product or variant was removed or deactivated, belongs to the buyer's
     * own store, its price changed, or there is no longer enough stock. Product stock is checked against
     * the combined quantity of all its variants, because every purchased variant also decrements the
     * product stock.
     *
     * @param  array<string, array{product_id: int, variant_id?: int|null, name: string, variant_name?: string|null, price: float|int, quantity: int}>  $cart
     * @param  Collection<int, Product>  $products
     * @param  Collection<int, ProductVariant>  $variants
     */
    private function ensureCartIsPurchasable(array $cart, Collection $products, Collection $variants, User $buyer): void
    {
        $quantityByProduct = [];

        foreach ($cart as $item) {
            $product = $products->get($item['product_id']);
            $variant = empty($item['variant_id']) ? null : $variants->get($item['variant_id']);
            $isVariantMissing = ! empty($item['variant_id'])
                && (! $variant || (int) $variant->product_id !== (int) $item['product_id']);

            if (! $product || ! $product->is_active || $isVariantMissing) {
                throw ValidationException::withMessages([
                    'cart' => 'Produk "'.$item['name'].'" sudah tidak tersedia. Hapus dari keranjang lalu coba lagi.',
                ]);
            }

            if ((int) $product->store?->user_id === (int) $buyer->id) {
                throw ValidationException::withMessages([
                    'cart' => self::OWN_PRODUCT_MESSAGE.' Hapus "'.$item['name'].'" dari keranjang lalu coba lagi.',
                ]);
            }

            if ($variant && $variant->stock < $item['quantity']) {
                throw ValidationException::withMessages([
                    'cart' => 'Stok "'.$item['name'].' ('.$variant->name.')" tersisa '.max(0, $variant->stock).'. Kurangi jumlah pesanan lalu coba lagi.',
                ]);
            }

            if (abs($this->unitPriceOf($product, $variant) - (float) $item['price']) >= 0.01) {
                throw ValidationException::withMessages([
                    'cart' => 'Harga "'.$item['name'].'" baru saja berubah. Periksa kembali total pembayaran lalu konfirmasi ulang.',
                ]);
            }

            $quantityByProduct[$product->id] = ($quantityByProduct[$product->id] ?? 0) + $item['quantity'];
        }

        foreach ($quantityByProduct as $productId => $quantity) {
            $product = $products->get($productId);

            if ($product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'cart' => 'Stok "'.$product->name.'" tersisa '.max(0, $product->stock).'. Kurangi jumlah pesanan lalu coba lagi.',
                ]);
            }
        }
    }

    /**
     * Refresh each checkout item's unit price from the catalog so the summary never shows a stale price.
     * Items whose product or variant no longer exists are left untouched; process() rejects them.
     *
     * @param  array<string, array<string, mixed>>  $cart
     * @return array<string, array<string, mixed>>
     */
    private function withCurrentPrices(array $cart): array
    {
        $products = Product::whereIn('id', array_column($cart, 'product_id'))->get()->keyBy('id');
        $variants = ProductVariant::whereIn('id', array_filter(array_column($cart, 'variant_id')))->get()->keyBy('id');

        foreach ($cart as $key => $item) {
            $product = $products->get($item['product_id']);
            $variant = empty($item['variant_id']) ? null : $variants->get($item['variant_id']);

            if (! $product || (! empty($item['variant_id']) && ! $variant)) {
                continue;
            }

            $cart[$key]['price'] = $this->unitPriceOf($product, $variant);
        }

        return $cart;
    }

    private function unitPriceOf(Product $product, ?ProductVariant $variant): float
    {
        return (float) $product->base_price + (float) ($variant?->additional_price ?? 0);
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'LPK-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Display the order-created page with transfer instructions. Only the buyer who placed the order may see it.
     */
    public function success(Request $request, string $orderNumber): Response
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $order = $user->orders()
            ->with(['items.product', 'store'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('Checkout/Success', [
            'order' => $order,
            'paymentAccounts' => config('lapakan.payment_accounts'),
        ]);
    }
}
