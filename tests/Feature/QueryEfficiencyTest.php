<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Favorite;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class QueryEfficiencyTest extends TestCase
{
    use RefreshDatabase;

    private User $seller;

    private User $buyer;

    private Store $store;

    private Category $category;

    private int $sequence = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seller = User::factory()->create(['role' => 'merchant']);
        $this->buyer = User::factory()->create();
        $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Toko Uji', 'slug' => 'toko-uji', 'is_open' => true]);
        $this->category = Category::create(['name' => 'Kue', 'slug' => 'kue', 'order_index' => 1, 'is_active' => true]);
    }

    /**
     * @return array<string, array{0: string, 1: string}>
     */
    public static function pages(): array
    {
        return [
            'home' => ['home', 'seller'],
            'catalog' => ['catalog', 'buyer'],
            'orders index' => ['orders.index', 'buyer'],
            'buyer dashboard' => ['dashboard', 'buyer'],
            'admin dashboard' => ['admin.dashboard', 'seller'],
            'admin products' => ['admin.products.index', 'seller'],
            'seller dashboard' => ['seller.dashboard', 'seller'],
        ];
    }

    #[DataProvider('pages')]
    public function test_query_count_does_not_grow_with_the_number_of_records(string $routeName, string $actor): void
    {
        $this->seedRecords(1);
        $user = $actor === 'seller' ? $this->seller : $this->buyer;
        $small = $this->countQueries(fn () => $this->actingAs($user)->get(route($routeName))->assertOk());

        $this->seedRecords(5);
        $large = $this->countQueries(fn () => $this->actingAs($user)->get(route($routeName))->assertOk());

        $this->assertSame($small, $large, "{$routeName} runs more queries as data grows (N+1).");
    }

    public function test_product_detail_query_count_does_not_grow_with_reviews(): void
    {
        $product = $this->seedRecords(1);
        $small = $this->countQueries(fn () => $this->get(route('product.show', $product->slug))->assertOk());

        $this->seedReviews($product, 8);
        $large = $this->countQueries(fn () => $this->get(route('product.show', $product->slug))->assertOk());

        $this->assertSame($small, $large);
    }

    public function test_order_detail_query_count_does_not_grow_with_items(): void
    {
        $order = $this->createOrder(1);
        $small = $this->countQueries(fn () => $this->actingAs($this->buyer)->get(route('orders.show', $order->order_number))->assertOk());

        $bigOrder = $this->createOrder(6);
        $large = $this->countQueries(fn () => $this->actingAs($this->buyer)->get(route('orders.show', $bigOrder->order_number))->assertOk());

        $this->assertSame($small, $large);
    }

    private function countQueries(callable $request): int
    {
        $count = 0;
        DB::listen(function () use (&$count): void {
            $count++;
        });

        $request();

        return $count;
    }

    private function seedRecords(int $amount): Product
    {
        $product = null;

        for ($i = 0; $i < $amount; $i++) {
            $product = $this->createProduct();
            $product->variants()->create(['name' => 'Besar', 'additional_price' => 10000, 'stock' => 5]);
            Favorite::create(['user_id' => $this->buyer->id, 'product_id' => $product->id]);
            $this->createOrder(2);
        }

        $this->seedReviews($product, 1);

        return $product;
    }

    private function seedReviews(Product $product, int $amount): void
    {
        for ($i = 0; $i < $amount; $i++) {
            Review::create([
                'order_id' => $this->createOrder(1)->id,
                'product_id' => $product->id,
                'user_id' => User::factory()->create()->id,
                'rating' => 5,
            ]);
        }
    }

    private function createProduct(): Product
    {
        $this->sequence++;

        return Product::create([
            'store_id' => $this->store->id,
            'category_id' => $this->category->id,
            'name' => 'Kue '.$this->sequence,
            'slug' => 'kue-'.$this->sequence,
            'base_price' => 50000,
            'stock' => 3,
            'image' => 'https://example.com/kue.jpg',
            'is_active' => true,
            'is_featured' => true,
        ]);
    }

    private function createOrder(int $itemCount): Order
    {
        $this->sequence++;

        $order = Order::create([
            'order_number' => 'LPK-QE-'.$this->sequence,
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
            'total_amount' => 60000,
            'shipping_cost' => 10000,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'payment_method' => 'BCA',
            'delivery_date' => '2026-12-01',
            'recipient_name' => 'Budi',
            'recipient_phone' => '081200000000',
            'delivery_address' => 'Jl. Mawar 1',
        ]);

        for ($i = 0; $i < $itemCount; $i++) {
            $order->items()->create([
                'product_id' => $this->createProduct()->id,
                'product_name' => 'Kue',
                'price' => 50000,
                'quantity' => 1,
                'subtotal' => 50000,
            ]);
        }

        return $order;
    }
}
