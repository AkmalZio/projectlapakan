<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isSeller()) {
            return redirect()->route('seller.dashboard');
        }

        $favoriteProducts = Favorite::with('product')
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->filter(fn (Favorite $favorite) => $favorite->product !== null)
            ->map(fn (Favorite $favorite) => [
                'id' => $favorite->product->id,
                'product_id' => $favorite->product_id,
                'name' => $favorite->product->name,
                'slug' => $favorite->product->slug,
                'image' => $favorite->product->image,
                'price' => $favorite->product->base_price,
            ])
            ->values();

        $favoriteCount = $favoriteProducts->count();

        $averageRating = Review::where('user_id', $user->id)->avg('rating');

        return Inertia::render('Dashboard', [
            'favoriteCount' => $favoriteCount,
            'favoriteProducts' => $favoriteProducts,
            'ratingAverage' => $averageRating ? round((float) $averageRating, 1) : 0.0,
            'ordersCount' => $user->orders()->count(),
            'auth' => [
                'user' => $user,
            ],
        ]);
    }
}
