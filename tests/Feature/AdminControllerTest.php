<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AdminControllerTest extends TestCase
{
    use RefreshDatabase;

    private const UPLOAD_NAME = 'admin-controller-test';

    protected function tearDown(): void
    {
        foreach (glob(public_path('assets/images/*_'.self::UPLOAD_NAME.'.*')) as $uploadedFile) {
            unlink($uploadedFile);
        }

        parent::tearDown();
    }

    public function test_admin_can_open_product_list(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('admin.products.index'))
            ->assertInertia(fn ($page) => $page->component('Admin/Products/Index'));
    }

    public function test_admin_can_open_create_product_form(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->createCategory();

        $this->actingAs($admin)
            ->get(route('admin.products.create'))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Products/Create')
                ->has('categories', 1)
            );
    }

    public function test_admin_can_upload_a_product_with_its_photo(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = $this->createCategory();

        $response = $this->actingAs($admin)->post(route('admin.products.store'), [
            ...$this->validProductData($category),
            'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.jpg', 600, 600),
        ]);

        $response->assertRedirect(route('admin.products.index'));
        $response->assertSessionHas('success');

        $product = Product::sole();
        $this->assertMatchesRegularExpression('#^/assets/images/\d{10}_'.self::UPLOAD_NAME.'\.jpg$#', $product->image);
        $this->assertFileExists(public_path(ltrim($product->image, '/')));
        $this->assertTrue($product->is_featured);
        $this->assertSame($admin->id, $product->store->user_id);
    }

    public function test_uploaded_product_appears_on_the_home_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = $this->createCategory();

        $this->actingAs($admin)->post(route('admin.products.store'), [
            ...$this->validProductData($category),
            'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.png'),
        ]);

        $this->get(route('home'))->assertInertia(fn ($page) => $page
            ->where('featuredProducts.0.name', 'Red Velvet Bento')
        );
    }

    public function test_upload_rejects_non_image_files(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = $this->createCategory();

        $this->actingAs($admin)
            ->post(route('admin.products.store'), [
                ...$this->validProductData($category),
                'image' => UploadedFile::fake()->create('tugas.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasErrors('image');

        $this->assertDatabaseCount('products', 0);
    }

    public function test_upload_rejects_images_larger_than_two_megabytes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = $this->createCategory();

        $this->actingAs($admin)
            ->post(route('admin.products.store'), [
                ...$this->validProductData($category),
                'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.jpg')->size(2049),
            ])
            ->assertSessionHasErrors(['image' => 'Ukuran foto maksimal 2 MB.']);

        $this->assertDatabaseCount('products', 0);
    }

    public function test_customers_cannot_manage_products(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)->get(route('admin.products.create'))->assertForbidden();
        $this->actingAs($customer)->post(route('admin.products.store'))->assertForbidden();
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

    /**
     * @return array{category_id: int, name: string, base_price: int, stock: int}
     */
    private function validProductData(Category $category): array
    {
        return [
            'category_id' => $category->id,
            'name' => 'Red Velvet Bento',
            'base_price' => 85000,
            'stock' => 12,
        ];
    }
}
