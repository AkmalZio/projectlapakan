<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    /**
     * Store the buyer's rating for one product of their completed order (once per product per order).
     */
    public function store(Request $request, string $orderNumber): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $order = $user->orders()->with('items:id,order_id,product_id')->where('order_number', $orderNumber)->firstOrFail();

        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ], [
            'rating.required' => 'Pilih rating 1 sampai 5 bintang.',
            'rating.min' => 'Rating minimal 1 bintang.',
            'rating.max' => 'Rating maksimal 5 bintang.',
            'comment.max' => 'Ulasan maksimal 1000 karakter.',
        ]);

        if ($order->status !== 'completed') {
            throw ValidationException::withMessages([
                'rating' => 'Ulasan hanya bisa diberikan setelah pesanan selesai.',
            ]);
        }

        if (! $order->items->contains('product_id', (int) $validated['product_id'])) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk ini tidak ada di dalam pesanan.',
            ]);
        }

        if ($order->reviews()->where('product_id', $validated['product_id'])->exists()) {
            throw ValidationException::withMessages([
                'rating' => 'Kamu sudah memberi ulasan untuk produk ini pada pesanan ini.',
            ]);
        }

        $order->reviews()->create([
            'product_id' => $validated['product_id'],
            'user_id' => $user->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Terima kasih! Ulasanmu sudah tersimpan.');
    }
}
