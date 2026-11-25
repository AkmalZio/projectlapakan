<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class OrderAccessTest extends TestCase
{
    use RefreshDatabase;

    protected User $buyer;

    protected User $seller;

    protected Store $store;

    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->buyer = User::factory()->create();
        $this->seller = User::factory()->create(['role' => 'merchant']);

        $this->store = Store::create([
            'user_id' => $this->seller->id,
            'name' => 'Toko Bolu Bunda',
            'slug' => 'toko-bolu-bunda',
            'phone' => '081234567890',
            'is_open' => true,
        ]);

        $category = Category::create([
            'name' => 'Celebration Cake',
            'slug' => 'celebration-cake',
            'order_index' => 1,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'store_id' => $this->store->id,
            'category_id' => $category->id,
            'name' => 'Bolu Pandan',
            'slug' => 'bolu-pandan',
            'base_price' => 75000,
            'image' => 'https://example.com/bolu.jpg',
            'is_active' => true,
        ]);
    }

    #[TestWith(['orders.index', false])]
    #[TestWith(['orders.show', true])]
    #[TestWith(['orders.success', true])]
    public function test_guests_are_redirected_to_login_from_order_pages(string $routeName, bool $needsOrderNumber): void
    {
        $order = $this->createOrder($this->buyer);

        $response = $this->get(route($routeName, $needsOrderNumber ? ['orderNumber' => $order->order_number] : []));

        $response->assertRedirect(route('login', absolute: false));
    }

    public function test_buyer_can_view_the_detail_of_their_own_order(): void
    {
        $order = $this->createOrder($this->buyer);

        $this->actingAs($this->buyer)
            ->get(route('orders.show', $order->order_number))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Orders/Show')
                ->where('order.order_number', $order->order_number)
                ->where('order.recipient_phone', '081299990000')
                ->where('order.store.name', 'Toko Bolu Bunda')
            );
    }

    public function test_store_owner_can_view_an_order_placed_at_their_store(): void
    {
        $order = $this->createOrder($this->buyer);

        $this->actingAs($this->seller)
            ->get(route('orders.show', $order->order_number))
            ->assertOk();
    }

    public function test_other_users_get_not_found_for_an_order_detail_they_do_not_own(): void
    {
        $order = $this->createOrder($this->buyer);
        $otherSeller = User::factory()->create(['role' => 'merchant']);
        Store::create(['user_id' => $otherSeller->id, 'name' => 'Toko Lain', 'slug' => 'toko-lain', 'is_open' => true]);

        $this->actingAs(User::factory()->create())
            ->get(route('orders.show', $order->order_number))
            ->assertNotFound();
        $this->actingAs($otherSeller)
            ->get(route('orders.show', $order->order_number))
            ->assertNotFound();
    }

    public function test_success_page_is_only_visible_to_the_buyer_who_placed_the_order(): void
    {
        $order = $this->createOrder($this->buyer);

        $this->actingAs($this->buyer)
            ->get(route('orders.success', $order->order_number))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Checkout/Success')
                ->where('order.order_number', $order->order_number)
                ->where('order.status', 'pending')
            );
        $this->actingAs(User::factory()->create())
            ->get(route('orders.success', $order->order_number))
            ->assertNotFound();
    }

    public function test_order_list_shows_only_the_buyers_orders_with_store_and_product_image(): void
    {
        $order = $this->createOrder($this->buyer);
        $this->createOrder(User::factory()->create());

        $this->actingAs($this->buyer)
            ->get(route('orders.index'))
            ->assertInertia(fn ($page) => $page
                ->component('Orders/Index')
                ->has('orders', 1)
                ->where('orders.0.order_number', $order->order_number)
                ->where('orders.0.store_name', 'Toko Bolu Bunda')
                ->where('orders.0.delivery_date', '2026-12-01')
                ->where('orders.0.items.0.product_image', 'https://example.com/bolu.jpg')
            );
    }

    public function test_order_list_shows_the_creation_date_in_the_display_timezone(): void
    {
        $order = $this->createOrder($this->buyer);
        $order->forceFill(['created_at' => '2026-11-16 20:00:00'])->save();

        $this->actingAs($this->buyer)
            ->get(route('orders.index'))
            ->assertInertia(fn ($page) => $page->where('orders.0.created_at', '2026-11-17'));
    }

    public function test_order_list_filters_by_status(): void
    {
        $this->createOrder($this->buyer, 'pending');
        $confirmedOrder = $this->createOrder($this->buyer, 'confirmed');

        $this->actingAs($this->buyer)
            ->get(route('orders.index', ['status' => 'confirmed']))
            ->assertInertia(fn ($page) => $page
                ->has('orders', 1)
                ->where('orders.0.order_number', $confirmedOrder->order_number)
                ->where('activeStatus', 'confirmed')
            );
    }

    #[TestWith(['shipped'])]
    #[TestWith(['pending\' OR 1=1'])]
    public function test_order_list_rejects_an_unknown_status_filter(string $status): void
    {
        $this->actingAs($this->buyer)
            ->get(route('orders.index', ['status' => $status]))
            ->assertNotFound();
    }

    public function test_order_list_rejects_a_status_filter_sent_as_an_array(): void
    {
        $this->actingAs($this->buyer)
            ->get('/pesanan?status[]=pending')
            ->assertNotFound();
    }

    public function test_payment_proof_is_visible_only_to_the_buyer_and_the_store_owner(): void
    {
        Storage::fake('local');
        $order = $this->createOrder($this->buyer, paymentStatus: 'pending_verification');
        $legacyProofPath = 'payment-proofs/bukti-lama.jpg';
        Storage::disk('local')->put($legacyProofPath, 'legacy proof');
        $order->update(['payment_proof' => $legacyProofPath]);

        $this->actingAs($this->buyer)->get(route('orders.payment-proof.show', $order->order_number))->assertOk();
        $this->actingAs($this->seller)->get(route('orders.payment-proof.show', $order->order_number))->assertOk();
        $this->actingAs(User::factory()->create())
            ->get(route('orders.payment-proof.show', $order->order_number))
            ->assertNotFound();
    }

    public function test_order_detail_never_exposes_the_private_proof_path(): void
    {
        $order = $this->createOrder($this->buyer, paymentStatus: 'pending_verification');
        $order->update(['payment_proof' => 'payment-proofs/rahasia.jpg']);

        $this->actingAs($this->buyer)
            ->get(route('orders.show', $order->order_number))
            ->assertInertia(fn ($page) => $page
                ->where('order.has_payment_proof', true)
                ->missing('order.payment_proof')
                ->where('isBuyer', true)
                ->has('paymentAccounts.bca')
            );
    }

    private function createOrder(User $buyer, string $status = 'pending', string $paymentStatus = 'paid'): Order
    {
        $order = Order::create([
            'order_number' => 'LPK-'.fake()->unique()->numerify('########'),
            'user_id' => $buyer->id,
            'store_id' => $this->store->id,
            'total_amount' => 92000,
            'shipping_cost' => 17000,
            'status' => $status,
            'payment_status' => $paymentStatus,
            'payment_method' => 'BCA',
            'delivery_courier' => 'SiCepat',
            'delivery_date' => '2026-12-01',
            'delivery_time_slot' => '09:00 - 12:00',
            'recipient_name' => 'Budi Santoso',
            'recipient_phone' => '081299990000',
            'delivery_address' => 'Jl. Mawar No. 10 Jakarta',
        ]);

        $order->items()->create([
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'price' => 75000,
            'quantity' => 1,
            'subtotal' => 75000,
        ]);

        return $order;
    }
}
