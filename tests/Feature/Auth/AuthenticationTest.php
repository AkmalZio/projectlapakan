<?php

namespace Tests\Feature\Auth;

use App\Models\Category;
use App\Models\Favorite;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('home', absolute: false));
    }

    public function test_admin_users_are_redirected_to_the_admin_dashboard_after_login(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }

    public function test_super_admin_users_are_redirected_to_the_super_admin_dashboard_after_login(): void
    {
        $user = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('superadmin.dashboard', absolute: false));
    }

    public function test_customer_dashboard_uses_real_favorite_and_rating_stats(): void
    {
        $user = User::factory()->create([
            'role' => 'customer',
        ]);

        $category = Category::create([
            'name' => 'Test Cake',
            'slug' => 'test-cake',
            'icon' => 'Cake',
            'description' => 'Kategori untuk test rating dan favorit.',
            'order_index' => 1,
            'is_active' => true,
        ]);

        $store = Store::create([
            'user_id' => $user->id,
            'name' => 'Toko Test',
            'slug' => 'toko-test',
            'description' => 'Toko test.',
            'phone' => '081234567890',
            'city' => 'Jakarta',
            'is_open' => true,
        ]);

        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Cake Test',
            'slug' => 'cake-test',
            'description' => 'Cake untuk test',
            'base_price' => 150000,
            'image' => 'https://example.com/cake.jpg',
            'stock' => 20,
            'weight_grams' => 500,
            'is_preorder' => false,
            'is_featured' => true,
            'is_active' => true,
            'allows_custom_message' => true,
            'includes_candles' => false,
            'includes_knife' => false,
        ]);

        $order = Order::create([
            'order_number' => 'INV-TEST-001',
            'user_id' => $user->id,
            'store_id' => $store->id,
            'total_amount' => 150000,
            'shipping_cost' => 25000,
            'status' => 'completed',
            'payment_status' => 'paid',
            'payment_method' => 'transfer',
            'delivery_type' => 'delivery',
            'recipient_name' => 'User',
            'recipient_phone' => '081234567890',
            'delivery_address' => 'Jakarta',
        ]);

        Favorite::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        Review::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => 4,
            'comment' => 'bagus',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('favoriteCount', 1)
            ->where('ratingAverage', 4)
            ->where('favoriteProducts.0.name', 'Cake Test')
            ->where('favoriteProducts.0.price', '150000.00')
        );
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
