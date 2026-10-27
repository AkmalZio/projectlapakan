<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_lists_only_its_store_orders_and_details(): void
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
            ->where('stats.total_orders', 1)
            ->where('stats.processing_orders', 1)
            ->where('orders.total', 1)
            ->where('orders.data.0.order_number', 'INV-ADMIN-001')
            ->where('orders.data.0.user.name', $buyer->name)
            ->where('orders.data.0.items.0.product_name', 'Brownies Cokelat')
            ->where('orders.data.0.items.0.cake_text', 'Selamat!')
            ->where('orders.data.0.items.0.custom_request', 'Tanpa kacang')
            ->where('orders.data.0.greeting_card_message', 'Selamat ulang tahun!')
        );
    }

    public function test_admin_can_filter_its_store_orders_by_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $store = $this->createStore($admin, 'Toko Admin');
        $this->createOrder($store, User::factory()->create(), 'INV-PENDING-001', 'pending');
        $this->createOrder($store, User::factory()->create(), 'INV-COMPLETED-001', 'completed');

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

    public function test_admin_can_update_status_of_its_store_order(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $store = $this->createStore($admin, 'Toko Admin');
        $order = $this->createOrder($store, User::factory()->create(), 'INV-STATUS-001');

        $response = $this->actingAs($admin)
            ->from(route('admin.dashboard'))
            ->patch(route('admin.orders.update-status', $order), [
                'status' => 'baking',
            ]);

        $response->assertRedirect(route('admin.dashboard'));
        $response->assertSessionHas('success', 'Status pesanan berhasil diperbarui.');
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'baking',
        ]);
    }

    public function test_admin_cannot_read_or_update_an_order_from_another_store(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherMerchant = User::factory()->create(['role' => 'merchant']);
        $otherStore = $this->createStore($otherMerchant, 'Toko Lain');
        $order = $this->createOrder($otherStore, User::factory()->create(), 'INV-OTHER-002');

        $response = $this->actingAs($admin)
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

    private function createOrder(Store $store, User $buyer, string $orderNumber, string $status = 'pending'): Order
    {
        return Order::create([
            'order_number' => $orderNumber,
            'user_id' => $buyer->id,
            'store_id' => $store->id,
            'total_amount' => 150000,
            'status' => $status,
            'payment_status' => 'paid',
            'recipient_name' => 'Penerima',
            'recipient_phone' => '081234567890',
            'delivery_address' => 'Bandung',
        ]);
    }

    private function createProduct(Store $store): Product
    {
        $category = Category::create([
            'name' => 'Kue',
            'slug' => 'kue',
            'icon' => 'Cake',
            'order_index' => 1,
            'is_active' => true,
        ]);

        return $store->products()->create([
            'category_id' => $category->id,
            'name' => 'Brownies Cokelat',
            'slug' => 'brownies-cokelat',
            'base_price' => 75000,
            'stock' => 20,
            'is_active' => true,
        ]);
    }
}
