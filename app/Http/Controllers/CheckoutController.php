<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
     * Display Step 1: Shipping & Delivery Info.
     */
    public function shipping(Request $request): Response|RedirectResponse
    {
        $cart = $request->session()->get('checkout_cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Keranjang belanja Anda masih kosong.');
        }

        $subtotal = 0;
        foreach ($cart as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        $shippingData = array_merge([
            'recipient_name' => Auth::user()?->name ?? '',
            'recipient_phone' => Auth::user()?->phone ?? '',
            'delivery_address' => '',
            'delivery_courier' => 'jnt_express',
            'delivery_date' => now()->addDay()->format('Y-m-d'),
            'delivery_time_slot' => '10:00 - 14:00',
            'greeting_card_message' => '',
            'cake_text' => '',
            'notes' => '',
            'candles_count' => 1,
        ], $request->session()->get('checkout_shipping', []));

        $candlesCount = (int) ($shippingData['candles_count'] ?? 1);
        $shippingCost = self::SHIPPING_COURIERS[$shippingData['delivery_courier']]['cost']
            ?? self::SHIPPING_COURIERS['jnt_express']['cost'];
        $candleUnitPrice = self::CANDLE_UNIT_PRICE;
        $candleCost = $candlesCount * $candleUnitPrice;

        return Inertia::render('Checkout/Shipping', [
            'cartItems' => array_values($cart),
            'subtotal' => $subtotal,
            'shippingCost' => $shippingCost,
            'shippingCouriers' => self::SHIPPING_COURIERS,
            'candlesCount' => $candlesCount,
            'candleUnitPrice' => $candleUnitPrice,
            'candleCost' => $candleCost,
            'total' => $subtotal + $shippingCost + $candleCost,
            'shippingData' => $shippingData,
        ]);
    }

    public function startFromCart(Request $request): RedirectResponse
    {
        $cart = $request->session()->get('cart', []);

        if (empty($cart)) {
            $request->session()->forget(['checkout_cart', 'checkout_shipping']);

            return redirect()->route('cart.index')->with('error', 'Keranjang belanja Anda masih kosong.');
        }

        $request->session()->put('checkout_cart', $cart);
        $request->session()->forget('checkout_shipping');

        return redirect()->route('checkout.shipping');
    }

    public function cancel(Request $request): RedirectResponse
    {
        $request->session()->forget(['checkout_cart', 'checkout_shipping']);

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
            'delivery_time_slot' => 'required|string',
            'greeting_card_message' => 'nullable|string|max:250',
            'cake_text' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:300',
            'candles_count' => 'required|integer|min:0',
            'quantities' => ['required', 'array', 'min:1'],
            'quantities.*' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $cart = $request->session()->get('checkout_cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Keranjang belanja Anda masih kosong.');
        }

        $quantities = $validated['quantities'];
        $cartKeys = array_map('strval', array_keys($cart));
        $quantityKeys = array_map('strval', array_keys($quantities));

        if (count($cartKeys) !== count($quantityKeys) || array_diff($cartKeys, $quantityKeys) || array_diff($quantityKeys, $cartKeys)) {
            throw ValidationException::withMessages([
                'quantities' => 'Jumlah produk checkout tidak valid. Muat ulang halaman dan coba lagi.',
            ]);
        }

        foreach (array_keys($cart) as $key) {
            $cart[$key]['quantity'] = (int) $quantities[$key];
        }

        $request->session()->put('checkout_cart', $cart);
        unset($validated['quantities']);
        $request->session()->put('checkout_shipping', $validated);

        return redirect()->route('checkout.payment');
    }

    /**
     * Display Step 2: Payment Method & Proof Upload.
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

        $subtotal = 0;
        foreach ($cart as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }
        $shippingCost = self::SHIPPING_COURIERS[$shipping['delivery_courier'] ?? 'jnt_express']['cost']
            ?? self::SHIPPING_COURIERS['jnt_express']['cost'];
        $candlesCount = (int) ($shipping['candles_count'] ?? 0);
        $candleUnitPrice = self::CANDLE_UNIT_PRICE;
        $candleCost = $candlesCount * $candleUnitPrice;
        $total = $subtotal + $shippingCost + $candleCost;

        return Inertia::render('Checkout/Payment', [
            'cartItems' => array_values($cart),
            'shipping' => $shipping,
            'subtotal' => $subtotal,
            'shippingCost' => $shippingCost,
            'deliveryCourier' => self::SHIPPING_COURIERS[$shipping['delivery_courier'] ?? 'jnt_express']['name']
                ?? self::SHIPPING_COURIERS['jnt_express']['name'],
            'deliveryEstimate' => self::SHIPPING_COURIERS[$shipping['delivery_courier'] ?? 'jnt_express']['estimate']
                ?? self::SHIPPING_COURIERS['jnt_express']['estimate'],
            'candlesCount' => $candlesCount,
            'candleUnitPrice' => $candleUnitPrice,
            'candleCost' => $candleCost,
            'total' => $total,
        ]);
    }

    /**
     * Confirm payment, create order in database, clear cart.
     */
    public function process(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:bca,mandiri,bri,qris',
        ]);

        $cart = $request->session()->get('checkout_cart', []);
        $shipping = $request->session()->get('checkout_shipping');

        if (empty($cart) || empty($shipping)) {
            return redirect()->route('cart.index');
        }

        $subtotal = 0;
        foreach ($cart as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }
        $deliveryCourier = $shipping['delivery_courier'] ?? 'jnt_express';
        $courier = self::SHIPPING_COURIERS[$deliveryCourier] ?? self::SHIPPING_COURIERS['jnt_express'];
        $shippingCost = $courier['cost'];
        $candlesCount = (int) ($shipping['candles_count'] ?? 0);
        $totalAmount = $subtotal + $shippingCost + ($candlesCount * self::CANDLE_UNIT_PRICE);

        // Ensure user or default guest customer
        $user = Auth::user();
        if (! $user) {
            $user = User::firstOrCreate(
                ['email' => 'customer@lapakan.com'],
                ['name' => $shipping['recipient_name'], 'phone' => $shipping['recipient_phone'], 'password' => bcrypt('password')]
            );
        }

        $store = Store::first();

        $orderNumber = 'LPK-'.now()->format('Ymd').'-'.strtoupper(Str::random(4));

        DB::transaction(function () use ($orderNumber, $user, $store, $totalAmount, $shippingCost, $validated, $shipping, $cart, $candlesCount, $courier) {
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'store_id' => $store?->id ?? 1,
                'total_amount' => $totalAmount,
                'shipping_cost' => $shippingCost,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'payment_method' => strtoupper($validated['payment_method']),
                'delivery_type' => 'delivery',
                'delivery_courier' => $courier['name'],
                'delivery_date' => $shipping['delivery_date'],
                'delivery_time_slot' => $shipping['delivery_time_slot'],
                'recipient_name' => $shipping['recipient_name'],
                'recipient_phone' => $shipping['recipient_phone'],
                'delivery_address' => $shipping['delivery_address'],
                'delivery_notes' => $shipping['notes'] ?? null,
                'greeting_card_message' => $shipping['greeting_card_message'] ?? null,
                'candles_count' => $candlesCount,
            ]);

            foreach ($cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['variant_id'] ?? null,
                    'product_name' => $item['name'],
                    'variant_name' => $item['variant_name'] ?? null,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['price'] * $item['quantity'],
                    'cake_text' => $item['cake_text'] ?? $shipping['cake_text'] ?? null,
                ]);
            }
        });

        // Clear session
        $request->session()->forget('cart');
        $request->session()->forget('checkout_cart');
        $request->session()->forget('checkout_shipping');

        return redirect()->route('orders.success', ['orderNumber' => $orderNumber]);
    }

    /**
     * Display Order Success modal / page.
     */
    public function success(string $orderNumber): Response
    {
        $order = Order::with(['items.product', 'store'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('Checkout/Success', [
            'order' => $order,
        ]);
    }
}
