<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketplaceTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Store $store;

    protected Category $category;

    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->store = Store::create([
            'user_id' => $this->user->id,
            'name' => 'Artisan Cake Shop',
            'slug' => 'artisan-cake-shop',
            'description' => 'Toko kue artisan',
            'is_open' => true,
        ]);

        $this->category = Category::create([
            'name' => 'Celebration Cake',
            'slug' => 'celebration-cake',
            'order_index' => 1,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'store_id' => $this->store->id,
            'category_id' => $this->category->id,
            'name' => 'Chocolate Drip Cake',
            'slug' => 'chocolate-drip-cake',
            'description' => 'Kue lezat istimewa',
            'base_price' => 280000,
            'image' => 'https://example.com/cake.jpg',
            'shelf_life_days' => 5,
            'is_featured' => true,
            'is_active' => true,
        ]);
    }

    public function test_home_page_can_be_rendered(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_catalog_page_can_be_rendered(): void
    {
        $response = $this->get('/katalog');
        $response->assertStatus(200);
    }

    public function test_product_detail_can_be_rendered(): void
    {
        $response = $this->get('/product/'.$this->product->slug);
        $response->assertStatus(200);
    }

    public function test_product_detail_does_not_show_custom_cake_text_field(): void
    {
        $response = $this->get('/product/'.$this->product->slug);

        $response->assertStatus(200)
            ->assertDontSee('Request Tulisan di Atas Kue')
            ->assertDontSee('cakeText');
    }

    public function test_guest_cannot_access_checkout_shipping(): void
    {
        $response = $this->get('/checkout');

        $response->assertRedirect(route('login', absolute: false));
    }

    public function test_buy_now_keeps_item_out_of_main_cart_session(): void
    {
        $this->actingAs($this->user);
        $this->withSession([
            'checkout_cart' => ['old_product' => ['id' => 'old_product']],
            'checkout_shipping' => ['recipient_name' => 'Penerima Lama'],
        ]);

        $response = $this->post('/cart/add', [
            'product_id' => $this->product->id,
            'quantity' => 1,
            'buy_now' => true,
        ]);

        $response->assertRedirect(route('checkout.shipping', absolute: false));
        $this->assertNull(session('cart'));
        $this->assertSame([$this->product->id.'_0'], array_keys(session('checkout_cart')));
        $this->assertNull(session('checkout_shipping'));
    }

    public function test_starting_checkout_uses_a_fresh_copy_of_the_main_cart(): void
    {
        $this->actingAs($this->user);
        $cart = [
            $this->product->id.'_0' => [
                'id' => $this->product->id.'_0',
                'product_id' => $this->product->id,
                'name' => $this->product->name,
                'price' => 280000,
                'quantity' => 1,
            ],
        ];
        $this->withSession([
            'cart' => $cart,
            'checkout_cart' => ['old_product' => ['id' => 'old_product']],
            'checkout_shipping' => ['recipient_name' => 'Penerima Lama'],
        ]);

        $response = $this->post('/checkout/start');

        $response->assertRedirect(route('checkout.shipping', absolute: false));
        $this->assertSame($cart, session('checkout_cart'));
        $this->assertNull(session('checkout_shipping'));
    }

    public function test_cancel_checkout_clears_checkout_data_and_preserves_the_main_cart(): void
    {
        $this->actingAs($this->user);
        $cart = [$this->product->id.'_0' => ['id' => $this->product->id.'_0']];
        $this->withSession([
            'cart' => $cart,
            'checkout_cart' => ['old_product' => ['id' => 'old_product']],
            'checkout_shipping' => ['recipient_name' => 'Penerima Lama'],
        ]);

        $response = $this->delete('/checkout/cancel');

        $response->assertRedirect(route('cart.index', absolute: false));
        $this->assertSame($cart, session('cart'));
        $this->assertNull(session('checkout_cart'));
        $this->assertNull(session('checkout_shipping'));
    }

    public function test_shipping_summary_includes_the_selected_candle_price(): void
    {
        $this->actingAs($this->user)->withSession([
            'checkout_cart' => [
                $this->product->id.'_0' => [
                    'id' => $this->product->id.'_0',
                    'product_id' => $this->product->id,
                    'name' => $this->product->name,
                    'price' => 280000,
                    'quantity' => 1,
                ],
            ],
            'checkout_shipping' => ['candles_count' => 3],
        ]);

        $this->get('/checkout')->assertInertia(fn ($page) => $page
            ->where('candlesCount', 3)
            ->where('candleUnitPrice', 3000)
            ->where('candleCost', 9000)
            ->where('total', 309000)
        );
    }

    public function test_shipping_rejects_a_negative_candle_quantity(): void
    {
        $this->actingAs($this->user);

        $response = $this->from('/checkout')->post('/checkout/shipping', [
            'recipient_name' => 'Budi Santoso',
            'recipient_phone' => '081234567890',
            'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
            'delivery_date' => now()->addDays(2)->format('Y-m-d'),
            'delivery_time_slot' => '10:00 - 14:00',
            'candles_count' => -1,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors('candles_count');
    }

    public function test_about_page_can_be_rendered(): void
    {
        $response = $this->get('/tentang');
        $response->assertStatus(200);
    }

    public function test_product_can_be_added_to_cart(): void
    {
        $response = $this->post('/cart/add', [
            'product_id' => $this->product->id,
            'quantity' => 2,
            'cake_text' => 'Happy Birthday!',
        ]);

        $response->assertSessionHas('cart');
        $response->assertRedirect();
    }

    public function test_order_can_be_created_from_checkout(): void
    {
        $this->actingAs($this->user);

        // Add to cart session
        $this->withSession([
            'checkout_cart' => [
                $this->product->id.'_0' => [
                    'id' => $this->product->id.'_0',
                    'product_id' => $this->product->id,
                    'name' => $this->product->name,
                    'price' => 280000,
                    'quantity' => 1,
                    'cake_text' => 'Happy 25th!',
                ],
            ],
            'checkout_shipping' => [
                'recipient_name' => 'Budi Santoso',
                'recipient_phone' => '081234567890',
                'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
                'delivery_date' => now()->addDays(2)->format('Y-m-d'),
                'delivery_time_slot' => '10:00 - 14:00',
                'cake_text' => 'Happy 25th!',
                'candles_count' => 2,
            ],
        ]);

        $response = $this->post('/checkout/process', [
            'payment_method' => 'bca',
        ]);

        $this->assertDatabaseHas('orders', [
            'recipient_name' => 'Budi Santoso',
            'payment_method' => 'BCA',
            'total_amount' => 306000,
            'candles_count' => 2,
        ]);

        $order = Order::first();
        $response->assertRedirect(route('orders.success', $order->order_number));
    }
}
