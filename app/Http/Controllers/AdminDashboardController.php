<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $store = $user->ownedStore();

        $products = $store->products()->with('category:id,name')->latest()->take(5)->get();
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
}
