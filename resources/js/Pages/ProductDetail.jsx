import React, { useState } from 'react';
import ImageWithFallback from '@/Components/ImageWithFallback';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import ProductCard from '@/Components/ProductCard';
import { ShoppingBag, Heart, ShieldCheck, Truck, Clock, Sparkles, Star, ChevronRight, Check } from 'lucide-react';

export default function ProductDetail({ product, relatedProducts = [] }) {
    const gallery = product.gallery && product.gallery.length > 0
        ? product.gallery
        : [product.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop'];

    const variants = product.variants ?? [];
    const variantsWithImages = variants.filter((variant) => variant.image);
    const thumbnails = variantsWithImages.length > 0
        ? variantsWithImages.map((variant) => ({ image: variant.image, variant }))
        : gallery.map((image, index) => ({ image, variant: null, index }));
    const initialVariant = variants[0] ?? null;
    const [selectedImage, setSelectedImage] = useState(initialVariant?.image || gallery[0]);
    const [selectedVariant, setSelectedVariant] = useState(initialVariant);
    const [quantity, setQuantity] = useState(1);

    const availableStock = Math.max(0, Number(selectedVariant?.stock ?? product.stock ?? 0));
    const isOutOfStock = availableStock === 0;
    const [isFavorited, setIsFavorited] = useState(Boolean(product.is_favorited));

    const selectVariant = (variant) => {
        setSelectedVariant(variant);
        setSelectedImage(variant.image || gallery[0]);
        const variantStock = Math.max(0, Number(variant.stock ?? product.stock ?? 0));
        setQuantity((currentQuantity) => Math.min(currentQuantity, Math.max(1, variantStock)));
    };

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
            quantity: Math.min(quantity, availableStock),
            buy_now: isBuyNow,
        }, {
            preserveScroll: !isBuyNow,
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
            <Head title={product.name} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-8 flex min-w-0 items-center gap-2 overflow-hidden text-xs font-semibold text-gray-500">
                    <Link href={route('home')} className="shrink-0 hover:text-crimson-800">Beranda</Link>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    <Link href={route('catalog')} className="shrink-0 hover:text-crimson-800">Katalog</Link>
                    {product.category && (
                        <>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                            <Link href={route('catalog', { category: product.category.slug })} className="min-w-0 max-w-[40%] truncate hover:text-crimson-800">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 truncate font-bold text-gray-900">{product.name}</span>
                </nav>

                {/* Main Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE3D3] shadow-sm">
                    
                    {/* LEFT: GALLERY */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Main Preview */}
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
                            <ImageWithFallback
                                src={selectedImage}
                                alt={selectedVariant?.image ? `${product.name} - ${selectedVariant.name}` : product.name}
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
                        {(variantsWithImages.length > 0 || gallery.length > 1) && (
                        <div className="grid grid-cols-4 gap-3">
                            {thumbnails.map((thumbnail, idx) => {
                                const isSelected = thumbnail.variant
                                    ? selectedVariant?.id === thumbnail.variant.id
                                    : selectedImage === thumbnail.image;

                                return (
                                    <button
                                        key={thumbnail.variant?.id ?? `gallery-${thumbnail.index}`}
                                        type="button"
                                        onClick={() => {
                                            if (thumbnail.variant) {
                                                selectVariant(thumbnail.variant);
                                            } else {
                                                setSelectedImage(thumbnail.image);
                                            }
                                        }}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                                            isSelected
                                                ? 'border-crimson-700 shadow-md ring-2 ring-crimson-700/20'
                                                : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <ImageWithFallback
                                            src={thumbnail.image}
                                            alt={thumbnail.variant ? `Gambar varian ${thumbnail.variant.name}` : `thumbnail-${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                        )}
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
                                    {variants.map((v) => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => selectVariant(v)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
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
                                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                                        disabled={quantity >= availableStock}
                                        className="w-9 h-9 flex items-center justify-center font-bold text-gray-600 hover:text-crimson-800 hover:bg-gray-50 rounded-r-xl transition disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className={`text-xs font-semibold ${isOutOfStock ? 'text-red-600' : 'text-gray-500'}`}>
                                    {isOutOfStock ? 'Stok habis' : `Stok ${availableStock}`}
                                </span>
                            </div>

                            {/* Buttons */}
                            {product.is_platform_admin ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                                    Akun admin tidak dapat membeli produk dari halaman ini.{' '}
                                    <Link href={route('admin.products.edit', product.id)} className="font-bold underline">
                                        Kelola produk
                                    </Link>
                                </div>
                            ) : product.is_own_product ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                                    Ini produk dari tokomu sendiri, jadi tidak bisa dibeli dari akun ini.{' '}
                                    <Link href={route('admin.products.edit', product.id)} className="font-bold underline">
                                        Edit produk
                                    </Link>
                                </div>
                            ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleAddToCart(false)}
                                    disabled={isOutOfStock}
                                    className="w-full py-3.5 px-6 rounded-2xl border-2 border-crimson-800 bg-white text-crimson-800 hover:bg-crimson-50 font-extrabold text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>Tambah ke Keranjang</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAddToCart(true)}
                                    disabled={isOutOfStock}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-crimson-800 hover:bg-crimson-900 text-white font-extrabold text-xs shadow-md shadow-crimson-900/20 transition active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span>{isOutOfStock ? 'Stok Habis' : 'Beli Sekarang'}</span>
                                </button>
                            </div>
                            )}
                        </div>

                        {/* Freebies note */}
                        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>{product.includes_knife ? 'Sudah Termasuk Box & Pisau' : 'Sudah Termasuk Box'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-pink-600" />
                                <span>Lilin spiral Rp3.000 per batang</span>
                            </div>
                        </div>

                    </div>

                </div>

                {/* REVIEWS */}
                <section aria-labelledby="reviews-heading" className="mt-12 rounded-3xl border border-[#EBE3D3] bg-white p-6 shadow-sm sm:p-10">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2 id="reviews-heading" className="text-xl font-extrabold text-gray-900">Ulasan Pembeli</h2>
                        <span className="text-xs font-semibold text-gray-500">
                            {reviewCount > 0 ? `${ratingAverage.toFixed(1)} dari 5 · ${reviewCount} ulasan` : 'Belum ada ulasan'}
                        </span>
                    </div>
                    {product.reviews?.length > 0 ? (
                        <ul className="mt-6 divide-y divide-gray-100">
                            {product.reviews.map((review) => (
                                <li key={review.id} className="py-4 first:pt-0 last:pb-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900">{review.user?.name ?? 'Pembeli'}</span>
                                        <span className="flex" aria-label={`${review.rating} dari 5 bintang`}>
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <Star
                                                    key={value}
                                                    aria-hidden="true"
                                                    className={`h-3.5 w-3.5 ${value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                            {new Date(review.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                        </span>
                                    </div>
                                    {review.comment && <p className="mt-1 break-words text-sm text-gray-600">{review.comment}</p>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 text-sm text-gray-500">Ulasan muncul setelah pembeli menerima pesanannya dan memberi rating.</p>
                    )}
                </section>

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
