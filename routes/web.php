<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Seller\SellerDashboardController;
use App\Http\Controllers\Seller\SellerRegistrationController;
use App\Http\Controllers\SuperAdminController;
use App\Models\Favorite;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Marketplace Public Routes
Route::get('/', [MarketplaceController::class, 'index'])->name('home');
Route::get('/katalog', [MarketplaceController::class, 'catalog'])->name('catalog');
Route::get('/product/{slug}', [MarketplaceController::class, 'show'])->name('product.show');
Route::get('/tentang', [MarketplaceController::class, 'about'])->name('about');

Route::middleware(['auth', 'verified', 'role:admin,merchant'])->group(function () {
    Route::get('/seller/dashboard', [SellerDashboardController::class, 'index'])->name('seller.dashboard');
});

Route::post('/seller/register', [SellerRegistrationController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:customer'])
    ->name('seller.register');

// Shopping Cart Routes
Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/add', [CartController::class, 'add'])->name('add');
    Route::patch('/{cartKey}', [CartController::class, 'update'])->name('update');
    Route::delete('/{cartKey}', [CartController::class, 'remove'])->name('remove');
});

// Checkout Multi-Step Routes
Route::middleware(['auth', 'verified'])->prefix('checkout')->name('checkout.')->group(function () {
    Route::post('/start', [CheckoutController::class, 'startFromCart'])->name('start');
    Route::get('/', [CheckoutController::class, 'shipping'])->name('shipping');
    Route::delete('/cancel', [CheckoutController::class, 'cancel'])->name('cancel');
    Route::post('/shipping', [CheckoutController::class, 'saveShipping'])->name('saveShipping');
    Route::get('/payment', [CheckoutController::class, 'payment'])->name('payment');
    Route::post('/process', [CheckoutController::class, 'process'])->name('process');
});

// Order Success, List & Tracking Routes
Route::get('/pesanan', [OrderController::class, 'index'])->name('orders.index');
Route::get('/orders/success/{orderNumber}', [CheckoutController::class, 'success'])->name('orders.success');
Route::get('/orders/{orderNumber}', [OrderController::class, 'show'])->name('orders.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user?->isSuperAdmin()) {
            return redirect()->route('superadmin.dashboard');
        }

        if ($user?->isSeller()) {
            return redirect()->route('seller.dashboard');
        }

        $favoriteProducts = Favorite::with('product')
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->filter(fn (Favorite $favorite) => $favorite->product !== null)
            ->map(fn (Favorite $favorite) => [
                'id' => $favorite->product->id,
                'product_id' => $favorite->product_id,
                'name' => $favorite->product->name,
                'slug' => $favorite->product->slug,
                'image' => $favorite->product->image,
                'price' => $favorite->product->base_price,
            ])
            ->values();

        $favoriteCount = $favoriteProducts->count();
        $averageRating = Review::where('user_id', $user->id)->avg('rating');

        return Inertia::render('Dashboard', [
            'favoriteCount' => $favoriteCount,
            'favoriteProducts' => $favoriteProducts,
            'ratingAverage' => $averageRating ? round((float) $averageRating, 1) : 0.0,
            'ordersCount' => $user->orders()->count(),
        ]);
    })->name('dashboard');

    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])->name('favorites.toggle');

    Route::middleware('role:admin,merchant')->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::post('/admin/products', [AdminDashboardController::class, 'storeProduct'])->name('admin.products.store');
        Route::patch('/admin/orders/{order}/status', [AdminDashboardController::class, 'updateOrderStatus'])->name('admin.orders.update-status');
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::get('/super-admin/dashboard', [SuperAdminController::class, 'index'])->name('superadmin.dashboard');
        Route::patch('/super-admin/users/{user}/role', [SuperAdminController::class, 'updateRole'])->name('superadmin.users.update-role');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
