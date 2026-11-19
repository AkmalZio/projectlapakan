<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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

        $store->products()->create([
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
            ]),
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

        $validated = $request->validate($this->productRules(isImageRequired: false), $this->productMessages());

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

        $product->update($attributes);

        if (isset($attributes['image'])) {
            $this->deleteImageIfUnused($previousImage);
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

        $product->delete();

        $this->deleteImageIfUnused($image);

        return redirect()->route('admin.products.index')->with('success', 'Produk "'.$product->name.'" berhasil dihapus.');
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function productRules(bool $isImageRequired): array
    {
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
        ];
    }

    /**
     * @return array<string, string>
     */
    private function productMessages(): array
    {
        return [
            'category_id.required' => 'Pilih kategori produk.',
            'category_id.exists' => 'Kategori yang dipilih tidak tersedia. Pilih kategori lain.',
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
     * Remove a photo uploaded through this controller once no product points to it anymore.
     * External URLs (such as the seeded Unsplash photos) are never touched.
     */
    private function deleteImageIfUnused(?string $image): void
    {
        if (! $image || ! str_starts_with($image, '/'.self::IMAGE_DIRECTORY.'/')) {
            return;
        }

        if (Product::where('image', $image)->exists()) {
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
