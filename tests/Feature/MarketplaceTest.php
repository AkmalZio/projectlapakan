<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
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
            'user_id' => User::factory()->create(['role' => 'merchant'])->id,
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
            'gallery' => ['https://example.com/cake-detail.jpg'],
            'shelf_life_days' => 5,
            'stock' => 10,
            'is_featured' => true,
            'is_active' => true,
            'allows_custom_message' => true,
        ]);
    }

    public function test_home_page_can_be_rendered(): void
    {
        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('Home')
            ->where('featuredProducts.0.image', 'https://example.com/cake.jpg')
        );
    }

    public function test_catalog_page_can_be_rendered(): void
    {
        $response = $this->get('/katalog');
        $response->assertStatus(200);
    }

    public function test_product_detail_can_be_rendered(): void
    {
        $response = $this->get('/product/'.$this->product->slug);

        $response->assertInertia(fn ($page) => $page
            ->component('ProductDetail')
            ->where('product.gallery.0', 'https://example.com/cake-detail.jpg')
        );
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
            'checkout_shipping' => ['customizations' => [$this->store->id => ['candles_count' => 3, 'cake_text' => null]]],
        ]);

        $this->get('/checkout')->assertInertia(fn ($page) => $page
            ->where('stores.0.store_id', $this->store->id)
            ->where('stores.0.candles_count', 3)
            ->where('shippingData.customizations.'.$this->store->id.'.candles_count', 3)
            ->where('candleUnitPrice', 3000)
            ->where('candleCost', 9000)
            ->where('shippingCouriers.jnt_express.name', 'J&T Express')
            ->where('shippingCouriers.jne_reg.estimate', '2-4 hari')
            ->where('shippingCouriers.sicepat_reg.cost', 17000)
            ->where('shippingCouriers.pos_reguler.cost', 15000)
            ->where('shippingCost', 20000)
            ->where('total', 309000)
        );
    }

    public function test_shipping_step_saves_courier_and_updated_item_quantities(): void
    {
        $cart = [
            $this->product->id.'_0' => [
                'id' => $this->product->id.'_0',
                'product_id' => $this->product->id,
                'name' => $this->product->name,
                'price' => 280000,
                'quantity' => 1,
            ],
        ];

        $this->actingAs($this->user)->withSession(['checkout_cart' => $cart]);

        $response = $this->post('/checkout/shipping', [
            'recipient_name' => 'Budi Santoso',
            'recipient_phone' => '081234567890',
            'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
            'delivery_courier' => 'sicepat_reg',
            'delivery_date' => now()->addDays(2)->format('Y-m-d'),
            'delivery_time_slot' => '09:00 - 12:00',
            'customizations' => [$this->store->id => ['candles_count' => 1, 'cake_text' => '']],
            'quantities' => [$this->product->id.'_0' => 2],
        ]);

        $response->assertRedirect(route('checkout.payment', absolute: false));
        $this->assertSame(2, session('checkout_cart')[$this->product->id.'_0']['quantity']);
        $this->assertSame('sicepat_reg', session('checkout_shipping')['delivery_courier']);

        $this->get('/checkout/payment')->assertInertia(fn ($page) => $page
            ->where('deliveryCourier', 'SiCepat')
            ->where('deliveryEstimate', '1-3 hari')
            ->where('shippingCost', 17000)
            ->where('subtotal', 560000)
            ->where('candleCost', 3000)
            ->where('total', 580000)
        );
    }

    public function test_shipping_rejects_an_unsupported_courier(): void
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
        ]);

        $response = $this->from('/checkout')->post('/checkout/shipping', [
            'recipient_name' => 'Budi Santoso',
            'recipient_phone' => '081234567890',
            'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
            'delivery_courier' => 'unknown_courier',
            'delivery_date' => now()->addDays(2)->format('Y-m-d'),
            'delivery_time_slot' => '09:00 - 12:00',
            'customizations' => [$this->store->id => ['candles_count' => 1]],
            'quantities' => [$this->product->id.'_0' => 1],
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors('delivery_courier');
    }

    public function test_shipping_rejects_item_quantities_above_the_checkout_limit(): void
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
        ]);

        $response = $this->from('/checkout')->post('/checkout/shipping', [
            'recipient_name' => 'Budi Santoso',
            'recipient_phone' => '081234567890',
            'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
            'delivery_courier' => 'sicepat_reg',
            'delivery_date' => now()->addDays(2)->format('Y-m-d'),
            'delivery_time_slot' => '09:00 - 12:00',
            'customizations' => [$this->store->id => ['candles_count' => 1]],
            'quantities' => [$this->product->id.'_0' => 100],
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors('quantities.'.$this->product->id.'_0');
        $this->assertSame(1, session('checkout_cart')[$this->product->id.'_0']['quantity']);
    }

    public function test_shipping_rejects_a_negative_candle_quantity(): void
    {
        $this->actingAs($this->user)->withSession(['checkout_cart' => $this->checkoutSession([$this->product])['checkout_cart']]);

        $response = $this->from('/checkout')->post('/checkout/shipping', $this->shippingPayload([
            'customizations' => [$this->store->id => ['candles_count' => -1]],
        ]));

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors(['customizations.'.$this->store->id.'.candles_count' => 'Jumlah lilin tidak boleh negatif.']);
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
        $admin = User::factory()->create(['role' => 'admin']);
        $adminStore = Store::create([
            'user_id' => $admin->id,
            'name' => 'Toko Admin',
            'slug' => 'toko-admin',
            'is_open' => true,
        ]);
        $this->product->update(['store_id' => $adminStore->id]);

        $this->actingAs($this->user);

        // Add to cart session
        $this->withSession([
            'checkout_cart' => [
                $this->product->id.'_0' => [
                    'id' => $this->product->id.'_0',
                    'product_id' => $this->product->id,
                    'name' => $this->product->name,
                    'price' => 280000,
                    'quantity' => 2,
                ],
            ],
            'checkout_shipping' => [
                'recipient_name' => 'Budi Santoso',
                'recipient_phone' => '081234567890',
                'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
                'delivery_courier' => 'sicepat_reg',
                'delivery_date' => now()->addDays(2)->format('Y-m-d'),
                'delivery_time_slot' => '09:00 - 12:00',
                'customizations' => [$adminStore->id => ['candles_count' => 2, 'cake_text' => 'Happy 25th!']],
            ],
        ]);
        $this->freezeTime();

        $response = $this->post('/checkout/process', [
            'payment_method' => 'bca',
        ]);

        $this->assertDatabaseHas('orders', [
            'recipient_name' => 'Budi Santoso',
            'payment_method' => 'BCA',
            'delivery_courier' => 'SiCepat',
            'shipping_cost' => 17000,
            'total_amount' => 583000,
            'candles_count' => 2,
        ]);

        $order = Order::first();
        $this->assertSame($adminStore->id, $order->store_id);
        $this->assertSame(2, $order->items()->first()->quantity);
        $this->assertSame('Happy 25th!', $order->items()->first()->cake_text);
        $this->assertSame('pending', $order->status);
        $this->assertSame('unpaid', $order->payment_status);
        $this->assertNull($order->paid_at);
        $this->assertSame(now()->addHours(24)->toDateTimeString(), $order->payment_due_at->toDateTimeString());
        $response->assertRedirect(route('orders.success', $order->order_number));

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('stats.total_orders', 1)
                ->where('orders.total', 1)
                ->where('orders.data.0.order_number', $order->order_number)
            );
    }

    public function test_cake_text_and_candles_go_only_to_the_order_of_the_store_they_were_chosen_for(): void
    {
        $cookieStore = $this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Cookies');
        $cookies = $this->createProduct($cookieStore, 'Cookies Renyah', 40000);
        $brownies = $this->createProduct($this->store, 'Brownies Polos', 50000);
        $brownies->update(['allows_custom_message' => false]);
        $session = $this->checkoutSession([$this->product, $brownies, $cookies], customizations: [
            $this->store->id => ['candles_count' => 3, 'cake_text' => 'Selamat Ulang Tahun'],
            $cookieStore->id => ['candles_count' => 0, 'cake_text' => null],
        ]);

        $this->actingAs($this->user)->withSession($session);

        $this->get('/checkout/payment')->assertInertia(fn ($page) => $page
            ->where('stores.0.store_name', 'Artisan Cake Shop')
            ->where('stores.0.candles_count', 3)
            ->where('stores.0.cake_text', 'Selamat Ulang Tahun')
            ->where('stores.0.total', 280000 + 50000 + 17000 + 9000)
            ->where('stores.1.store_name', 'Toko Cookies')
            ->where('stores.1.candles_count', 0)
            ->where('stores.1.total', 40000 + 17000)
            ->where('total', 280000 + 50000 + 40000 + 34000 + 9000)
        );

        $this->post('/checkout/process', ['payment_method' => 'bca']);

        $cakeOrder = Order::where('store_id', $this->store->id)->sole();
        $cookieOrder = Order::where('store_id', $cookieStore->id)->sole();
        $this->assertSame(3, $cakeOrder->candles_count);
        $this->assertSame('356000.00', $cakeOrder->total_amount);
        $this->assertSame('Selamat Ulang Tahun', $cakeOrder->items()->where('product_id', $this->product->id)->value('cake_text'));
        $this->assertNull($cakeOrder->items()->where('product_id', $brownies->id)->value('cake_text'));
        $this->assertSame(0, $cookieOrder->candles_count);
        $this->assertNull($cookieOrder->items()->value('cake_text'));
    }

    public function test_shipping_rejects_customizations_for_a_store_that_is_not_in_the_cart(): void
    {
        $this->actingAs($this->user)->withSession(['checkout_cart' => $this->checkoutSession([$this->product])['checkout_cart']]);

        $response = $this->from('/checkout')->post('/checkout/shipping', $this->shippingPayload([
            'customizations' => [$this->store->id + 99 => ['candles_count' => 1]],
        ]));

        $response->assertSessionHasErrors(['customizations' => 'Data kustomisasi kue tidak valid. Muat ulang halaman dan coba lagi.']);
        $this->assertNull(session('checkout_shipping'));
    }

    public function test_a_seller_cannot_add_its_own_product_to_the_cart(): void
    {
        $owner = $this->store->user;

        $this->actingAs($owner)
            ->from(route('product.show', $this->product->slug))
            ->post('/cart/add', ['product_id' => $this->product->id, 'quantity' => 1, 'buy_now' => true])
            ->assertRedirect(route('product.show', $this->product->slug))
            ->assertSessionHas('error', 'Anda tidak dapat membeli produk dari toko Anda sendiri.');

        $this->assertNull(session('cart'));
        $this->assertNull(session('checkout_cart'));
    }

    public function test_a_seller_cannot_check_out_its_own_product(): void
    {
        $this->actingAs($this->store->user)->withSession($this->checkoutSession([$this->product]));

        $response = $this->from('/checkout/payment')->post('/checkout/process', ['payment_method' => 'bca']);

        $response->assertSessionHasErrors(['cart' => 'Anda tidak dapat membeli produk dari toko Anda sendiri. Hapus "Chocolate Drip Cake" dari keranjang lalu coba lagi.']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_product_page_tells_the_owner_it_is_their_own_product(): void
    {
        $this->actingAs($this->store->user)
            ->get(route('product.show', $this->product->slug))
            ->assertInertia(fn ($page) => $page->where('product.is_own_product', true));

        $this->actingAs($this->user)
            ->get(route('product.show', $this->product->slug))
            ->assertInertia(fn ($page) => $page->where('product.is_own_product', false));
    }

    public function test_cart_page_counts_the_stores_that_will_ship_separately(): void
    {
        $otherProduct = $this->createProduct($this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Kedua'), 'Cookies', 40000);

        $this->withSession(['cart' => $this->checkoutSession([$this->product, $otherProduct])['checkout_cart']])
            ->get(route('cart.index'))
            ->assertInertia(fn ($page) => $page
                ->where('storeCount', 2)
                ->where('subtotal', 320000)
            );
    }

    public function test_checkout_order_belongs_to_the_product_store_and_appears_on_its_seller_dashboard(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $sellerStore = $this->createStore($seller, 'Toko Penjual Baru');
        $sellerProduct = $this->createProduct($sellerStore, 'Brownies Penjual Baru', 50000);
        $buyer = User::factory()->create();

        $this->actingAs($buyer)->withSession($this->checkoutSession([$sellerProduct]));
        $this->post('/checkout/process', ['payment_method' => 'qris']);

        $order = Order::sole();
        $this->assertSame($sellerStore->id, $order->store_id);

        $this->actingAs($seller)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('stats.new_orders', 1)
                ->where('orders.total', 1)
                ->where('orders.data.0.order_number', $order->order_number)
                ->where('orders.data.0.items.0.product_name', 'Brownies Penjual Baru')
            );
    }

    public function test_checkout_splits_a_multi_store_cart_into_one_order_per_store(): void
    {
        $otherStore = $this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Kedua');
        $otherProduct = $this->createProduct($otherStore, 'Cookies Toko Kedua', 40000);

        $this->actingAs(User::factory()->create())->withSession($this->checkoutSession([$this->product, $otherProduct], customizations: [
            $this->store->id => ['candles_count' => 2, 'cake_text' => null],
            $otherStore->id => ['candles_count' => 0, 'cake_text' => null],
        ]));

        $this->get('/checkout/payment')->assertInertia(fn ($page) => $page
            ->where('storeCount', 2)
            ->where('shippingCost', 34000)
            ->where('total', 280000 + 40000 + 34000 + 6000)
        );

        $response = $this->post('/checkout/process', ['payment_method' => 'bca']);

        $response->assertRedirect(route('orders.index'));
        $this->assertDatabaseCount('orders', 2);
        $this->assertDatabaseHas('orders', ['store_id' => $this->store->id, 'total_amount' => 280000 + 17000 + 6000, 'candles_count' => 2]);
        $this->assertDatabaseHas('orders', ['store_id' => $otherStore->id, 'total_amount' => 40000 + 17000, 'candles_count' => 0]);
    }

    public function test_checkout_decrements_the_stock_of_purchased_products(): void
    {
        $this->product->update(['stock' => 5]);

        $this->actingAs($this->user)->withSession($this->checkoutSession([$this->product], quantity: 3));
        $this->post('/checkout/process', ['payment_method' => 'bca']);

        $this->assertSame(2, $this->product->fresh()->stock);
    }

    public function test_checkout_rejects_a_quantity_above_the_remaining_stock(): void
    {
        $this->product->update(['stock' => 1]);

        $this->actingAs($this->user)->withSession($this->checkoutSession([$this->product], quantity: 2));
        $response = $this->from('/checkout/payment')->post('/checkout/process', ['payment_method' => 'bca']);

        $response->assertRedirect('/checkout/payment');
        $response->assertSessionHasErrors(['cart' => 'Stok "Chocolate Drip Cake" tersisa 1. Kurangi jumlah pesanan lalu coba lagi.']);
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(1, $this->product->fresh()->stock);
    }

    public function test_checkout_rejects_a_product_that_was_deactivated(): void
    {
        $this->product->update(['is_active' => false]);

        $this->actingAs($this->user)->withSession($this->checkoutSession([$this->product]));
        $response = $this->from('/checkout/payment')->post('/checkout/process', ['payment_method' => 'bca']);

        $response->assertSessionHasErrors(['cart' => 'Produk "Chocolate Drip Cake" sudah tidak tersedia. Hapus dari keranjang lalu coba lagi.']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_shipping_form_defaults_to_an_offered_time_slot_and_the_saved_address(): void
    {
        $this->user->update(['address' => 'Jl. Kenanga No. 5 Bogor']);

        $this->actingAs($this->user)->withSession(['checkout_cart' => $this->checkoutSession([$this->product])['checkout_cart']]);

        $this->get('/checkout')->assertInertia(fn ($page) => $page
            ->where('shippingData.delivery_time_slot', '09:00 - 12:00')
            ->where('deliveryTimeSlots.09:00 - 12:00', 'Pagi (09:00 - 12:00 WIB)')
            ->where('shippingData.delivery_address', 'Jl. Kenanga No. 5 Bogor')
        );
    }

    public function test_shipping_reports_missing_required_fields_in_indonesian(): void
    {
        $this->actingAs($this->user)->withSession(['checkout_cart' => $this->checkoutSession([$this->product])['checkout_cart']]);

        $response = $this->from('/checkout')->post('/checkout/shipping', []);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors([
            'recipient_name' => 'Nama penerima wajib diisi.',
            'recipient_phone' => 'Nomor WhatsApp wajib diisi.',
            'delivery_address' => 'Alamat pengiriman wajib diisi.',
            'delivery_date' => 'Tanggal pengiriman wajib diisi.',
            'delivery_time_slot' => 'Pilih slot waktu pengiriman.',
        ]);
    }

    public function test_shipping_rejects_a_time_slot_that_is_not_offered(): void
    {
        $this->actingAs($this->user)->withSession(['checkout_cart' => $this->checkoutSession([$this->product])['checkout_cart']]);

        $response = $this->from('/checkout')->post('/checkout/shipping', $this->shippingPayload(['delivery_time_slot' => '10:00 - 14:00']));

        $response->assertSessionHasErrors(['delivery_time_slot' => 'Slot waktu yang dipilih tidak tersedia.']);
        $this->assertNull(session('checkout_shipping'));
    }

    public function test_shipping_rejects_more_candles_than_the_limit(): void
    {
        $this->actingAs($this->user)->withSession(['checkout_cart' => $this->checkoutSession([$this->product])['checkout_cart']]);

        $response = $this->from('/checkout')->post('/checkout/shipping', $this->shippingPayload(['customizations' => [$this->store->id => ['candles_count' => 101]]]));

        $response->assertSessionHasErrors(['customizations.'.$this->store->id.'.candles_count' => 'Jumlah lilin maksimal 100.']);
    }

    public function test_checkout_rejects_variants_that_together_exceed_the_product_stock(): void
    {
        $this->product->update(['stock' => 3]);
        $small = $this->product->variants()->create(['name' => '16 cm', 'additional_price' => 0, 'stock' => 10]);
        $large = $this->product->variants()->create(['name' => '20 cm', 'additional_price' => 0, 'stock' => 10]);
        $session = $this->checkoutSession([]);
        $session['checkout_cart'] = [
            $this->product->id.'_'.$small->id => $this->variantCartItem($small, 2),
            $this->product->id.'_'.$large->id => $this->variantCartItem($large, 2),
        ];

        $this->actingAs($this->user)->withSession($session);
        $response = $this->from('/checkout/payment')->post('/checkout/process', ['payment_method' => 'bca']);

        $response->assertSessionHasErrors(['cart' => 'Stok "Chocolate Drip Cake" tersisa 3. Kurangi jumlah pesanan lalu coba lagi.']);
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(3, $this->product->fresh()->stock);
    }

    public function test_checkout_rejects_a_variant_that_does_not_belong_to_the_product(): void
    {
        $otherProduct = $this->createProduct($this->store, 'Red Velvet', 150000);
        $foreignVariant = $otherProduct->variants()->create(['name' => '24 cm', 'additional_price' => 0, 'stock' => 10]);
        $session = $this->checkoutSession([$this->product]);
        $session['checkout_cart'][$this->product->id.'_0']['variant_id'] = $foreignVariant->id;

        $this->actingAs($this->user)->withSession($session);
        $response = $this->from('/checkout/payment')->post('/checkout/process', ['payment_method' => 'bca']);

        $response->assertSessionHasErrors(['cart' => 'Produk "Chocolate Drip Cake" sudah tidak tersedia. Hapus dari keranjang lalu coba lagi.']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_rejects_a_stale_price_and_the_payment_summary_shows_the_current_price(): void
    {
        $session = $this->checkoutSession([$this->product]);
        $session['checkout_cart'][$this->product->id.'_0']['price'] = 250000;

        $this->actingAs($this->user)->withSession($session);
        $response = $this->from('/checkout/payment')->post('/checkout/process', ['payment_method' => 'bca']);

        $response->assertSessionHasErrors(['cart' => 'Harga "Chocolate Drip Cake" baru saja berubah. Periksa kembali total pembayaran lalu konfirmasi ulang.']);
        $this->assertDatabaseCount('orders', 0);
        $this->get('/checkout/payment')->assertInertia(fn ($page) => $page
            ->where('subtotal', 280000)
            ->where('total', 280000 + 17000)
        );
    }

    public function test_cart_checkout_removes_only_the_purchased_items_from_the_cart(): void
    {
        $otherProduct = $this->createProduct($this->store, 'Red Velvet', 150000);
        $session = $this->checkoutSession([$this->product]);
        $otherItem = $this->checkoutSession([$otherProduct])['checkout_cart'];

        $this->actingAs($this->user)->withSession([
            ...$session,
            'checkout_source' => 'cart',
            'cart' => [...$session['checkout_cart'], ...$otherItem],
        ]);
        $this->post('/checkout/process', ['payment_method' => 'bca']);

        $this->assertDatabaseCount('orders', 1);
        $this->assertSame(array_keys($otherItem), array_keys(session('cart')));
        $this->assertNull(session('checkout_source'));
    }

    public function test_buy_now_checkout_keeps_the_main_cart_untouched(): void
    {
        $cartProduct = $this->createProduct($this->store, 'Red Velvet', 150000);
        $cart = $this->checkoutSession([$this->product, $cartProduct])['checkout_cart'];

        $this->actingAs($this->user)->withSession(['cart' => $cart]);
        $this->post('/cart/add', ['product_id' => $this->product->id, 'quantity' => 1, 'buy_now' => true]);
        $this->withSession(['checkout_shipping' => $this->checkoutSession([])['checkout_shipping']]);
        $this->post('/checkout/process', ['payment_method' => 'bca']);

        $this->assertDatabaseHas('order_items', ['product_id' => $this->product->id]);
        $this->assertSame(array_keys($cart), array_keys(session('cart')));
    }

    public function test_multi_store_checkout_success_message_is_shown_on_the_order_list(): void
    {
        $otherStore = $this->createStore(User::factory()->create(['role' => 'merchant']), 'Toko Kedua');
        $otherProduct = $this->createProduct($otherStore, 'Cookies Toko Kedua', 40000);

        $this->actingAs($this->user)->withSession($this->checkoutSession([$this->product, $otherProduct]));

        $this->followingRedirects()
            ->post('/checkout/process', ['payment_method' => 'bca'])
            ->assertInertia(fn ($page) => $page
                ->component('Orders/Index')
                ->where('flash.success', 'Pesanan dibuat dan dipisah menjadi 2 pesanan sesuai toko penjual. Transfer lalu unggah bukti pembayaran di detail setiap pesanan.')
                ->has('orders', 2)
            );
    }

    public function test_adding_a_variant_of_another_product_to_the_cart_is_rejected(): void
    {
        $otherProduct = $this->createProduct($this->store, 'Red Velvet', 150000);
        $foreignVariant = $otherProduct->variants()->create(['name' => '24 cm', 'additional_price' => 500000, 'stock' => 10]);

        $response = $this->from('/product/'.$this->product->slug)->post('/cart/add', [
            'product_id' => $this->product->id,
            'variant_id' => $foreignVariant->id,
            'quantity' => 1,
        ]);

        $response->assertSessionHasErrors('variant_id');
        $this->assertNull(session('cart'));
    }

    public function test_an_inactive_product_cannot_be_added_to_the_cart(): void
    {
        $this->product->update(['is_active' => false]);

        $response = $this->from('/katalog')->post('/cart/add', ['product_id' => $this->product->id, 'quantity' => 1]);

        $response->assertRedirect('/katalog');
        $response->assertSessionHas('error', 'Produk ini sedang tidak dijual.');
        $this->assertNull(session('cart'));
    }

    public function test_adding_more_than_the_remaining_stock_to_the_cart_is_rejected(): void
    {
        $this->product->update(['stock' => 2]);
        $this->withSession(['cart' => $this->checkoutSession([$this->product])['checkout_cart']]);

        $response = $this->from('/product/'.$this->product->slug)->post('/cart/add', ['product_id' => $this->product->id, 'quantity' => 2]);

        $response->assertSessionHas('error', 'Stok "Chocolate Drip Cake" tersisa 2.');
        $this->assertSame(1, session('cart')[$this->product->id.'_0']['quantity']);
    }

    public function test_guest_buy_now_redirects_to_login_and_returns_to_the_product_afterwards(): void
    {
        $productUrl = route('product.show', $this->product->slug);

        $response = $this->from($productUrl)->post('/cart/add', [
            'product_id' => $this->product->id,
            'quantity' => 1,
            'buy_now' => true,
        ]);

        $response->assertRedirect(route('login', absolute: false));
        $response->assertSessionHas('url.intended', $productUrl);
        $this->assertNull(session('checkout_cart'));
    }

    public function test_cart_quantity_cannot_be_updated_above_the_maximum(): void
    {
        $this->withSession(['cart' => $this->checkoutSession([$this->product])['checkout_cart']]);

        $response = $this->from('/cart')->patch('/cart/'.$this->product->id.'_0', ['quantity' => 100]);

        $response->assertSessionHasErrors('quantity');
        $this->assertSame(1, session('cart')[$this->product->id.'_0']['quantity']);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function shippingPayload(array $overrides = []): array
    {
        return [
            'recipient_name' => 'Budi Santoso',
            'recipient_phone' => '081234567890',
            'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
            'delivery_courier' => 'sicepat_reg',
            'delivery_date' => now()->addDays(2)->format('Y-m-d'),
            'delivery_time_slot' => '09:00 - 12:00',
            'customizations' => [$this->store->id => ['candles_count' => 1, 'cake_text' => '']],
            'quantities' => [$this->product->id.'_0' => 1],
            ...$overrides,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function variantCartItem(ProductVariant $variant, int $quantity): array
    {
        return [
            'id' => $this->product->id.'_'.$variant->id,
            'product_id' => $this->product->id,
            'variant_id' => $variant->id,
            'name' => $this->product->name,
            'variant_name' => $variant->name,
            'price' => 280000.0,
            'quantity' => $quantity,
        ];
    }

    /**
     * @param  list<Product>  $products
     * @param  array<int, array{candles_count: int, cake_text?: string|null}>  $customizations  keyed by store id
     * @return array{checkout_cart: array<string, array<string, mixed>>, checkout_shipping: array<string, mixed>}
     */
    private function checkoutSession(array $products, int $quantity = 1, array $customizations = []): array
    {
        $cart = [];

        foreach ($products as $product) {
            $cart[$product->id.'_0'] = [
                'id' => $product->id.'_0',
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->base_price,
                'quantity' => $quantity,
            ];
        }

        return [
            'checkout_cart' => $cart,
            'checkout_shipping' => [
                'recipient_name' => 'Budi Santoso',
                'recipient_phone' => '081234567890',
                'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
                'delivery_courier' => 'sicepat_reg',
                'delivery_date' => now()->addDays(2)->format('Y-m-d'),
                'delivery_time_slot' => '09:00 - 12:00',
                'customizations' => $customizations,
            ],
        ];
    }

    private function createStore(User $owner, string $name): Store
    {
        return Store::create([
            'user_id' => $owner->id,
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'is_open' => true,
        ]);
    }

    private function createProduct(Store $store, string $name, int $price): Product
    {
        return Product::create([
            'store_id' => $store->id,
            'category_id' => $this->category->id,
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'base_price' => $price,
            'stock' => 10,
            'image' => 'https://example.com/product.jpg',
            'is_active' => true,
        ]);
    }
}
