<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class AdminDashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_lists_orders_from_all_stores_and_their_details(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create();
        $otherMerchant = User::factory()->create(['role' => 'merchant']);
        $store = $this->createStore($admin, 'Toko Admin');
        $otherStore = $this->createStore($otherMerchant, 'Toko Lain');
        $order = $this->createOrder($store, $buyer, 'INV-ADMIN-001', 'confirmed');
        $order->update(['greeting_card_message' => 'Selamat ulang tahun!']);
        $this->createOrder($otherStore, $buyer, 'INV-OTHER-001');
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->createProduct($store)->id,
            'product_name' => 'Brownies Cokelat',
            'price' => 75000,
            'quantity' => 2,
            'subtotal' => 150000,
            'cake_text' => 'Selamat!',
            'custom_request' => 'Tanpa kacang',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('isPlatformAdmin', true)
            ->where('stats.total_orders', 2)
            ->where('stats.processing_orders', 1)
            ->where('orders.total', 2)
            ->where('orders.data', function ($orders) use ($buyer) {
                $orders = collect($orders)->keyBy('order_number');
                $adminOrder = $orders->get('INV-ADMIN-001');
                $otherOrder = $orders->get('INV-OTHER-001');

                return $adminOrder !== null
                    && $otherOrder !== null
                    && data_get($otherOrder, 'store.name') === 'Toko Lain'
                    && data_get($adminOrder, 'user.name') === $buyer->name
                    && data_get($adminOrder, 'items.0.product_name') === 'Brownies Cokelat'
                    && data_get($adminOrder, 'items.0.cake_text') === 'Selamat!'
                    && data_get($adminOrder, 'items.0.custom_request') === 'Tanpa kacang'
                    && data_get($adminOrder, 'greeting_card_message') === 'Selamat ulang tahun!';
            })
        );
    }

    public function test_admin_can_filter_orders_from_all_stores_by_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $adminStore = $this->createStore($admin, 'Toko Admin');
        $merchantStore = $this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Merchant');
        $this->createOrder($adminStore, User::factory()->create(), 'INV-PENDING-001', 'pending');
        $this->createOrder($merchantStore, User::factory()->create(), 'INV-COMPLETED-001', 'completed');

        $this->actingAs($admin)
            ->get(route('admin.dashboard', ['status' => 'completed']))
            ->assertInertia(fn ($page) => $page
                ->where('orderStatusFilter', 'completed')
                ->where('orders.total', 1)
                ->where('orders.data.0.order_number', 'INV-COMPLETED-001')
            );
    }

    public function test_admin_dashboard_returns_not_found_for_unknown_order_status_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('admin.dashboard', ['status' => 'delivered']))
            ->assertNotFound();
    }

    public function test_admin_can_update_status_of_an_order_from_any_store(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $merchantStore = $this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Merchant');
        $order = $this->createOrder($merchantStore, User::factory()->create(), 'INV-STATUS-001');

        $response = $this->actingAs($admin)
            ->from(route('admin.dashboard', ['status' => 'baking']))
            ->patch(route('admin.orders.update-status', $order), [
                'status' => 'baking',
            ]);

        $response->assertRedirect(route('admin.dashboard', ['status' => 'baking']));
        $response->assertSessionHas('success', 'Status pesanan berhasil diperbarui.');
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'baking',
        ]);

        $this->get(route('admin.dashboard', ['status' => 'baking']))
            ->assertInertia(fn ($page) => $page
                ->where('orderStatusFilter', 'baking')
                ->where('orders.total', 1)
                ->where('orders.data.0.order_number', 'INV-STATUS-001')
                ->where('orders.data.0.status', 'baking')
            );
    }

    public function test_merchant_cannot_update_an_order_from_another_store(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $this->createStore($merchant, 'Toko Merchant');
        $otherStore = $this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Lain');
        $order = $this->createOrder($otherStore, User::factory()->create(), 'INV-OTHER-002');

        $response = $this->actingAs($merchant)
            ->patch(route('admin.orders.update-status', $order), [
                'status' => 'completed',
            ]);

        $response->assertNotFound();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_cannot_set_an_order_to_an_unknown_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $store = $this->createStore($admin, 'Toko Admin');
        $order = $this->createOrder($store, User::factory()->create(), 'INV-STATUS-002');

        $response = $this->actingAs($admin)
            ->from(route('admin.dashboard'))
            ->patch(route('admin.orders.update-status', $order), [
                'status' => 'delivered',
            ]);

        $response->assertRedirect(route('admin.dashboard'));
        $response->assertSessionHasErrors('status');
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_cannot_probe_another_store_order_with_an_invalid_status(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $this->createStore($merchant, 'Toko Merchant');
        $otherStore = $this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Lain');
        $order = $this->createOrder($otherStore, User::factory()->create(), 'INV-OTHER-003');

        $this->actingAs($merchant)
            ->patch(route('admin.orders.update-status', $order), ['status' => 'delivered'])
            ->assertNotFound();
    }

    #[TestWith(['completed'])]
    #[TestWith(['cancelled'])]
    public function test_admin_cannot_change_an_order_with_a_final_status(string $finalStatus): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $store = $this->createStore($admin, 'Toko Admin');
        $order = $this->createOrder($store, User::factory()->create(), 'INV-FINAL-001', $finalStatus);

        $response = $this->actingAs($admin)
            ->from(route('admin.dashboard'))
            ->patch(route('admin.orders.update-status', $order), ['status' => 'pending']);

        $response->assertRedirect(route('admin.dashboard'));
        $response->assertSessionHasErrors(['status' => 'Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah lagi.']);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => $finalStatus]);
    }

    public function test_cancelling_an_order_restores_stock_and_refunds_the_payment(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $store = $this->createStore($merchant, 'Toko Merchant');
        $product = $this->createProduct($store, stock: 4);
        $variant = ProductVariant::create(['product_id' => $product->id, 'type' => 'size', 'name' => '20 cm', 'stock' => 1]);
        $order = $this->createOrder($store, User::factory()->create(), 'INV-CANCEL-001', 'confirmed');
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_name' => $variant->name,
            'price' => 75000,
            'quantity' => 2,
            'subtotal' => 150000,
        ]);

        $this->actingAs($merchant)
            ->patch(route('admin.orders.update-status', $order), ['status' => 'cancelled'])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'cancelled', 'payment_status' => 'refunded']);
        $this->assertSame(6, $product->fresh()->stock);
        $this->assertSame(3, $variant->fresh()->stock);
    }

    public function test_admin_without_a_store_gets_an_empty_default_store_on_first_visit(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'name' => 'Admin LAPAKan']);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('store.name', 'Admin LAPAKan Store')
                ->where('stats.total_orders', 0)
                ->where('orders.total', 0)
            );

        $this->assertDatabaseCount('stores', 1);
        $this->assertDatabaseHas('stores', ['user_id' => $admin->id]);
    }

    public function test_checkout_order_is_monitored_and_updated_by_its_store_and_tracked_by_the_buyer(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $otherMerchant = User::factory()->create(['role' => 'merchant']);
        $buyer = User::factory()->create();
        $store = $this->createStore($merchant, 'Toko Merchant');
        $this->createStore($otherMerchant, 'Toko Lain');
        $product = $this->createProduct($store, 'Bolu Pandan', 5);
        $deliveryDate = now()->addDays(2)->format('Y-m-d');

        $this->actingAs($buyer)
            ->withSession([
                'checkout_cart' => [
                    $product->id.'_0' => [
                        'id' => $product->id.'_0',
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'price' => 75000.0,
                        'quantity' => 2,
                    ],
                ],
                'checkout_shipping' => [
                    'recipient_name' => 'Budi Santoso',
                    'recipient_phone' => '081234567890',
                    'delivery_address' => 'Jl. Mawar No. 10 Bandung',
                    'delivery_courier' => 'jne_reg',
                    'delivery_date' => $deliveryDate,
                    'delivery_time_slot' => '10:00 - 14:00',
                    'customizations' => [$store->id => ['candles_count' => 0, 'cake_text' => null]],
                ],
            ])
            ->post(route('checkout.process'), [
                'payment_method' => 'qris',
            ]);
        $order = Order::sole();

        $this->actingAs($merchant)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('stats.new_orders', 1)
                ->where('orders.total', 1)
                ->where('orders.data.0.order_number', $order->order_number)
                ->where('orders.data.0.user.name', $buyer->name)
                ->where('orders.data.0.delivery_date', $deliveryDate)
                ->where('orders.data.0.items.0.quantity', 2)
                ->where('orders.data.0.payment_status', 'paid')
            );
        $this->actingAs($otherMerchant)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page->where('orders.total', 0)->where('stats.new_orders', 0));

        $this->actingAs($merchant)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('stats.awaiting_payment_confirmation', 0)
                ->where('orders.data.0.payment_status', 'paid')
                ->where('orders.data.0.has_payment_proof', false)
                ->missing('orders.data.0.payment_proof')
            );

        $this->actingAs($merchant)
            ->from(route('admin.dashboard'))
            ->followingRedirects()
            ->patch(route('admin.orders.update-status', $order), ['status' => 'confirmed'])
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('flash.success', 'Status pesanan berhasil diperbarui.')
                ->where('stats.new_orders', 0)
                ->where('stats.processing_orders', 1)
                ->where('orders.data.0.status', 'confirmed')
            );

        $this->actingAs($buyer)
            ->get(route('orders.index'))
            ->assertInertia(fn ($page) => $page
                ->where('orders.0.order_number', $order->order_number)
                ->where('orders.0.status', 'confirmed')
            );
    }

    #[TestWith(['unpaid'])]
    #[TestWith(['pending_verification'])]
    public function test_seller_cannot_process_an_order_before_its_payment_is_confirmed(string $paymentStatus): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $order = $this->createOrder($this->createStore($merchant, 'Toko Merchant'), User::factory()->create(), 'INV-UNPAID-001', paymentStatus: $paymentStatus);

        $this->actingAs($merchant)
            ->patch(route('admin.orders.update-status', $order), ['status' => 'confirmed'])
            ->assertSessionHasErrors(['status' => 'Pesanan belum lunas. Konfirmasikan pembayaran terlebih dahulu sebelum memproses pesanan.']);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
    }

    public function test_cancelling_an_unpaid_order_keeps_it_unpaid_instead_of_refunded(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $order = $this->createOrder($this->createStore($merchant, 'Toko Merchant'), User::factory()->create(), 'INV-UNPAID-002', paymentStatus: 'unpaid');

        $this->actingAs($merchant)
            ->patch(route('admin.orders.update-status', $order), ['status' => 'cancelled'])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'cancelled', 'payment_status' => 'unpaid']);
    }

    #[TestWith(['unpaid'])]
    #[TestWith(['pending_verification'])]
    public function test_seller_can_manually_confirm_a_transfer(string $paymentStatus): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $order = $this->createOrder($this->createStore($merchant, 'Toko Merchant'), User::factory()->create(), 'INV-PROOF-001', paymentStatus: $paymentStatus);
        $this->freezeTime();

        $this->actingAs($merchant)
            ->patch(route('admin.orders.mark-paid', $order))
            ->assertSessionHas('success', 'Pembayaran pesanan INV-PROOF-001 dikonfirmasi. Pesanan siap diproses.');

        $order->refresh();
        $this->assertSame('paid', $order->payment_status);
        $this->assertSame(now()->toDateTimeString(), $order->paid_at->toDateTimeString());
        $this->assertNull($order->payment_proof);
    }

    public function test_seller_cannot_confirm_a_payment_twice(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $order = $this->createOrder($this->createStore($merchant, 'Toko Merchant'), User::factory()->create(), 'INV-PROOF-002', paymentStatus: 'paid');

        $this->actingAs($merchant)
            ->patch(route('admin.orders.mark-paid', $order))
            ->assertSessionHasErrors(['payment' => 'Pembayaran pesanan ini sudah dikonfirmasi atau pesanan tidak dapat diubah.']);

        $this->assertSame('paid', $order->fresh()->payment_status);
    }

    public function test_seller_cannot_confirm_the_payment_of_another_store_order(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $this->createStore($merchant, 'Toko Merchant');
        $order = $this->createOrder($this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Lain'), User::factory()->create(), 'INV-PROOF-004', paymentStatus: 'pending_verification');

        $this->actingAs($merchant)
            ->patch(route('admin.orders.mark-paid', $order))
            ->assertNotFound();

        $this->assertSame('pending_verification', $order->fresh()->payment_status);
    }

    public function test_customers_cannot_manually_confirm_a_payment(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);
        $order = $this->createOrder($this->createStore($merchant, 'Toko Merchant'), User::factory()->create(), 'INV-PROOF-005', paymentStatus: 'unpaid');
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->patch(route('admin.orders.mark-paid', $order))
            ->assertForbidden();

        $this->assertSame('unpaid', $order->fresh()->payment_status);
    }

    public function test_customers_cannot_access_admin_order_management(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }

    private function createStore(User $user, string $name): Store
    {
        return Store::create([
            'user_id' => $user->id,
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'city' => 'Bandung',
            'is_open' => true,
        ]);
    }

    private function createOrder(Store $store, User $buyer, string $orderNumber, string $status = 'pending', string $paymentStatus = 'paid'): Order
    {
        return Order::create([
            'order_number' => $orderNumber,
            'user_id' => $buyer->id,
            'store_id' => $store->id,
            'total_amount' => 150000,
            'status' => $status,
            'payment_status' => $paymentStatus,
            'recipient_name' => 'Penerima',
            'recipient_phone' => '081234567890',
            'delivery_address' => 'Bandung',
        ]);
    }

    private function createProduct(Store $store, string $name = 'Brownies Cokelat', int $stock = 20): Product
    {
        $category = Category::firstOrCreate(['slug' => 'kue'], [
            'name' => 'Kue',
            'icon' => 'Cake',
            'order_index' => 1,
            'is_active' => true,
        ]);

        return $store->products()->create([
            'category_id' => $category->id,
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'base_price' => 75000,
            'stock' => $stock,
            'is_active' => true,
        ]);
    }
}
