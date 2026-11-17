<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\Seller\SellerDashboardController;
use App\Http\Controllers\Seller\SellerRegistrationController;
use Illuminate\Support\Facades\Route;

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

Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/add', [CartController::class, 'add'])->name('add');
    Route::patch('/{cartKey}', [CartController::class, 'update'])->name('update');
    Route::delete('/{cartKey}', [CartController::class, 'remove'])->name('remove');
});

Route::middleware(['auth', 'verified'])->prefix('checkout')->name('checkout.')->group(function () {
    Route::post('/start', [CheckoutController::class, 'startFromCart'])->name('start');
    Route::get('/', [CheckoutController::class, 'shipping'])->name('shipping');
    Route::delete('/cancel', [CheckoutController::class, 'cancel'])->name('cancel');
    Route::post('/shipping', [CheckoutController::class, 'saveShipping'])->name('saveShipping');
    Route::get('/payment', [CheckoutController::class, 'payment'])->name('payment');
    Route::post('/process', [CheckoutController::class, 'process'])->name('process');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/pesanan', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/success/{orderNumber}', [CheckoutController::class, 'success'])->name('orders.success');
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{orderNumber}/payment-proof', [OrderController::class, 'uploadPaymentProof'])->name('orders.payment-proof.store');
    Route::get('/orders/{orderNumber}/payment-proof', [OrderController::class, 'showPaymentProof'])->name('orders.payment-proof.show');
    Route::post('/orders/{orderNumber}/reviews', [ReviewController::class, 'store'])->name('orders.reviews.store');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])->name('favorites.toggle');

    Route::middleware('role:admin,merchant')->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('/admin/products', [AdminController::class, 'products'])->name('admin.products.index');
        Route::get('/admin/products/create', [AdminController::class, 'createProduct'])->name('admin.products.create');
        Route::post('/admin/products', [AdminController::class, 'storeProduct'])->name('admin.products.store');
        Route::get('/admin/products/{product}/edit', [AdminController::class, 'editProduct'])->name('admin.products.edit');
        Route::patch('/admin/products/{product}', [AdminController::class, 'updateProduct'])->name('admin.products.update');
        Route::patch('/admin/products/{product}/active', [AdminController::class, 'toggleProductActive'])->name('admin.products.toggle-active');
        Route::delete('/admin/products/{product}', [AdminController::class, 'destroyProduct'])->name('admin.products.destroy');
        Route::patch('/admin/orders/{order}/status', [AdminDashboardController::class, 'updateOrderStatus'])->name('admin.orders.update-status');
        Route::patch('/admin/orders/{order}/payment', [AdminDashboardController::class, 'verifyPayment'])->name('admin.orders.verify-payment');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
