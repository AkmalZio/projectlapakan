<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SellerDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $store = $user->store()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $user->name.' Store',
                'slug' => Str::slug($user->name.'-store').'-'.$user->id,
                'description' => 'Toko penjualan utama dari '.$user->name,
                'phone' => $user->phone,
                'city' => 'Jakarta',
                'is_open' => true,
            ],
        );

        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        return Inertia::render('Seller/Dashboard', [
            'store' => $store,
            'stats' => [
                'monthly_revenue' => $store->orders()
                    ->where('payment_status', 'paid')
                    ->whereBetween('created_at', [$monthStart, $monthEnd])
                    ->sum('total_amount'),
                'total_orders' => $store->orders()->count(),
                'orders_to_process' => $store->orders()
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->count(),
                'active_products' => $store->products()->where('is_active', true)->count(),
                'low_stock_products' => $store->products()
                    ->where('is_active', true)
                    ->where('stock', '<=', 5)
                    ->count(),
            ],
            'recentOrders' => $store->orders()
                ->with('user:id,name')
                ->latest()
                ->take(6)
                ->get(['id', 'order_number', 'user_id', 'status', 'total_amount', 'created_at']),
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
