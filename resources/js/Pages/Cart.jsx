import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Trash2, ArrowLeft, ArrowRight, ShoppingBag, Cake, Sparkles } from 'lucide-react';

export default function Cart({ cartItems = [], subtotal = 0 }) {
    const shippingEstimate = cartItems.length > 0 ? 20000 : 0;
    const total = subtotal + shippingEstimate;

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const handleUpdateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        router.patch(route('cart.update', cartKey), { quantity: newQty }, { preserveScroll: true });
    };

    const handleRemoveItem = (cartKey) => {
        if (confirm('Hapus kue ini dari keranjang?')) {
            router.delete(route('cart.remove', cartKey), { preserveScroll: true });
        }
    };

    return (
        <MarketplaceLayout>
            <Head title="Keranjang Belanja - LAPAKan" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                {/* Header Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keranjang Belanja</h1>
                    <p className="text-sm text-gray-500 mt-1">Periksa kembali pesanan manismu sebelum melanjutkan ke tahap pengiriman.</p>
                </div>

                {cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* LEFT: CART ITEMS LIST */}
                        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D3] shadow-sm space-y-6">
                            
                            {/* Desktop Table Header */}
                            <div className="hidden sm:grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider pb-4 border-b border-gray-100">
                                <div className="col-span-6">Produk Kue</div>
                                <div className="col-span-2 text-center">Harga</div>
                                <div className="col-span-2 text-center">Jumlah</div>
                                <div className="col-span-2 text-right">Subtotal</div>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                                        
                                        {/* Product info */}
                                        <div className="w-full sm:col-span-6 flex items-center gap-4">
                                            <img
                                                src={item.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop'}
                                                alt={item.name}
                                                className="w-20 h-20 rounded-2xl object-cover bg-gray-100 border border-gray-100 flex-shrink-0"
                                            />
                                            <div className="space-y-1">
                                                <Link 
                                                    href={route('product.show', item.slug)}
                                                    className="font-bold text-sm text-gray-900 hover:text-crimson-800 transition line-clamp-1"
                                                >
                                                    {item.name}
                                                </Link>
                                                {item.variant_name && (
                                                    <span className="inline-block text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                        {item.variant_name}
                                                    </span>
                                                )}
                                                {item.cake_text && (
                                                    <div className="flex items-center gap-1 text-[11px] text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md">
                                                        <Sparkles className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">"{item.cake_text}"</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unit Price */}
                                        <div className="w-full sm:col-span-2 sm:text-center text-xs font-semibold text-gray-600 flex justify-between sm:block">
                                            <span className="sm:hidden text-gray-400">Harga Satuan:</span>
                                            <span>{formatIDR(item.price)}</span>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="w-full sm:col-span-2 flex justify-between sm:justify-center items-center">
                                            <span className="sm:hidden text-xs text-gray-400 font-semibold">Jumlah:</span>
                                            <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-50 text-xs rounded-l-xl"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-50 text-xs rounded-r-xl"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal & Delete */}
                                        <div className="w-full sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                                            <span className="sm:hidden text-xs text-gray-400 font-semibold">Subtotal:</span>
                                            <span className="font-extrabold text-sm text-crimson-800">
                                                {formatIDR(item.price * item.quantity)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                title="Hapus kue"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>

                            {/* Back to catalog button */}
                            <div className="pt-6 border-t border-gray-100">
                                <Link
                                    href={route('catalog')}
                                    className="inline-flex items-center gap-2 text-xs font-bold text-crimson-800 hover:text-crimson-900 hover:underline"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Lanjut Pilih Kue Lain</span>
                                </Link>
                            </div>

                        </div>

                        {/* RIGHT: SUMMARY CARD (Dark Crimson matching Figma) */}
                        <div className="lg:col-span-4 bg-gradient-to-br from-crimson-900 to-crimson-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-crimson-950/20 space-y-6 sticky top-28">
                            <div>
                                <h3 className="text-lg font-extrabold text-white">Ringkasan Belanja</h3>
                                <p className="text-xs text-pink-200/80 mt-0.5">Total pesanan manis pilihanmu</p>
                            </div>

                            <div className="space-y-3 text-xs border-y border-white/10 py-4">
                                <div className="flex justify-between text-pink-100">
                                    <span>Total Harga ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} kue)</span>
                                    <span className="font-bold">{formatIDR(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-pink-100">
                                    <span>Estimasi Ongkir</span>
                                    <span className="font-bold">{formatIDR(shippingEstimate)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-300">
                                    <span>Pisau Kue</span>
                                    <span className="font-bold">GRATIS</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-bold text-pink-200">Total Tagihan</span>
                                <span className="text-2xl font-extrabold text-white">{formatIDR(total)}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.post(route('checkout.start'))}
                                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-pink-50 text-crimson-900 font-extrabold text-sm shadow-md transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Lanjut ke Pengiriman</span>
                                <ArrowRight className="w-4 h-4 text-crimson-800" />
                            </button>

                            <p className="text-[11px] text-center text-pink-200/70">
                                🔒 Transaksi aman & terenkripsi
                            </p>
                        </div>

                    </div>
                ) : (
                    /* EMPTY CART STATE */
                    <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-12 border border-[#EBE3D3] space-y-5">
                        <div className="w-20 h-20 rounded-full bg-crimson-50 text-crimson-700 flex items-center justify-center mx-auto">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900">Keranjang Belanjamu Masih Kosong</h2>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Yuk cari kue ulang tahun, dessert box, atau pastry lezat untuk melengkapi momen manismu hari ini!
                        </p>
                        <Link
                            href={route('catalog')}
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-bold shadow-md shadow-crimson-900/20 transition hover:scale-105 active:scale-95"
                        >
                            <span>Mulai Belanja Kue Sekarang</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

            </div>
        </MarketplaceLayout>
    );
}
