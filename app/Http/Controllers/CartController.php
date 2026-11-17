<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    private const MAX_ITEM_QUANTITY = 99;

    /**
     * Display the shopping cart page.
     */
    public function index(Request $request): Response
    {
        $cart = $request->session()->get('cart', []);
        $products = Product::whereIn('id', array_column($cart, 'product_id'))->get(['id', 'store_id'])->keyBy('id');

        $subtotal = 0;
        foreach ($cart as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        return Inertia::render('Cart', [
            'cartItems' => array_values($cart),
            'subtotal' => $subtotal,
            'storeCount' => $products->pluck('store_id')->unique()->count(),
            'maxItemQuantity' => self::MAX_ITEM_QUANTITY,
        ]);
    }

    /**
     * Add a product / variant to cart.
     */
    public function add(Request $request): RedirectResponse
    {
        if ($request->boolean('buy_now') && ! $request->user()) {
            return redirect()->guest(route('login'));
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => [
                'nullable',
                Rule::exists('product_variants', 'id')->where('product_id', $request->integer('product_id')),
            ],
            'quantity' => 'required|integer|min:1|max:'.self::MAX_ITEM_QUANTITY,
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $variant = ! empty($validated['variant_id']) ? ProductVariant::find($validated['variant_id']) : null;
        $isBuyNow = $request->boolean('buy_now');

        if (! $product->is_active) {
            return redirect()->back()->with('error', 'Produk ini sedang tidak dijual.');
        }

        if ($request->user() && (int) $product->store()->value('user_id') === (int) $request->user()->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat membeli produk dari toko Anda sendiri.');
        }

        $price = (float) $product->base_price + ($variant ? (float) $variant->additional_price : 0);
        $cartKey = $product->id.'_'.($variant ? $variant->id : '0');
        $cart = $request->session()->get('cart', []);
        $requestedQuantity = (int) $validated['quantity'] + ($isBuyNow ? 0 : (int) ($cart[$cartKey]['quantity'] ?? 0));
        $availableStock = min($product->stock, $variant?->stock ?? $product->stock);

        if ($requestedQuantity > $availableStock) {
            return redirect()->back()->with('error', $availableStock > 0
                ? 'Stok "'.$product->name.'" tersisa '.$availableStock.'.'
                : 'Stok "'.$product->name.'" sedang habis.');
        }

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
            $request->session()->put('checkout_source', 'buy_now');
            $request->session()->forget('checkout_shipping');

            return redirect()->route('checkout.shipping');
        }

        if (isset($cart[$cartKey])) {
            $cart[$cartKey]['quantity'] = min(self::MAX_ITEM_QUANTITY, $requestedQuantity);
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
            'quantity' => 'required|integer|min:1|max:'.self::MAX_ITEM_QUANTITY,
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
