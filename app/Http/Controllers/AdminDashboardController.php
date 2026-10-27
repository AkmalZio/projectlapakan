<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $store = $user?->store()->first();

        if (! $store) {
            $store = $this->ensureStoreFor($user);
        }

        $products = $store->products()->with('category')->latest()->take(8)->get();
        $orderStatuses = ['pending', 'confirmed', 'baking', 'delivering', 'completed', 'cancelled'];
        $status = $request->query('status', 'all');

        abort_unless(is_string($status) && in_array($status, ['all', ...$orderStatuses], true), 404);

        $ordersQuery = $store->orders()
            ->with([
                'user:id,name',
                'items:id,order_id,product_id,product_name,variant_name,quantity,subtotal,cake_text,custom_request',
            ])
            ->latest();

        if ($status !== 'all') {
            $ordersQuery->where('status', $status);
        }

        return Inertia::render('Admin/Dashboard', [
            'store' => $store,
            'products' => $products,
            'categories' => Category::orderBy('order_index')->get(),
            'orders' => $ordersQuery->paginate(10)->withQueryString(),
            'orderStatusFilter' => $status,
            'orderStatuses' => $orderStatuses,
            'stats' => [
                'total_products' => $store->products()->count(),
                'active_products' => $store->products()->where('is_active', true)->count(),
                'total_stock' => (int) $store->products()->sum('stock'),
                'total_orders' => $store->orders()->count(),
                'new_orders' => $store->orders()->where('status', 'pending')->count(),
                'processing_orders' => $store->orders()
                    ->whereIn('status', ['confirmed', 'baking', 'delivering'])
                    ->count(),
                'completed_orders' => $store->orders()->where('status', 'completed')->count(),
            ],
            'success' => session('success'),
        ]);
    }

    public function updateOrderStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in(['pending', 'confirmed', 'baking', 'delivering', 'completed', 'cancelled']),
            ],
        ]);

        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $store = $user->store()->first();

        abort_unless($store && (int) $order->store_id === (int) $store->id, 404);

        $order->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Status pesanan berhasil diperbarui.');
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'url'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $store = $user?->store()->first() ?? $this->ensureStoreFor($user);

        $store->products()->create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.time(),
            'description' => $validated['description'] ?? 'Produk baru dari toko '.$store->name,
            'base_price' => $validated['base_price'],
            'image' => $validated['image'] ?? null,
            'stock' => $validated['stock'],
            'is_active' => $validated['is_active'] ?? true,
            'allows_custom_message' => true,
            'includes_candles' => false,
            'includes_knife' => false,
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'Produk berhasil ditambahkan.');
    }

    protected function ensureStoreFor(?User $user): Store
    {
        if (! $user) {
            abort(403);
        }

        return $user->store()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $user->name.' Store',
                'slug' => Str::slug($user->name.'-store').'-'.time(),
                'description' => 'Toko penjualan utama dari '.$user->name,
                'phone' => $user->phone,
                'city' => 'Jakarta',
                'is_open' => true,
            ],
        );
    }
}
