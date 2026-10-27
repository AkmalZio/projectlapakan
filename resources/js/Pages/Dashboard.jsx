import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, Cake, Heart, LogOut, MapPin, ShoppingBag, Sparkles, Star, Store } from 'lucide-react';

export default function Dashboard() {
    const {
        auth,
        favoriteCount = 0,
        favoriteProducts = [],
        ratingAverage = 0,
        ordersCount = 0,
    } = usePage().props;
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showSellerForm, setShowSellerForm] = useState(false);
    const sellerForm = useForm({
        store_name: '',
        city: '',
        phone: auth.user.phone ?? '',
        description: '',
    });

    const handleSellerRegistration = (event) => {
        event.preventDefault();
        sellerForm.post(route('seller.register'));
    };

    const handleCheckoutFavorite = (product) => {
        router.post(
            route('cart.add'),
            {
                product_id: product.id,
                quantity: 1,
                buy_now: true,
            },
            { preserveScroll: true },
        );
    };

    return (
        <MarketplaceLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="bg-[#fffaf7]">
                <section className="relative overflow-hidden bg-[linear-gradient(135deg,#6d0f2f,#9f2348,#3b0b1d)] px-4 py-14 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl text-white">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-pink-100">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Selamat datang kembali
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                    Halo, {auth.user.name}
                                </h1>
                                <p className="mt-3 text-sm text-pink-100/85 sm:text-base">
                                    Cepat cek pesanan, lihat favoritmu, dan lanjutkan belanja kue favorit yang siap buat sial.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={route('catalog')}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#7d0f2e] shadow-lg shadow-[#2d0a1b]/20 transition hover:scale-[1.02]"
                                >
                                    Lanjut Belanja
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={route('orders.index')}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                                >
                                    Pesanan Saya
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutConfirmation(true)}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-[24px] border border-[#f0e0d8] bg-white p-5 shadow-[0_10px_30px_rgba(74,7,28,0.04)]">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">Pesanan Aktif</p>
                                <div className="rounded-xl bg-[#fdf1f5] p-2 text-[#7d0f2e]">
                                    <ShoppingBag className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="mt-4 text-3xl font-extrabold text-gray-900">{ordersCount}</p>
                            <p className="mt-2 text-xs text-gray-500">Jumlah pesanan yang pernah dibuat</p>
                        </div>

                        <div className="rounded-[24px] border border-[#f0e0d8] bg-white p-5 shadow-[0_10px_30px_rgba(74,7,28,0.04)]">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">Favorit</p>
                                <div className="rounded-xl bg-[#fff4ec] p-2 text-[#d97a00]">
                                    <Heart className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="mt-4 text-3xl font-extrabold text-gray-900">{favoriteCount}</p>
                            <p className="mt-2 text-xs text-gray-500">Produk yang kamu simpan untuk nanti</p>
                        </div>

                        <div className="rounded-[24px] border border-[#f0e0d8] bg-white p-5 shadow-[0_10px_30px_rgba(74,7,28,0.04)]">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">Rating</p>
                                <div className="rounded-xl bg-[#fff8d9] p-2 text-[#b7791f]">
                                    <Star className="h-4 w-4 fill-current" />
                                </div>
                            </div>
                            <p className="mt-4 text-3xl font-extrabold text-gray-900">{Number(ratingAverage || 0).toFixed(1)}</p>
                            <p className="mt-2 text-xs text-gray-500">Rata-rata rating dari review yang kamu berikan</p>
                        </div>
                    </div>

                    {auth.user.role === 'customer' && (
                        <section className="overflow-hidden rounded-[28px] border border-[#efd9df] bg-white shadow-[0_10px_30px_rgba(74,7,28,0.04)]">
                            <div className="flex flex-col gap-5 bg-gradient-to-r from-[#fff4f6] to-[#fffaf7] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5dfe7] text-[#7d0f2e]">
                                        <Store className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-gray-900">
                                            Punya usaha kue? Mulai jualan di LAPAKan
                                        </h2>
                                        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                                            Buat toko gratis dalam beberapa langkah, lalu kelola produk dan pesanan dari dashboard penjual.
                                        </p>
                                    </div>
                                </div>
                                {!showSellerForm && (
                                    <button
                                        type="button"
                                        aria-expanded={showSellerForm}
                                        aria-controls="seller-registration-form"
                                        onClick={() => setShowSellerForm(true)}
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#7d0f2e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#620d25]"
                                    >
                                        Mulai Jualan
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {showSellerForm && (
                                <form id="seller-registration-form" onSubmit={handleSellerRegistration} className="grid gap-5 border-t border-[#f0e0d8] p-6 sm:grid-cols-2 sm:p-7">
                                    <label htmlFor="seller-store-name" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                                        Nama toko
                                        <input
                                            id="seller-store-name"
                                            type="text"
                                            required
                                            maxLength={255}
                                            value={sellerForm.data.store_name}
                                            onChange={(event) => sellerForm.setData('store_name', event.target.value)}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900 focus:border-[#9f2348] focus:outline-none focus:ring-2 focus:ring-[#9f2348]/15"
                                            placeholder="Contoh: Dapur Manis"
                                        />
                                        {sellerForm.errors.store_name && (
                                            <span className="block font-normal text-red-600">{sellerForm.errors.store_name}</span>
                                        )}
                                    </label>

                                    <label htmlFor="seller-city" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                                        Kota
                                        <input
                                            id="seller-city"
                                            type="text"
                                            required
                                            maxLength={255}
                                            value={sellerForm.data.city}
                                            onChange={(event) => sellerForm.setData('city', event.target.value)}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900 focus:border-[#9f2348] focus:outline-none focus:ring-2 focus:ring-[#9f2348]/15"
                                            placeholder="Contoh: Bandung"
                                        />
                                        {sellerForm.errors.city && (
                                            <span className="block font-normal text-red-600">{sellerForm.errors.city}</span>
                                        )}
                                    </label>

                                    <label htmlFor="seller-phone" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                                        Nomor WhatsApp toko
                                        <input
                                            id="seller-phone"
                                            type="tel"
                                            required
                                            maxLength={30}
                                            value={sellerForm.data.phone}
                                            onChange={(event) => sellerForm.setData('phone', event.target.value)}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900 focus:border-[#9f2348] focus:outline-none focus:ring-2 focus:ring-[#9f2348]/15"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                        {sellerForm.errors.phone && (
                                            <span className="block font-normal text-red-600">{sellerForm.errors.phone}</span>
                                        )}
                                    </label>

                                    <label htmlFor="seller-description" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 sm:col-span-2">
                                        Ceritakan singkat tentang tokomu
                                        <textarea
                                            id="seller-description"
                                            rows={3}
                                            maxLength={2000}
                                            value={sellerForm.data.description}
                                            onChange={(event) => sellerForm.setData('description', event.target.value)}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900 focus:border-[#9f2348] focus:outline-none focus:ring-2 focus:ring-[#9f2348]/15"
                                            placeholder="Jenis kue atau produk yang kamu jual (opsional)"
                                        />
                                        {sellerForm.errors.description && (
                                            <span className="block font-normal text-red-600">{sellerForm.errors.description}</span>
                                        )}
                                    </label>

                                    <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                sellerForm.reset();
                                                setShowSellerForm(false);
                                            }}
                                            className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Nanti saja
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={sellerForm.processing}
                                            className="rounded-full bg-[#7d0f2e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#620d25] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {sellerForm.processing ? 'Membuat toko...' : 'Buat toko & lanjutkan'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </section>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-[28px] border border-[#f0e0d8] bg-white p-6 shadow-[0_10px_30px_rgba(74,7,28,0.04)]">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-xl font-extrabold text-gray-900">Produk Favorit Saya</h3>
                                <Link href={route('catalog')} className="text-sm font-semibold text-[#8b1f3f] hover:underline">
                                    Lihat katalog
                                </Link>
                            </div>

                            <div className="mt-5 space-y-3">
                                {favoriteProducts.length > 0 ? (
                                    favoriteProducts.map((product) => (
                                        <div key={product.product_id ?? product.id} className="rounded-2xl border border-[#f0e0d8] bg-[#fffaf7] p-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.image || 'https://placehold.co/120x120/f4e4e9/7d0f2e?text=Cake'}
                                                    alt={product.name}
                                                    className="h-16 w-16 rounded-2xl object-cover"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-bold text-gray-900">{product.name}</p>
                                                    <p className="mt-1 text-sm text-[#7d0f2e] font-semibold">
                                                        {Number(product.price || 0).toLocaleString('id-ID', {
                                                            style: 'currency',
                                                            currency: 'IDR',
                                                            minimumFractionDigits: 0,
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 gap-2">
                                                    <Link
                                                        href={route('product.show', product.slug)}
                                                        className="rounded-full border border-[#e7d7c6] px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-[#f7f2ee]"
                                                    >
                                                        Lihat
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCheckoutFavorite(product)}
                                                        className="rounded-full bg-[#7d0f2e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#620d25]"
                                                    >
                                                        Checkout
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-[#e7d7c6] bg-[#fdf7f3] p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5dfe7] text-[#7d0f2e]">
                                                <Heart className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Belum ada produk favorit</p>
                                                <p className="text-sm text-gray-500">Simpan produk yang kamu suka lalu checkout lebih cepat di sini.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-[#f0e0d8] bg-white p-6 shadow-[0_10px_30px_rgba(74,7,28,0.04)]">
                            <h3 className="text-xl font-extrabold text-gray-900">Aksi Cepat</h3>
                            <div className="mt-5 space-y-3 text-sm text-gray-600">
                                <Link href={route('catalog')} className="block rounded-2xl bg-[#fdf1f5] px-4 py-3 font-semibold text-[#7d0f2e] transition hover:bg-[#fbe6ec]">
                                    Jelajahi Produk Baru
                                </Link>
                                <Link href={route('cart.index')} className="block rounded-2xl bg-[#f7f4ef] px-4 py-3 font-semibold text-gray-800 transition hover:bg-[#efe9df]">
                                    Lihat Keranjang
                                </Link>
                                <Link href={route('orders.index')} className="block rounded-2xl bg-[#f7f4ef] px-4 py-3 font-semibold text-gray-800 transition hover:bg-[#efe9df]">
                                    Cek Pesanan Saya
                                </Link>
                                <Link href={route('profile.edit')} className="flex items-center justify-between rounded-2xl bg-[#f7f4ef] px-4 py-3 font-semibold text-gray-800 transition hover:bg-[#efe9df]">
                                    <span>Kelola Akun</span>
                                    <MapPin className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showLogoutConfirmation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => !isLoggingOut && setShowLogoutConfirmation(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-confirmation-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                                <LogOut className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 id="logout-confirmation-title" className="text-lg font-bold text-gray-900">
                                    Keluar dari akun?
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Kamu perlu masuk kembali untuk mengakses akun dan pesananmu.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={isLoggingOut}
                                onClick={() => setShowLogoutConfirmation(false)}
                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isLoggingOut}
                                onClick={() => router.post(route('logout'), {}, {
                                    onStart: () => setIsLoggingOut(true),
                                    onFinish: () => setIsLoggingOut(false),
                                })}
                                className="rounded-lg bg-[#7d0f2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#620d25] disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Sedang keluar...' : 'Ya, keluar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MarketplaceLayout>
    );
}
