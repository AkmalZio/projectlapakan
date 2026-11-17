<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_review_a_product_of_a_completed_order_and_it_shows_on_the_product_page(): void
    {
        $buyer = User::factory()->create(['name' => 'Sari Pembeli']);
        $product = $this->createProduct();
        $order = $this->createOrder($buyer, $product, 'completed');

        $this->actingAs($buyer)
            ->from(route('orders.show', $order->order_number))
            ->post(route('orders.reviews.store', $order->order_number), [
                'product_id' => $product->id,
                'rating' => 4,
                'comment' => 'Kuenya lembut, tidak terlalu manis.',
            ])
            ->assertRedirect(route('orders.show', $order->order_number))
            ->assertSessionHas('success', 'Terima kasih! Ulasanmu sudah tersimpan.');

        $this->assertDatabaseHas('reviews', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'user_id' => $buyer->id,
            'rating' => 4,
        ]);

        $this->get(route('product.show', $product->slug))
            ->assertInertia(fn ($page) => $page
                ->where('product.reviews_count', 1)
                ->where('product.reviews.0.comment', 'Kuenya lembut, tidak terlalu manis.')
                ->where('product.reviews.0.user.name', 'Sari Pembeli')
                ->missing('product.reviews.0.user.email')
                ->missing('product.reviews.0.user.phone')
            );

        $this->actingAs($buyer)
            ->get(route('orders.show', $order->order_number))
            ->assertInertia(fn ($page) => $page->where('reviewedProductIds', [$product->id]));
    }

    public function test_a_product_can_be_reviewed_only_once_per_order(): void
    {
        $buyer = User::factory()->create();
        $product = $this->createProduct();
        $order = $this->createOrder($buyer, $product, 'completed');
        $payload = ['product_id' => $product->id, 'rating' => 5];

        $this->actingAs($buyer)->post(route('orders.reviews.store', $order->order_number), $payload);
        $this->actingAs($buyer)
            ->post(route('orders.reviews.store', $order->order_number), $payload)
            ->assertSessionHasErrors(['rating' => 'Kamu sudah memberi ulasan untuk produk ini pada pesanan ini.']);

        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_an_order_that_is_not_completed_cannot_be_reviewed(): void
    {
        $buyer = User::factory()->create();
        $product = $this->createProduct();
        $order = $this->createOrder($buyer, $product, 'delivering');

        $this->actingAs($buyer)
            ->post(route('orders.reviews.store', $order->order_number), ['product_id' => $product->id, 'rating' => 5])
            ->assertSessionHasErrors(['rating' => 'Ulasan hanya bisa diberikan setelah pesanan selesai.']);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_a_product_that_is_not_in_the_order_cannot_be_reviewed(): void
    {
        $buyer = User::factory()->create();
        $product = $this->createProduct();
        $otherProduct = $this->createProduct('Kue Lain');
        $order = $this->createOrder($buyer, $product, 'completed');

        $this->actingAs($buyer)
            ->post(route('orders.reviews.store', $order->order_number), ['product_id' => $otherProduct->id, 'rating' => 5])
            ->assertSessionHasErrors(['product_id' => 'Produk ini tidak ada di dalam pesanan.']);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_rating_must_be_between_one_and_five(): void
    {
        $buyer = User::factory()->create();
        $product = $this->createProduct();
        $order = $this->createOrder($buyer, $product, 'completed');

        $this->actingAs($buyer)
            ->post(route('orders.reviews.store', $order->order_number), ['product_id' => $product->id, 'rating' => 6])
            ->assertSessionHasErrors(['rating' => 'Rating maksimal 5 bintang.']);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_another_user_cannot_review_someone_elses_order(): void
    {
        $product = $this->createProduct();
        $order = $this->createOrder(User::factory()->create(), $product, 'completed');

        $this->actingAs(User::factory()->create())
            ->post(route('orders.reviews.store', $order->order_number), ['product_id' => $product->id, 'rating' => 5])
            ->assertNotFound();

        $this->assertDatabaseCount('reviews', 0);
    }

    private function createProduct(string $name = 'Bolu Pandan'): Product
    {
        $store = Store::firstOrCreate(['slug' => 'toko-bolu'], [
            'user_id' => User::factory()->create(['role' => 'merchant'])->id,
            'name' => 'Toko Bolu',
            'is_open' => true,
        ]);
        $category = Category::firstOrCreate(['slug' => 'kue'], ['name' => 'Kue', 'order_index' => 1, 'is_active' => true]);

        return $store->products()->create([
            'category_id' => $category->id,
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'base_price' => 75000,
            'is_active' => true,
        ]);
    }

    private function createOrder(User $buyer, Product $product, string $status): Order
    {
        $order = Order::create([
            'order_number' => 'LPK-'.fake()->unique()->numerify('########'),
            'user_id' => $buyer->id,
            'store_id' => $product->store_id,
            'total_amount' => 92000,
            'status' => $status,
            'payment_status' => 'paid',
            'recipient_name' => 'Penerima',
            'recipient_phone' => '081234567890',
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 75000,
            'quantity' => 1,
            'subtotal' => 75000,
        ]);

        return $order;
    }
}
