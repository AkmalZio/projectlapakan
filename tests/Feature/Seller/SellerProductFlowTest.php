<?php

namespace Tests\Feature\Seller;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class SellerProductFlowTest extends TestCase
{
    use RefreshDatabase;

    private const UPLOAD_NAME = 'seller-product-flow-test';

    protected function tearDown(): void
    {
        foreach (glob(public_path('assets/images/*_'.self::UPLOAD_NAME.'.*')) as $uploadedFile) {
            unlink($uploadedFile);
        }

        parent::tearDown();
    }

    public function test_a_new_seller_product_is_visible_and_purchasable_by_buyers(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $category = $this->createCategory();

        $this->actingAs($customer)
            ->post(route('seller.register'), [
                'store_name' => 'Dapur Manis',
                'city' => 'Bandung',
                'phone' => '081234567890',
            ])
            ->assertRedirect(route('seller.dashboard'));

        $seller = $customer->fresh();

        $this->actingAs($seller)
            ->post(route('admin.products.store'), [
                'category_id' => $category->id,
                'name' => 'Brownies Lumer',
                'base_price' => 45000,
                'stock' => 7,
                'weight_grams' => '',
                'description' => '',
                'is_active' => '1',
                'is_featured' => '1',
                'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.jpg'),
            ])
            ->assertRedirect(route('admin.products.index'));

        $product = Product::sole();
        $this->assertSame($seller->store->id, $product->store_id);

        $this->actingAs($seller)
            ->get(route('admin.products.index'))
            ->assertInertia(fn ($page) => $page
                ->where('store.name', 'Dapur Manis')
                ->where('products.total', 1)
                ->where('products.data.0.name', 'Brownies Lumer')
                ->where('products.data.0.category.name', 'Bento Cake')
            );

        $this->actingAs($seller)
            ->get(route('seller.dashboard'))
            ->assertInertia(fn ($page) => $page->where('stats.active_products', 1));

        $buyer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($buyer)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page->where('featuredProducts.0.slug', $product->slug));

        $this->actingAs($buyer)
            ->get(route('catalog', ['category' => 'bento-cake']))
            ->assertInertia(fn ($page) => $page->where('products.data.0.slug', $product->slug));

        $this->actingAs($buyer)
            ->get(route('product.show', $product->slug))
            ->assertInertia(fn ($page) => $page
                ->component('ProductDetail')
                ->where('product.id', $product->id)
                ->where('product.image', $product->image)
                ->where('product.stock', 7)
                ->where('product.store.name', 'Dapur Manis')
            );

        $this->actingAs($buyer)
            ->post(route('cart.add'), [
                'product_id' => $product->id,
                'variant_id' => null,
                'quantity' => 2,
                'buy_now' => false,
            ])
            ->assertSessionHas('cart.'.$product->id.'_0.quantity', 2);

        $this->actingAs($buyer)
            ->post(route('cart.add'), [
                'product_id' => $product->id,
                'variant_id' => null,
                'quantity' => 1,
                'buy_now' => true,
            ])
            ->assertRedirect(route('checkout.shipping'));
    }

    public function test_an_inactive_seller_product_is_hidden_from_buyers(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $category = $this->createCategory();

        $this->actingAs($seller)->post(route('admin.products.store'), [
            'category_id' => $category->id,
            'name' => 'Draft Cheesecake',
            'base_price' => 60000,
            'stock' => 5,
            'is_active' => '0',
            'is_featured' => '1',
            'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.png'),
        ]);

        $product = Product::sole();
        $this->assertFalse($product->is_active);

        $this->get(route('home'))->assertInertia(fn ($page) => $page->has('featuredProducts', 0));
        $this->get(route('catalog'))->assertInertia(fn ($page) => $page->has('products.data', 0));
        $this->get(route('product.show', $product->slug))->assertNotFound();
    }

    private function createCategory(): Category
    {
        return Category::create([
            'name' => 'Bento Cake',
            'slug' => 'bento-cake',
            'icon' => 'Cake',
            'order_index' => 1,
            'is_active' => true,
        ]);
    }
}
