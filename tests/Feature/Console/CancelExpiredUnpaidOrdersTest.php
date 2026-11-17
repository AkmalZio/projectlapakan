<?php

namespace Tests\Feature\Console;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CancelExpiredUnpaidOrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_unpaid_orders_past_their_deadline_are_cancelled_and_their_stock_returned(): void
    {
        $this->freezeTime();
        $product = $this->createProduct(stock: 3);
        $expired = $this->createOrder($product, 'unpaid', now()->subMinute());
        $stillOpen = $this->createOrder($product, 'unpaid', now()->addHour());
        $awaitingVerification = $this->createOrder($product, 'pending_verification', now()->subHour());

        $this->artisan('orders:cancel-expired-unpaid')
            ->expectsOutput('1 pesanan yang melewati batas pembayaran dibatalkan.')
            ->assertSuccessful();

        $this->assertDatabaseHas('orders', ['id' => $expired->id, 'status' => 'cancelled', 'payment_status' => 'unpaid']);
        $this->assertDatabaseHas('orders', ['id' => $stillOpen->id, 'status' => 'pending']);
        $this->assertDatabaseHas('orders', ['id' => $awaitingVerification->id, 'status' => 'pending']);
        $this->assertSame(5, $product->fresh()->stock);
    }

    private function createProduct(int $stock): Product
    {
        $store = Store::create([
            'user_id' => User::factory()->create(['role' => 'merchant'])->id,
            'name' => 'Toko Bolu',
            'slug' => 'toko-bolu',
            'is_open' => true,
        ]);
        $category = Category::create(['name' => 'Kue', 'slug' => 'kue', 'order_index' => 1, 'is_active' => true]);

        return $store->products()->create([
            'category_id' => $category->id,
            'name' => 'Bolu Pandan',
            'slug' => 'bolu-pandan',
            'base_price' => 75000,
            'stock' => $stock,
            'is_active' => true,
        ]);
    }

    private function createOrder(Product $product, string $paymentStatus, \DateTimeInterface $paymentDueAt): Order
    {
        $order = Order::create([
            'order_number' => 'LPK-'.fake()->unique()->numerify('########'),
            'user_id' => User::factory()->create()->id,
            'store_id' => $product->store_id,
            'total_amount' => 75000,
            'status' => 'pending',
            'payment_status' => $paymentStatus,
            'payment_due_at' => $paymentDueAt,
            'recipient_name' => 'Penerima',
            'recipient_phone' => '081234567890',
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 75000,
            'quantity' => 2,
            'subtotal' => 150000,
        ]);

        return $order;
    }
}
