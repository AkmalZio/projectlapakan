import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import ProductCard from '@/Components/ProductCard';
import { ShoppingBag, Heart, ShieldCheck, Truck, Clock, Sparkles, Star, ChevronRight, Check } from 'lucide-react';

export default function ProductDetail({ product, relatedProducts = [] }) {
    const gallery = product.gallery && product.gallery.length > 0 
        ? product.gallery 
        : [product.image, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=800&auto=format&fit=crop'];

    const [selectedImage, setSelectedImage] = useState(gallery[0]);
    const [selectedVariant, setSelectedVariant] = useState(product.variants && product.variants.length > 0 ? product.variants[0] : null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorited, setIsFavorited] = useState(Boolean(product.is_favorited));

    const ratingAverage = Number(product.reviews_avg_rating ?? 0);
    const reviewCount = Number(product.reviews_count ?? 0);

    // Calculate current dynamic price
    const currentPrice = Number(product.base_price) + (selectedVariant ? Number(selectedVariant.additional_price) : 0);

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const handleAddToCart = (isBuyNow = false) => {
        router.post(route('cart.add'), {
            product_id: product.id,
            variant_id: selectedVariant?.id || null,
            quantity: quantity,
            buy_now: isBuyNow,
        });
    };

    const toggleFavorite = () => {
        router.post(route('favorites.toggle'), {
            product_id: product.id,
        }, {
            preserveScroll: true,
            onSuccess: () => setIsFavorited((current) => !current),
        });
    };

    return (
        <MarketplaceLayout>
            <Head title={`${product.name} - LAPAKan`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8">
                    <Link href={route('home')} className="hover:text-crimson-800">Beranda</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href={route('catalog')} className="hover:text-crimson-800">Katalog</Link>
                    {product.category && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <Link href={route('catalog', { category: product.category.slug })} className="hover:text-crimson-800">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-900 font-bold truncate">{product.name}</span>
                </nav>

                {/* Main Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE3D3] shadow-sm">
                    
                    {/* LEFT: GALLERY */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Main Preview */}
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            {product.is_preorder && (
                                <span className="absolute top-4 left-4 bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Pre-Order (H-{product.preorder_days || 1})
                                </span>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-3">
                            {gallery.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                                        selectedImage === img
                                            ? 'border-crimson-700 shadow-md ring-2 ring-crimson-700/20'
                                            : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: DETAILS & CUSTOMIZATION FORM */}
                    <div className="lg:col-span-6 space-y-6">
                        <div>
                            {product.category && (
                                <span className="text-xs font-extrabold uppercase tracking-wider text-crimson-700 bg-crimson-50 px-3 py-1 rounded-full inline-block mb-2">
                                    {product.category.name}
                                </span>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-gray-500">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-gray-900">{ratingAverage ? ratingAverage.toFixed(1) : '0.0'}</span>
                                    <span>({reviewCount} ulasan)</span>
                                </div>
                                <span>•</span>
                                <span>Daya Tahan: {product.shelf_life_days} Hari</span>
                            </div>
                        </div>

                        {/* Price Tag */}
                        <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#EBE3D3] flex items-baseline justify-between gap-4">
                            <div>
                                <span className="text-xs text-gray-500 block font-medium">Harga Produk</span>
                                <span className="text-3xl font-extrabold text-crimson-900">
                                    {formatIDR(currentPrice)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={toggleFavorite}
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition ${
                                    isFavorited
                                        ? 'border-[#f3c9d6] bg-[#fff2f6] text-[#7d0f2e]'
                                        : 'border-[#ead7d0] bg-white text-gray-700 hover:border-[#d8b7c0]'
                                }`}
                            >
                                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                                {isFavorited ? 'Favorit' : 'Tambah Favorit'}
                            </button>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">Deskripsi Kue</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Variant Options (e.g. Size / Flavor) */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Pilih Varian / Ukuran
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                                                selectedVariant?.id === v.id
                                                    ? 'border-crimson-800 bg-crimson-800 text-white shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-crimson-600'
                                            }`}
                                        >
                                            {selectedVariant?.id === v.id && <Check className="w-3.5 h-3.5" />}
                                            <span>{v.name}</span>
                                            {Number(v.additional_price) > 0 && (
                                                <span className={selectedVariant?.id === v.id ? 'text-pink-200' : 'text-crimson-700'}>
                                                    (+{formatIDR(v.additional_price)})
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Counter & Action Buttons */}
                        <div className="pt-2 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-gray-700">Jumlah:</span>
                                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-9 h-9 flex items-center justify-center font-bold text-gray-600 hover:text-crimson-800 hover:bg-gray-50 rounded-l-xl transition"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center text-xs font-bold text-gray-900">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-9 h-9 flex items-center justify-center font-bold text-gray-600 hover:text-crimson-800 hover:bg-gray-50 rounded-r-xl transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleAddToCart(false)}
                                    className="w-full py-3.5 px-6 rounded-2xl border-2 border-crimson-800 bg-white text-crimson-800 hover:bg-crimson-50 font-extrabold text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>Tambah ke Keranjang</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAddToCart(true)}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-crimson-800 hover:bg-crimson-900 text-white font-extrabold text-xs shadow-md shadow-crimson-900/20 transition active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>Beli Sekarang</span>
                                </button>
                            </div>
                        </div>

                        {/* Freebies note */}
                        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Sudah Termasuk Box & Pisau</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-pink-600" />
                                <span>Lilin spiral Rp3.000 per batang</span>
                            </div>
                        </div>

                    </div>

                </div>

                {/* RELATED PRODUCTS */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Produk Serupa yang Mungkin Kamu Suka</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((rel) => (
                                <ProductCard key={rel.id} product={rel} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </MarketplaceLayout>
    );
}
