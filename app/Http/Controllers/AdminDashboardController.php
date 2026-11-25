<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
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
        $orderStatuses = Order::STATUSES;
        $status = $request->query('status', 'all');

        abort_unless(is_string($status) && in_array($status, ['all', ...$orderStatuses], true), 404);

        $orderScope = $user->isAdmin() ? Order::query() : $store->orders();
        $ordersQuery = (clone $orderScope)
            ->with([
                'store:id,name',
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
            'statusesAllowedBeforePayment' => Order::STATUSES_ALLOWED_BEFORE_PAYMENT,
            'isPlatformAdmin' => $user->isAdmin(),
            'stats' => [
                'total_products' => $store->products()->count(),
                'active_products' => $store->products()->where('is_active', true)->count(),
                'total_stock' => (int) $store->products()->sum('stock'),
                'total_orders' => (clone $orderScope)->count(),
                'new_orders' => (clone $orderScope)->where('status', 'pending')->count(),
                'awaiting_payment_confirmation' => (clone $orderScope)
                    ->whereIn('payment_status', ['unpaid', 'pending_verification'])
                    ->where('status', '!=', 'cancelled')
                    ->count(),
                'processing_orders' => (clone $orderScope)
                    ->whereIn('status', ['confirmed', 'baking', 'delivering'])
                    ->count(),
                'completed_orders' => (clone $orderScope)->where('status', 'completed')->count(),
            ],
        ]);
    }

    /**
     * Move one of the seller's orders to another status.
     *
     * Completed and cancelled orders are final, and an order cannot move past "pending" until
     * its payment is confirmed. Cancelling returns the purchased stock (see Order::cancel()).
     */
    public function updateOrderStatus(Request $request, Order $order): RedirectResponse
    {
        $this->ensureOrderBelongsToSeller($request, $order);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(Order::STATUSES)],
        ]);

        DB::transaction(function () use ($order, $validated): void {
            $lockedOrder = Order::with('items')->lockForUpdate()->findOrFail($order->id);

            if ($lockedOrder->hasFinalStatus()) {
                throw ValidationException::withMessages([
                    'status' => 'Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah lagi.',
                ]);
            }

            if (! $lockedOrder->isPaid() && ! in_array($validated['status'], Order::STATUSES_ALLOWED_BEFORE_PAYMENT, true)) {
                throw ValidationException::withMessages([
                    'status' => 'Pesanan belum lunas. Konfirmasikan pembayaran terlebih dahulu sebelum memproses pesanan.',
                ]);
            }

            if ($validated['status'] === 'cancelled') {
                $lockedOrder->cancel();

                return;
            }

            $lockedOrder->update(['status' => $validated['status']]);
        });

        return redirect()->back()->with('success', 'Status pesanan berhasil diperbarui.');
    }

    /**
     * Mark an unpaid order as paid after the seller confirms the transfer was received.
     */
    public function markPaymentReceived(Request $request, Order $order): RedirectResponse
    {
        $this->ensureOrderBelongsToSeller($request, $order);

        DB::transaction(function () use ($order): void {
            $lockedOrder = Order::lockForUpdate()->findOrFail($order->id);

            if (
                $lockedOrder->hasFinalStatus()
                || ! in_array($lockedOrder->payment_status, ['unpaid', 'pending_verification'], true)
            ) {
                throw ValidationException::withMessages([
                    'payment' => 'Pembayaran pesanan ini sudah dikonfirmasi atau pesanan tidak dapat diubah.',
                ]);
            }

            $lockedOrder->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'payment_rejection_reason' => null,
            ]);
        });

        return redirect()->back()->with('success', 'Pembayaran pesanan '.$order->order_number.' dikonfirmasi. Pesanan siap diproses.');
    }

    private function ensureOrderBelongsToSeller(Request $request, Order $order): Store
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        if ($user->isAdmin()) {
            return $user->ownedStore();
        }

        $store = $user->store()->first();

        abort_unless($store && (int) $order->store_id === (int) $store->id, 404);

        return $store;
    }
}
