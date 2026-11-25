<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    /**
     * Private disk and folder that hold transfer proofs. They are only served through
     * showPaymentProof(), which checks that the viewer is the buyer or the store owner.
     */
    private const PROOF_DISK = 'local';

    private const PROOF_DIRECTORY = 'payment-proofs';

    /**
     * Display the user's order history list (Pesanan Saya).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $status = $request->query('status', 'all');

        abort_unless(is_string($status) && in_array($status, ['all', ...Order::STATUSES], true), 404);

        $query = $user->orders()
            ->with(['items.product:id,image', 'store:id,name'])
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
                'store_name' => $order->store?->name,
                'delivery_date' => $order->delivery_date?->format('Y-m-d'),
                'created_at' => $order->created_at->copy()->timezone(config('lapakan.display_timezone'))->format('Y-m-d'),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                    'product_image' => $item->product?->image,
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
     *
     * Visible to the buyer who placed the order and to the owner of the store that received it;
     * everyone else gets a 404 so order numbers cannot be probed.
     */
    public function show(Request $request, string $orderNumber): Response
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $order = $this->visibleOrder($user, $orderNumber);
        $order->load(['items.product:id,name,slug,image', 'store:id,name,phone']);
        $isBuyer = (int) $order->user_id === (int) $user->id;

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'isBuyer' => $isBuyer,
            'paymentAccounts' => config('lapakan.payment_accounts'),
            'reviewedProductIds' => $isBuyer
                ? $order->reviews()->where('user_id', $user->id)->pluck('product_id')->all()
                : [],
        ]);
    }

    /**
     * Stream the transfer proof to the buyer or the owner of the store that received the order.
     */
    public function showPaymentProof(Request $request, string $orderNumber): StreamedResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $order = $this->visibleOrder($user, $orderNumber);

        abort_unless($order->payment_proof && Storage::disk(self::PROOF_DISK)->exists($order->payment_proof), 404);

        return Storage::disk(self::PROOF_DISK)->response($order->payment_proof, headers: [
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * The order with this number, if the user is its buyer or owns the store that received it.
     */
    private function visibleOrder(User $user, string $orderNumber): Order
    {
        return Order::query()
            ->where('order_number', $orderNumber)
            ->where(fn (Builder $query) => $query
                ->where('user_id', $user->id)
                ->orWhereHas('store', fn (Builder $store) => $store->where('user_id', $user->id)))
            ->firstOrFail();
    }
}
