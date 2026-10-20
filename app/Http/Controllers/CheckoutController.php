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
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    private const CANDLE_UNIT_PRICE = 3000;

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

        $shippingData = $request->session()->get('checkout_shipping', [
            'recipient_name' => Auth::user()?->name ?? '',
            'recipient_phone' => Auth::user()?->phone ?? '',
            'delivery_address' => '',
            'delivery_date' => now()->addDay()->format('Y-m-d'),
            'delivery_time_slot' => '10:00 - 14:00',
            'greeting_card_message' => '',
            'cake_text' => '',
            'notes' => '',
            'candles_count' => 1,
        ]);

        $candlesCount = (int) ($shippingData['candles_count'] ?? 1);
        $candleUnitPrice = self::CANDLE_UNIT_PRICE;
        $candleCost = $candlesCount * $candleUnitPrice;

        return Inertia::render('Checkout/Shipping', [
            'cartItems' => array_values($cart),
            'subtotal' => $subtotal,
            'shippingCost' => 20000,
            'candlesCount' => $candlesCount,
            'candleUnitPrice' => $candleUnitPrice,
            'candleCost' => $candleCost,
            'total' => $subtotal + 20000 + $candleCost,
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
            'delivery_date' => 'required|date|after_or_equal:today',
            'delivery_time_slot' => 'required|string',
            'greeting_card_message' => 'nullable|string|max:250',
            'cake_text' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:300',
            'candles_count' => 'required|integer|min:0',
        ]);

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
        $shippingCost = 20000;
        $candlesCount = (int) ($shipping['candles_count'] ?? 0);
        $candleUnitPrice = self::CANDLE_UNIT_PRICE;
        $candleCost = $candlesCount * $candleUnitPrice;
        $total = $subtotal + $shippingCost + $candleCost;

        return Inertia::render('Checkout/Payment', [
            'cartItems' => array_values($cart),
            'shipping' => $shipping,
            'subtotal' => $subtotal,
            'shippingCost' => $shippingCost,
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
        $shippingCost = 20000;
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

        DB::transaction(function () use ($orderNumber, $user, $store, $totalAmount, $shippingCost, $validated, $shipping, $cart, $candlesCount) {
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
