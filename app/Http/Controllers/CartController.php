<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Display the shopping cart page.
     */
    public function index(Request $request): Response
    {
        $cart = $request->session()->get('cart', []);

        $subtotal = 0;
        foreach ($cart as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        return Inertia::render('Cart', [
            'cartItems' => array_values($cart),
            'subtotal' => $subtotal,
        ]);
    }

    /**
     * Add a product / variant to cart.
     */
    public function add(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $variant = ! empty($validated['variant_id']) ? ProductVariant::find($validated['variant_id']) : null;
        $isBuyNow = $request->boolean('buy_now');

        if ($isBuyNow && ! $request->user()) {
            return redirect()->route('login');
        }

        $price = (float) $product->base_price + ($variant ? (float) $variant->additional_price : 0);
        $cartKey = $product->id.'_'.($variant ? $variant->id : '0');

        if ($isBuyNow) {
            $checkoutCart = [
                $cartKey => [
                    'id' => $cartKey,
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'name' => $product->name,
                    'variant_name' => $variant?->name,
                    'slug' => $product->slug,
                    'image' => $product->image,
                    'price' => $price,
                    'quantity' => (int) $validated['quantity'],
                    'cake_text' => null,
                ],
            ];
            $request->session()->put('checkout_cart', $checkoutCart);
            $request->session()->forget('checkout_shipping');

            return redirect()->route('checkout.shipping');
        }

        $cart = $request->session()->get('cart', []);

        if (isset($cart[$cartKey])) {
            $cart[$cartKey]['quantity'] += (int) $validated['quantity'];
        } else {
            $cart[$cartKey] = [
                'id' => $cartKey,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'name' => $product->name,
                'variant_name' => $variant?->name,
                'slug' => $product->slug,
                'image' => $product->image,
                'price' => $price,
                'quantity' => (int) $validated['quantity'],
                'cake_text' => null,
            ];
        }

        $request->session()->put('cart', $cart);

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan ke keranjang!');
    }

    /**
     * Update quantity of a cart item.
     */
    public function update(Request $request, string $cartKey): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $request->session()->get('cart', []);

        if (isset($cart[$cartKey])) {
            $cart[$cartKey]['quantity'] = (int) $validated['quantity'];
            $request->session()->put('cart', $cart);
        }

        return redirect()->back();
    }

    /**
     * Remove item from cart.
     */
    public function remove(Request $request, string $cartKey): RedirectResponse
    {
        $cart = $request->session()->get('cart', []);

        if (isset($cart[$cartKey])) {
            unset($cart[$cartKey]);
            $request->session()->put('cart', $cart);
        }

        return redirect()->back()->with('success', 'Item dihapus dari keranjang.');
    }
}
