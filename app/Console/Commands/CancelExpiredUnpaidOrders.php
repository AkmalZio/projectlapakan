<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('orders:cancel-expired-unpaid')]
#[Description('Cancel pending orders whose transfer proof was not uploaded before the payment deadline and return their stock')]
class CancelExpiredUnpaidOrders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $cancelledCount = 0;

        Order::query()
            ->where('status', 'pending')
            ->where('payment_status', 'unpaid')
            ->where('payment_due_at', '<', now())
            ->pluck('id')
            ->each(function (int $orderId) use (&$cancelledCount): void {
                DB::transaction(function () use ($orderId, &$cancelledCount): void {
                    $order = Order::with('items')->lockForUpdate()->find($orderId);

                    // Re-check under the lock: the buyer may have uploaded a proof in the meantime.
                    if (! $order || $order->status !== 'pending' || $order->payment_status !== 'unpaid' || ! $order->payment_due_at?->isPast()) {
                        return;
                    }

                    $order->cancel();
                    $cancelledCount++;
                });
            });

        $this->info("{$cancelledCount} pesanan yang melewati batas pembayaran dibatalkan.");

        return self::SUCCESS;
    }
}
