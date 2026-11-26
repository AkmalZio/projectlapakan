<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
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
        foreach (glob(public_path('assets/images/*'.self::UPLOAD_NAME.'.*')) as $uploadedFile) {
            unlink($uploadedFile);
        }

        parent::tearDown();
    }

    public function test_admin_can_open_product_list(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('admin.products.index'))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Products/Index')
                ->where('isPlatformAdmin', true)
                ->where('store.name', 'Semua toko')
            );
    }

    public function test_admin_can_list_and_edit_products_from_other_stores(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);

        $this->actingAs($admin)
            ->get(route('admin.products.index'))
            ->assertInertia(fn ($page) => $page
                ->where('products.total', 1)
                ->where('products.data.0.id', $product->id)
                ->where('products.data.0.store.name', $seller->ownedStore()->name)
            );

        $this->actingAs($admin)
            ->get(route('admin.products.edit', $product))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Products/Edit')
                ->where('product.id', $product->id)
                ->where('store.name', $seller->ownedStore()->name)
            );

        $this->actingAs($admin)
            ->patch(route('admin.products.update', $product), [
                ...$this->validProductData($product->category),
                'name' => 'Brownies Diperbarui Admin',
            ])
            ->assertRedirect(route('admin.products.index'))
            ->assertSessionHas('success', 'Produk "Brownies Diperbarui Admin" berhasil diperbarui.');

        $this->assertSame('Brownies Diperbarui Admin', $product->fresh()->name);
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
        $this->assertMatchesRegularExpression('#^/assets/images/\d{10}_[A-Za-z0-9]{6}_'.self::UPLOAD_NAME.'\.jpg$#', $product->image);
        $this->assertFileExists(public_path(ltrim($product->image, '/')));
        $this->assertTrue($product->is_featured);
        $this->assertSame($admin->id, $product->store->user_id);
    }

    public function test_admin_can_create_a_product_with_multiple_flavor_variants(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = $this->createCategory();

        $this->actingAs($admin)->post(route('admin.products.store'), [
            ...$this->validProductData($category),
            'variants' => [
                [
                    'type' => 'flavor',
                    'name' => 'Belgian Dark Choco',
                    'additional_price' => 5000,
                    'stock' => 8,
                    'image' => UploadedFile::fake()->image('belgian-flavor-'.self::UPLOAD_NAME.'.jpg'),
                ],
                ['type' => 'flavor', 'name' => 'Matcha Cream Cheese', 'additional_price' => 10000, 'stock' => 6],
                ['type' => 'flavor', 'name' => 'Taro Milk Tea', 'additional_price' => 10000, 'stock' => 5],
            ],
            'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.jpg', 600, 600),
        ])->assertRedirect(route('admin.products.index'))
            ->assertSessionHasNoErrors();

        $product = Product::sole();
        $this->assertDatabaseCount('product_variants', 3);
        $variant = $product->variants()->where('name', 'Belgian Dark Choco')->firstOrFail();
        $this->assertSame('flavor', $variant->type);
        $this->assertSame('5000.00', $variant->additional_price);
        $this->assertSame(8, $variant->stock);
        $this->assertMatchesRegularExpression(
            '#^/assets/images/\d{10}_[A-Za-z0-9]{6}_belgian-flavor-'.self::UPLOAD_NAME.'\.jpg$#',
            $variant->image,
        );
        $this->assertFileExists(public_path(ltrim($variant->image, '/')));

        $this->actingAs($admin)
            ->get(route('admin.products.edit', $product))
            ->assertInertia(fn ($page) => $page
                ->where('product.variants.0.name', 'Belgian Dark Choco')
                ->where('product.variants.0.image', $variant->image)
                ->where('product.variants.1.name', 'Matcha Cream Cheese')
                ->where('product.variants.2.name', 'Taro Milk Tea')
            );
    }

    public function test_variant_images_can_be_replaced_removed_or_deleted_with_the_variant(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);
        $replacedVariant = $product->variants()->create([
            'type' => 'flavor',
            'name' => 'Belgian Dark Choco',
            'image' => '/assets/images/old-replaced-'.self::UPLOAD_NAME.'.jpg',
            'stock' => 5,
        ]);
        $clearedVariant = $product->variants()->create([
            'type' => 'flavor',
            'name' => 'Matcha Cream Cheese',
            'image' => '/assets/images/old-cleared-'.self::UPLOAD_NAME.'.jpg',
            'stock' => 5,
        ]);
        $deletedVariant = $product->variants()->create([
            'type' => 'flavor',
            'name' => 'Taro Milk Tea',
            'image' => '/assets/images/old-deleted-'.self::UPLOAD_NAME.'.jpg',
            'stock' => 5,
        ]);
        $oldImagePaths = [
            public_path('assets/images/old-replaced-'.self::UPLOAD_NAME.'.jpg'),
            public_path('assets/images/old-cleared-'.self::UPLOAD_NAME.'.jpg'),
            public_path('assets/images/old-deleted-'.self::UPLOAD_NAME.'.jpg'),
        ];

        foreach ($oldImagePaths as $oldImagePath) {
            file_put_contents($oldImagePath, 'old variant image');
        }

        $this->actingAs($seller)->patch(route('admin.products.update', $product), [
            ...$this->validProductData($product->category),
            'variants_present' => '1',
            'variants' => [
                [
                    'id' => $replacedVariant->id,
                    'type' => 'flavor',
                    'name' => 'Belgian Dark Choco',
                    'additional_price' => 5000,
                    'stock' => 4,
                    'image' => UploadedFile::fake()->image('new-flavor-'.self::UPLOAD_NAME.'.png'),
                    'current_image' => $replacedVariant->image,
                    'preview_url' => 'blob:preview',
                    'remove_image' => '0',
                ],
                [
                    'id' => $clearedVariant->id,
                    'type' => 'flavor',
                    'name' => 'Matcha Cream Cheese',
                    'additional_price' => 10000,
                    'stock' => 3,
                    'image' => null,
                    'current_image' => $clearedVariant->image,
                    'preview_url' => null,
                    'remove_image' => '1',
                ],
            ],
        ])->assertRedirect(route('admin.products.index'))
            ->assertSessionHasNoErrors();

        $replacedVariant->refresh();
        $clearedVariant->refresh();
        $this->assertMatchesRegularExpression(
            '#^/assets/images/\d{10}_[A-Za-z0-9]{6}_new-flavor-'.self::UPLOAD_NAME.'\.png$#',
            $replacedVariant->image,
        );
        $this->assertFileExists(public_path(ltrim($replacedVariant->image, '/')));
        $this->assertNull($clearedVariant->image);
        $this->assertModelMissing($deletedVariant);

        foreach ($oldImagePaths as $oldImagePath) {
            $this->assertFileDoesNotExist($oldImagePath);
        }
    }

    public function test_variant_image_upload_rejects_non_image_files(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = $this->createCategory();

        $this->actingAs($admin)
            ->post(route('admin.products.store'), [
                ...$this->validProductData($category),
                'variants' => [
                    [
                        'type' => 'flavor',
                        'name' => 'Belgian Dark Choco',
                        'additional_price' => 0,
                        'stock' => 5,
                        'image' => UploadedFile::fake()->create('flavor.pdf', 100, 'application/pdf'),
                    ],
                ],
                'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.jpg'),
            ])
            ->assertSessionHasErrors('variants.0.image');

        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseCount('product_variants', 0);
    }

    public function test_product_creation_rejects_a_variant_without_a_name(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = $this->createCategory();

        $this->actingAs($admin)
            ->post(route('admin.products.store'), [
                ...$this->validProductData($category),
                'variants' => [
                    ['type' => 'flavor', 'name' => '', 'additional_price' => 0, 'stock' => 5],
                ],
                'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.jpg'),
            ])
            ->assertSessionHasErrors([
                'variants.0.name' => 'Nama varian wajib diisi.',
            ]);

        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseCount('product_variants', 0);
    }

    public function test_product_update_saves_edits_additions_and_removals_for_variants(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);
        $updatedVariant = $product->variants()->create([
            'type' => 'flavor',
            'name' => 'Vanilla',
            'additional_price' => 0,
            'stock' => 8,
        ]);
        $removedVariant = $product->variants()->create([
            'type' => 'flavor',
            'name' => 'Strawberry',
            'additional_price' => 5000,
            'stock' => 4,
        ]);

        $this->actingAs($seller)->patch(route('admin.products.update', $product), [
            ...$this->validProductData($product->category),
            'variants' => [
                ['id' => $updatedVariant->id, 'type' => 'flavor', 'name' => 'Belgian Dark Choco', 'additional_price' => 5000, 'stock' => 7],
                ['type' => 'flavor', 'name' => 'Taro Milk Tea', 'additional_price' => 10000, 'stock' => 3],
            ],
        ])->assertRedirect(route('admin.products.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('product_variants', [
            'id' => $updatedVariant->id,
            'name' => 'Belgian Dark Choco',
            'additional_price' => 5000,
            'stock' => 7,
        ]);
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'name' => 'Taro Milk Tea',
        ]);
        $this->assertModelMissing($removedVariant);
        $this->assertDatabaseCount('product_variants', 2);
    }

    public function test_product_update_can_remove_all_variants_when_the_form_submits_an_empty_list(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);
        $product->variants()->create([
            'type' => 'flavor',
            'name' => 'Vanilla',
            'stock' => 5,
        ]);

        $this->actingAs($seller)->patch(route('admin.products.update', $product), [
            ...$this->validProductData($product->category),
            'variants_present' => '1',
        ])->assertRedirect(route('admin.products.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('product_variants', 0);
    }

    public function test_product_update_rejects_variant_ids_from_another_product(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);
        $otherProduct = $this->createProduct(
            User::factory()->create(['role' => 'merchant']),
            'Produk Lain',
            'produk-lain',
            $product->category,
        );
        $foreignVariant = $otherProduct->variants()->create([
            'type' => 'flavor',
            'name' => 'Jangan diubah',
            'stock' => 2,
        ]);

        $this->actingAs($seller)
            ->from(route('admin.products.edit', $product))
            ->patch(route('admin.products.update', $product), [
                ...$this->validProductData($product->category),
                'variants' => [
                    ['id' => $foreignVariant->id, 'type' => 'flavor', 'name' => 'Rasa Palsu', 'additional_price' => 0, 'stock' => 2],
                ],
            ])
            ->assertRedirect(route('admin.products.edit', $product))
            ->assertSessionHasErrors('variants.0.id');

        $this->assertDatabaseHas('product_variants', [
            'id' => $foreignVariant->id,
            'name' => 'Jangan diubah',
        ]);
        $this->assertDatabaseCount('product_variants', 1);
    }

    public function test_two_products_with_the_same_name_get_distinct_slugs(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = $this->createCategory();

        foreach (range(1, 2) as $ignored) {
            $this->actingAs($admin)->post(route('admin.products.store'), [
                ...$this->validProductData($category),
                'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.jpg', 600, 600),
            ])->assertSessionHasNoErrors();
        }

        $this->assertCount(2, Product::pluck('slug')->unique());
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

    public function test_upload_requires_the_product_details_and_photo(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.products.store'), [])
            ->assertSessionHasErrors(['category_id', 'name', 'base_price', 'stock', 'image' => 'Foto produk wajib diunggah.']);

        $this->assertDatabaseCount('products', 0);
    }

    public function test_customers_cannot_manage_products(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)->get(route('admin.products.create'))->assertForbidden();
        $this->actingAs($customer)->post(route('admin.products.store'))->assertForbidden();
        $product = $this->createProduct(User::factory()->create(['role' => 'merchant']));

        $this->actingAs($customer)->delete(route('admin.products.destroy', $product))->assertForbidden();
        $this->assertModelExists($product);
    }

    public function test_seller_can_open_the_edit_form_of_its_product(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);

        $this->actingAs($seller)
            ->get(route('admin.products.edit', $product))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Products/Edit')
                ->where('product.id', $product->id)
                ->where('product.name', 'Brownies Lama')
                ->has('categories', 1)
            );
    }

    public function test_seller_can_update_its_product_without_replacing_the_photo(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);
        $newCategory = Category::create(['name' => 'Cookies', 'slug' => 'cookies', 'order_index' => 2, 'is_active' => true]);

        $response = $this->actingAs($seller)->patch(route('admin.products.update', $product), [
            'category_id' => $newCategory->id,
            'name' => 'Brownies Baru',
            'description' => 'Lebih cokelat',
            'base_price' => 99000,
            'stock' => 3,
            'weight_grams' => 400,
            'is_active' => '0',
            'is_featured' => '0',
            'image' => null,
        ]);

        $response->assertRedirect(route('admin.products.index'));
        $response->assertSessionHas('success', 'Produk "Brownies Baru" berhasil diperbarui.');
        $product->refresh();
        $this->assertSame('Brownies Baru', $product->name);
        $this->assertSame($newCategory->id, $product->category_id);
        $this->assertSame('99000.00', $product->base_price);
        $this->assertSame(3, $product->stock);
        $this->assertSame(400, $product->weight_grams);
        $this->assertFalse($product->is_active);
        $this->assertFalse($product->is_featured);
        $this->assertSame('/assets/images/old_'.self::UPLOAD_NAME.'.jpg', $product->image);
        $this->assertSame('brownies-lama', $product->slug);
    }

    public function test_uploading_a_new_photo_replaces_the_old_file(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);
        $oldPath = public_path('assets/images/old_'.self::UPLOAD_NAME.'.jpg');
        file_put_contents($oldPath, 'old photo');

        $this->actingAs($seller)->patch(route('admin.products.update', $product), [
            ...$this->validProductData($product->category),
            'image' => UploadedFile::fake()->image(self::UPLOAD_NAME.'.png'),
        ])->assertSessionHasNoErrors();

        $product->refresh();
        $this->assertMatchesRegularExpression('#^/assets/images/\d{10}_[A-Za-z0-9]{6}_'.self::UPLOAD_NAME.'\.png$#', $product->image);
        $this->assertFileExists(public_path(ltrim($product->image, '/')));
        $this->assertFileDoesNotExist($oldPath);
    }

    public function test_product_update_reports_invalid_fields_in_indonesian(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);

        $this->actingAs($seller)
            ->from(route('admin.products.edit', $product))
            ->patch(route('admin.products.update', $product), ['name' => '', 'base_price' => -1, 'stock' => 'banyak'])
            ->assertRedirect(route('admin.products.edit', $product))
            ->assertSessionHasErrors([
                'name' => 'Nama wajib diisi.',
                'category_id' => 'Pilih kategori produk.',
                'base_price' => 'Harga minimal 0.',
                'stock' => 'Stok harus berupa bilangan bulat.',
            ]);

        $this->assertSame('Brownies Lama', $product->fresh()->name);
    }

    public function test_seller_can_toggle_whether_its_product_is_shown(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);

        $this->actingAs($seller)
            ->patch(route('admin.products.toggle-active', $product))
            ->assertSessionHas('success', 'Produk "Brownies Lama" dinonaktifkan dan disembunyikan dari etalase.');
        $this->assertFalse($product->fresh()->is_active);

        $this->actingAs($seller)->patch(route('admin.products.toggle-active', $product));
        $this->assertTrue($product->fresh()->is_active);
    }

    public function test_seller_can_delete_a_product_that_was_never_ordered(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);
        $imagePath = public_path('assets/images/old_'.self::UPLOAD_NAME.'.jpg');
        $variantImagePath = public_path('assets/images/old-variant_'.self::UPLOAD_NAME.'.jpg');
        $product->variants()->create([
            'type' => 'flavor',
            'name' => 'Belgian Dark Choco',
            'image' => '/assets/images/old-variant_'.self::UPLOAD_NAME.'.jpg',
            'stock' => 5,
        ]);
        file_put_contents($imagePath, 'old photo');
        file_put_contents($variantImagePath, 'old variant photo');

        $this->actingAs($seller)
            ->delete(route('admin.products.destroy', $product))
            ->assertRedirect(route('admin.products.index'))
            ->assertSessionHas('success', 'Produk "Brownies Lama" berhasil dihapus.');

        $this->assertModelMissing($product);
        $this->assertFileDoesNotExist($imagePath);
        $this->assertFileDoesNotExist($variantImagePath);
    }

    public function test_an_ordered_product_cannot_be_deleted_so_order_history_stays_intact(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $product = $this->createProduct($seller);
        $order = Order::create([
            'order_number' => 'LPK-HISTORY-001',
            'user_id' => User::factory()->create()->id,
            'store_id' => $product->store_id,
            'total_amount' => 50000,
            'recipient_name' => 'Pembeli',
            'recipient_phone' => '081234567890',
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 50000,
            'quantity' => 1,
            'subtotal' => 50000,
        ]);

        $this->actingAs($seller)
            ->from(route('admin.products.index'))
            ->delete(route('admin.products.destroy', $product))
            ->assertRedirect(route('admin.products.index'))
            ->assertSessionHas('error', 'Produk "Brownies Lama" sudah pernah dipesan sehingga tidak dapat dihapus agar riwayat pesanan tetap utuh. Nonaktifkan produk ini untuk menyembunyikannya dari etalase.');

        $this->assertModelExists($product);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_seller_cannot_manage_a_product_of_another_store(): void
    {
        $product = $this->createProduct(User::factory()->create(['role' => 'merchant']));
        $seller = User::factory()->create(['role' => 'merchant']);

        $this->actingAs($seller)->get(route('admin.products.edit', $product))->assertNotFound();
        $this->actingAs($seller)
            ->patch(route('admin.products.update', $product), $this->validProductData($product->category))
            ->assertNotFound();
        $this->actingAs($seller)->patch(route('admin.products.toggle-active', $product))->assertNotFound();
        $this->actingAs($seller)->delete(route('admin.products.destroy', $product))->assertNotFound();

        $product->refresh();
        $this->assertSame('Brownies Lama', $product->name);
        $this->assertTrue($product->is_active);
    }

    private function createProduct(
        User $seller,
        string $name = 'Brownies Lama',
        string $slug = 'brownies-lama',
        ?Category $category = null,
    ): Product {
        return $seller->ownedStore()->products()->create([
            'category_id' => ($category ?? $this->createCategory())->id,
            'name' => $name,
            'slug' => $slug,
            'base_price' => 50000,
            'image' => '/assets/images/old_'.self::UPLOAD_NAME.'.jpg',
            'stock' => 8,
            'is_active' => true,
            'is_featured' => true,
        ]);
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
