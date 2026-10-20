<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    /**
     * Display the marketplace landing page (Home).
     */
    public function index(): Response
    {
        $categories = Category::where('is_active', true)
            ->orderBy('order_index')
            ->get();

        $featuredProducts = Product::with(['category', 'variants'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->take(8)
            ->get();

        return Inertia::render('Home', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
        ]);
    }

    /**
     * Display the catalog page with filters and sorting.
     */
    public function catalog(Request $request): Response
    {
        $categories = Category::where('is_active', true)
            ->orderBy('order_index')
            ->get();

        $query = Product::with(['category', 'variants'])->where('is_active', true);

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all' && $request->category !== 'all-category') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Search by keyword
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', (float) $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', (float) $request->max_price);
        }

        // Sort options
        if ($request->sort === 'price_asc') {
            $query->orderBy('base_price', 'asc');
        } elseif ($request->sort === 'price_desc') {
            $query->orderBy('base_price', 'desc');
        } else {
            $query->latest();
        }

        $products = $query->paginate(12)->withQueryString();

        return Inertia::render('Catalog', [
            'categories' => $categories,
            'products' => $products,
            'filters' => [
                'category' => $request->category ?? 'all-category',
                'search' => $request->search ?? '',
                'min_price' => $request->min_price ?? 0,
                'max_price' => $request->max_price ?? 1000000,
                'sort' => $request->sort ?? 'latest',
            ],
        ]);
    }

    /**
     * Display single product detail page.
     */
    public function show(string $slug): Response
    {
        $product = Product::with(['category', 'store', 'variants', 'reviews.user'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $product->is_favorited = auth()->check() && $product->favorites()->where('user_id', auth()->id())->exists();

        $relatedProducts = Product::with('category')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->take(4)
            ->get();

        return Inertia::render('ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Display the About page.
     */
    public function about(): Response
    {
        return Inertia::render('About');
    }
}
