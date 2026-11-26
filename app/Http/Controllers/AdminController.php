<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Folder under public/ where product photos are stored and served from.
     */
    private const IMAGE_DIRECTORY = 'assets/images';

    public function products(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $store = $user->isAdmin() ? null : $user->ownedStore();
        $products = ($store?->products() ?? Product::query())
            ->with('category:id,name');

        if ($user->isAdmin()) {
            $products->with('store:id,name');
        }

        return Inertia::render('Admin/Products/Index', [
            'store' => $store?->only(['id', 'name']) ?? ['id' => null, 'name' => 'Semua toko'],
            'isPlatformAdmin' => $user->isAdmin(),
            'products' => $products
                ->withCount('orderItems')
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function createProduct(Request $request): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'store' => $this->storeOf($request->user())->only(['id', 'name']),
            'categories' => $this->activeCategories(),
        ]);
    }

    /**
     * Store a product and move its photo to public/assets/images with a time() prefix.
     */
    public function storeProduct(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->productRules(isImageRequired: true), $this->productMessages());

        $store = $this->storeOf($request->user());

        DB::transaction(function () use ($validated, $request, $store): void {
            $product = $store->products()->create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => (Str::slug($validated['name']) ?: 'produk').'-'.time().'-'.Str::lower(Str::random(4)),
                'description' => $validated['description'] ?? 'Produk baru dari toko '.$store->name,
                'base_price' => $validated['base_price'],
                'image' => $this->storeImage($request->file('image')),
                'stock' => $validated['stock'],
                'weight_grams' => $validated['weight_grams'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'is_featured' => $validated['is_featured'] ?? true,
                'allows_custom_message' => true,
                'includes_candles' => false,
                'includes_knife' => false,
            ]);

            $this->syncVariants($product, $validated['variants'] ?? []);
        });

        return redirect()->route('admin.products.index')->with('success', 'Produk "'.$validated['name'].'" berhasil ditambahkan.');
    }

    public function editProduct(Request $request, Product $product): Response
    {
        $this->ensureProductBelongsTo($product, $request->user());

        return Inertia::render('Admin/Products/Edit', [
            'store' => $product->store->only(['id', 'name']),
            'product' => $product->only([
                'id', 'category_id', 'name', 'slug', 'description', 'base_price', 'image',
                'stock', 'weight_grams', 'is_active', 'is_featured',
            ]) + [
                'variants' => $product->variants
                    ->map(fn (ProductVariant $variant): array => $variant->only([
                        'id', 'type', 'name', 'image', 'additional_price', 'stock',
                    ]))
                    ->values(),
            ],
            'categories' => $this->activeCategories(),
        ]);
    }

    /**
     * Update a product. The photo is optional; a new upload replaces the old file on disk.
     * The slug is kept so links that were already shared keep working.
     */
    public function updateProduct(Request $request, Product $product): RedirectResponse
    {
        $this->ensureProductBelongsTo($product, $request->user());

        $validated = $request->validate($this->productRules(isImageRequired: false, product: $product), $this->productMessages());

        $attributes = [
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'base_price' => $validated['base_price'],
            'stock' => $validated['stock'],
            'weight_grams' => $validated['weight_grams'] ?? null,
            'is_active' => $request->boolean('is_active'),
            'is_featured' => $request->boolean('is_featured'),
        ];

        $previousImage = $product->image;

        if ($request->hasFile('image')) {
            $attributes['image'] = $this->storeImage($request->file('image'));
            $attributes['gallery'] = $product->gallery
                ? array_values(array_map(fn (string $url): string => $url === $previousImage ? $attributes['image'] : $url, $product->gallery))
                : null;
        }

        $variantImagesToDelete = DB::transaction(function () use ($product, $attributes, $validated, $request): array {
            $product->update($attributes);

            if ($request->boolean('variants_present') || array_key_exists('variants', $validated)) {
                return $this->syncVariants($product, $validated['variants'] ?? []);
            }

            return [];
        });

        if (isset($attributes['image'])) {
            $this->deleteImageIfUnused($previousImage);
        }

        foreach ($variantImagesToDelete as $variantImage) {
            $this->deleteImageIfUnused($variantImage);
        }

        return redirect()->route('admin.products.index')->with('success', 'Produk "'.$product->name.'" berhasil diperbarui.');
    }

    /**
     * Switch a product between active (visible in the storefront) and inactive.
     */
    public function toggleProductActive(Request $request, Product $product): RedirectResponse
    {
        $this->ensureProductBelongsTo($product, $request->user());

        $product->update(['is_active' => ! $product->is_active]);

        return redirect()->back()->with('success', $product->is_active
            ? 'Produk "'.$product->name.'" diaktifkan dan tampil di etalase.'
            : 'Produk "'.$product->name.'" dinonaktifkan dan disembunyikan dari etalase.');
    }

    /**
     * Delete a product that was never ordered.
     *
     * order_items.product_id cascades on delete, so deleting an ordered product would erase it
     * from the buyers' and seller's order history. Ordered products must be deactivated instead.
     */
    public function destroyProduct(Request $request, Product $product): RedirectResponse
    {
        $this->ensureProductBelongsTo($product, $request->user());

        if ($product->orderItems()->exists()) {
            return redirect()->back()->with('error', 'Produk "'.$product->name.'" sudah pernah dipesan sehingga tidak dapat dihapus agar riwayat pesanan tetap utuh. Nonaktifkan produk ini untuk menyembunyikannya dari etalase.');
        }

        $image = $product->image;
        $variantImages = $product->variants()->pluck('image')->filter()->all();

        $product->delete();

        $this->deleteImageIfUnused($image);

        foreach ($variantImages as $variantImage) {
            $this->deleteImageIfUnused($variantImage);
        }

        return redirect()->route('admin.products.index')->with('success', 'Produk "'.$product->name.'" berhasil dihapus.');
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function productRules(bool $isImageRequired, ?Product $product = null): array
    {
        $variantIdRules = ['nullable', 'integer'];

        if ($product instanceof Product) {
            $variantIdRules[] = Rule::exists('product_variants', 'id')->where('product_id', $product->id);
        } else {
            $variantIdRules[] = 'prohibited';
        }

        return [
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where('is_active', true)->whereNot('slug', Category::CATALOG_ALL_SLUG),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'base_price' => ['required', 'numeric', 'min:0', 'max:9999999999'],
            'stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'weight_grams' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'image' => [$isImageRequired ? 'required' : 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'variants_present' => ['sometimes', 'boolean'],
            'variants' => ['sometimes', 'array', 'max:20'],
            'variants.*' => ['array:id,type,name,image,current_image,preview_url,remove_image,additional_price,stock'],
            'variants.*.id' => $variantIdRules,
            'variants.*.type' => ['required', 'string', Rule::in(['flavor', 'size', 'tier'])],
            'variants.*.name' => ['required', 'string', 'max:255', 'distinct:ignore_case'],
            'variants.*.image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'variants.*.current_image' => ['nullable', 'string', 'max:2048'],
            'variants.*.preview_url' => ['nullable', 'string', 'max:2048'],
            'variants.*.remove_image' => ['nullable', 'boolean'],
            'variants.*.additional_price' => ['required', 'numeric', 'min:0', 'max:9999999999'],
            'variants.*.stock' => ['required', 'integer', 'min:0', 'max:100000'],
        ];
    }

    /**
     * Create, update, and remove a product's variants using the submitted list.
     *
     * @param  list<array{id?: int|null, type: string, name: string, additional_price: numeric-string|int|float, stock: int, image?: UploadedFile|null, remove_image?: bool|string}>  $variants
     * @return list<string>
     */
    private function syncVariants(Product $product, array $variants): array
    {
        $retainedIds = [];
        $imagesToDelete = [];

        foreach ($variants as $variant) {
            $attributes = [
                'type' => $variant['type'],
                'name' => $variant['name'],
                'additional_price' => $variant['additional_price'],
                'stock' => $variant['stock'],
            ];

            if (! empty($variant['id'])) {
                $existingVariant = $product->variants()->whereKey($variant['id'])->firstOrFail();

                if (($variant['image'] ?? null) instanceof UploadedFile) {
                    if ($existingVariant->image) {
                        $imagesToDelete[] = $existingVariant->image;
                    }

                    $attributes['image'] = $this->storeImage($variant['image']);
                } elseif (! empty($variant['remove_image'])) {
                    if ($existingVariant->image) {
                        $imagesToDelete[] = $existingVariant->image;
                    }

                    $attributes['image'] = null;
                }

                $existingVariant->update($attributes);
                $retainedIds[] = $existingVariant->id;

                continue;
            }

            if (($variant['image'] ?? null) instanceof UploadedFile) {
                $attributes['image'] = $this->storeImage($variant['image']);
            }

            $createdVariant = $product->variants()->create($attributes);
            $retainedIds[] = $createdVariant->id;
        }

        $variantsToRemove = $product->variants();

        if ($retainedIds !== []) {
            $variantsToRemove->whereNotIn('id', $retainedIds);
        }

        $imagesToDelete = [
            ...$imagesToDelete,
            ...$variantsToRemove->pluck('image')->filter()->all(),
        ];
        $variantsToRemove->delete();

        return array_values(array_unique($imagesToDelete));
    }

    /**
     * @return array<string, string>
     */
    private function productMessages(): array
    {
        return [
            'category_id.required' => 'Pilih kategori produk.',
            'category_id.exists' => 'Kategori yang dipilih tidak tersedia. Pilih kategori lain.',
            'name.required' => 'Nama wajib diisi.',
            'base_price.min' => 'Harga minimal 0.',
            'stock.integer' => 'Stok harus berupa bilangan bulat.',
            'variants.max' => 'Maksimal 20 varian per produk.',
            'variants.*.type.in' => 'Pilih jenis varian yang tersedia.',
            'variants.*.name.required' => 'Nama varian wajib diisi.',
            'variants.*.name.distinct' => 'Nama varian tidak boleh sama.',
            'variants.*.image.image' => 'Foto varian harus berupa gambar.',
            'variants.*.image.mimes' => 'Format foto varian harus JPG, JPEG, PNG, atau WEBP.',
            'variants.*.image.max' => 'Ukuran foto varian maksimal 2 MB.',
            'variants.*.image.uploaded' => 'Foto varian gagal diunggah. Pastikan ukurannya tidak lebih dari 2 MB.',
            'variants.*.additional_price.required' => 'Isi tambahan harga varian.',
            'variants.*.stock.integer' => 'Stok varian harus berupa bilangan bulat.',
            'image.required' => 'Foto produk wajib diunggah.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format foto harus JPG, JPEG, PNG, atau WEBP.',
            'image.max' => 'Ukuran foto maksimal 2 MB.',
            'image.uploaded' => 'Foto gagal diunggah. Pastikan ukurannya tidak lebih dari 2 MB.',
        ];
    }

    /**
     * Categories a seller may file a product under: active ones, without the catalog's "all" pseudo category.
     *
     * @return Collection<int, Category>
     */
    private function activeCategories(): Collection
    {
        return Category::query()
            ->where('is_active', true)
            ->where('slug', '!=', Category::CATALOG_ALL_SLUG)
            ->orderBy('order_index')
            ->get(['id', 'name']);
    }

    /**
     * Move an uploaded photo into public/assets/images and return its public URL path.
     */
    private function storeImage(UploadedFile $file): string
    {
        $fileName = time().'_'.Str::random(6).'_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->extension();
        $file->move(public_path(self::IMAGE_DIRECTORY), $fileName);

        return '/'.self::IMAGE_DIRECTORY.'/'.$fileName;
    }

    /**
     * Remove a photo uploaded through this controller once no product or variant uses it.
     * External URLs (such as the seeded Unsplash photos) are never touched.
     */
    private function deleteImageIfUnused(?string $image): void
    {
        if (! $image || ! str_starts_with($image, '/'.self::IMAGE_DIRECTORY.'/')) {
            return;
        }

        if (Product::where('image', $image)->exists() || ProductVariant::where('image', $image)->exists()) {
            return;
        }

        $path = public_path(self::IMAGE_DIRECTORY.'/'.basename($image));

        if (is_file($path)) {
            unlink($path);
        }
    }

    private function ensureProductBelongsTo(Product $product, ?User $user): void
    {
        abort_unless($user instanceof User, 403);

        if (! $user->isAdmin()) {
            abort_unless((int) $product->store_id === (int) $user->ownedStore()->id, 404);
        }
    }

    private function storeOf(?User $user): Store
    {
        abort_unless($user instanceof User, 403);

        return $user->ownedStore();
    }
}
