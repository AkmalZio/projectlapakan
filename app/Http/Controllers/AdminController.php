<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function products(Request $request): Response
    {
        $store = $this->storeOf($request->user());

        return Inertia::render('Admin/Products/Index', [
            'store' => $store->only(['id', 'name']),
            'products' => $store->products()
                ->with('category:id,name')
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function createProduct(Request $request): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'store' => $this->storeOf($request->user())->only(['id', 'name']),
            'categories' => Category::where('is_active', true)->orderBy('order_index')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a product and move its photo to public/assets/images with a time() prefix.
     */
    public function storeProduct(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'weight_grams' => ['nullable', 'integer', 'min:0'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ], [
            'image.required' => 'Foto produk wajib diunggah.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format foto harus JPG, JPEG, PNG, atau WEBP.',
            'image.max' => 'Ukuran foto maksimal 2 MB.',
            'image.uploaded' => 'Foto gagal diunggah. Pastikan ukurannya tidak lebih dari 2 MB.',
        ]);

        $store = $this->storeOf($request->user());

        $file = $request->file('image');
        $fileName = time().'_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->extension();
        $file->move(public_path('assets/images'), $fileName);

        $store->products()->create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.time(),
            'description' => $validated['description'] ?? 'Produk baru dari toko '.$store->name,
            'base_price' => $validated['base_price'],
            'image' => '/assets/images/'.$fileName,
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

    private function storeOf(?User $user): Store
    {
        abort_unless($user instanceof User, 403);

        return $user->ownedStore();
    }
}
