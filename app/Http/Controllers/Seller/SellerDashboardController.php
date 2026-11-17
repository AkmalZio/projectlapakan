<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $store = $user->ownedStore();

        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();
        $orderScope = $user->isAdmin() ? Order::query() : $store->orders();

        return Inertia::render('Seller/Dashboard', [
            'store' => $store,
            'isPlatformAdmin' => $user->isAdmin(),
            'stats' => [
                'monthly_revenue' => (clone $orderScope)
                    ->where('payment_status', 'paid')
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('created_at', [$monthStart, $monthEnd])
                    ->sum('total_amount'),
                'total_orders' => (clone $orderScope)->count(),
                'orders_to_process' => (clone $orderScope)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->count(),
                'active_products' => $store->products()->where('is_active', true)->count(),
                'low_stock_products' => $store->products()
                    ->where('is_active', true)
                    ->where('stock', '<=', 5)
                    ->count(),
            ],
            'recentOrders' => (clone $orderScope)
                ->with(['user:id,name', 'store:id,name'])
                ->latest()
                ->take(6)
                ->get(['id', 'order_number', 'store_id', 'user_id', 'status', 'total_amount', 'created_at']),
            'lowStockProducts' => $store->products()
                ->with('category:id,name')
                ->where('is_active', true)
                ->where('stock', '<=', 5)
                ->orderBy('stock')
                ->take(5)
                ->get(['id', 'category_id', 'name', 'image', 'stock']),
        ]);
    }
}
