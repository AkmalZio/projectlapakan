<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display the user's order history list (Pesanan Saya).
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');

        $query = Order::with(['items.product'])
            ->where('user_id', optional(auth()->user())->id ?? 0)
            ->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->get()->map(function (Order $order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'total_amount' => $order->total_amount,
                'delivery_date' => $order->delivery_date?->format('d F Y'),
                'created_at' => $order->created_at->format('d F Y'),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                    'product_image' => $item->product?->image_url ?? null,
                ]),
                'items_count' => $order->items->count(),
            ];
        });

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'activeStatus' => $status,
        ]);
    }

    /**
     * Display order detail and tracking status page.
     */
    public function show(string $orderNumber): Response
    {
        $order = Order::with(['items.product', 'store', 'user'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }
}
