<?php

namespace Tests\Feature\Seller;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerDashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_dashboard_displays_store_activity_and_metrics(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $buyer = User::factory()->create();
        $category = Category::create([
            'name' => 'Kue',
            'slug' => 'kue',
            'icon' => 'Cake',
            'description' => 'Kue',
            'order_index' => 1,
            'is_active' => true,
        ]);
        $store = Store::create([
            'user_id' => $seller->id,
            'name' => 'Toko Seller',
            'slug' => 'toko-seller',
            'is_open' => true,
        ]);
        Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Kue Cokelat',
            'slug' => 'kue-cokelat',
            'base_price' => 150000,
            'stock' => 3,
            'is_active' => true,
        ]);
        Order::create([
            'order_number' => 'INV-SELLER-001',
            'user_id' => $buyer->id,
            'store_id' => $store->id,
            'total_amount' => 150000,
            'status' => 'pending',
            'payment_status' => 'paid',
            'recipient_name' => 'Pembeli',
            'recipient_phone' => '081234567890',
        ]);

        $response = $this->actingAs($seller)->get(route('seller.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->component('Seller/Dashboard')
            ->where('store.name', 'Toko Seller')
            ->where('stats.monthly_revenue', 150000)
            ->where('stats.total_orders', 1)
            ->where('stats.orders_to_process', 1)
            ->where('stats.active_products', 1)
            ->where('stats.low_stock_products', 1)
            ->where('recentOrders.0.order_number', 'INV-SELLER-001')
            ->where('recentOrders.0.user.name', $buyer->name)
            ->where('lowStockProducts.0.name', 'Kue Cokelat')
        );
    }

    public function test_seller_dashboard_creates_a_store_for_a_seller_without_one(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);

        $response = $this->actingAs($seller)->get(route('seller.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->component('Seller/Dashboard')
            ->where('store.name', $seller->name.' Store')
            ->where('stats.total_orders', 0)
            ->where('stats.active_products', 0)
        );

        $this->assertDatabaseHas('stores', [
            'user_id' => $seller->id,
            'name' => $seller->name.' Store',
        ]);
    }

    public function test_customers_cannot_access_the_seller_dashboard(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->get(route('seller.dashboard'))
            ->assertForbidden();
    }

    public function test_guests_are_redirected_to_login_from_the_seller_dashboard(): void
    {
        $this->get(route('seller.dashboard'))
            ->assertRedirect(route('login'));
    }
}
