import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import ProductCard from '@/Components/ProductCard';
import { Filter, SlidersHorizontal, Search, RotateCcw, Cake, ChevronDown } from 'lucide-react';

export default function Catalog({ categories = [], products = { data: [] }, filters = {} }) {
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all-category');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || 1000000);
    const [sortBy, setSortBy] = useState(filters.sort || 'latest');

    const handleApplyFilter = (categorySlug = selectedCategory, newSort = sortBy, newMaxPrice = maxPrice) => {
        router.get(route('catalog'), {
            category: categorySlug,
            search: searchTerm,
            max_price: newMaxPrice,
            sort: newSort,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSelectedCategory('all-category');
        setSearchTerm('');
        setMaxPrice(1000000);
        setSortBy('latest');
        router.get(route('catalog'));
    };

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    return (
        <MarketplaceLayout>
            <Head title="Katalog Produk Kue & Dessert - LAPAKan" />

            {/* SUB-HERO BANNER */}
            <div className="bg-gradient-to-r from-crimson-900 via-crimson-800 to-crimson-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b-2 border-crimson-700 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-pink-300">Fresh from the Oven</span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Katalog Produk Kami</h1>
                        <p className="text-pink-100/80 text-sm mt-2 max-w-lg">
                            Jelajahi seluruh varian kue perayaan, dessert box lumer, pastry renyah, dan artisan bento cake favoritmu.
                        </p>
                    </div>

                    {/* Quick Search */}
                    <div className="w-full md:w-80">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari nama kue..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                                className="w-full bg-white/10 text-white placeholder-pink-200/60 pl-10 pr-4 py-2.5 rounded-full border border-white/20 text-sm focus:bg-white focus:text-gray-900 focus:outline-none transition"
                            />
                            <Search className="w-4 h-4 text-pink-300 absolute left-3.5 top-3" />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CATALOG WITH SIDEBAR FILTER */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT SIDEBAR: FILTERS */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl p-6 border border-[#EBE3D3] shadow-sm sticky top-28 space-y-6">
                            
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2 text-gray-900 font-extrabold text-base">
                                    <SlidersHorizontal className="w-4 h-4 text-crimson-700" />
                                    <span>Filter Produk</span>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="text-xs font-semibold text-gray-400 hover:text-crimson-700 flex items-center gap-1 transition"
                                    title="Reset filter"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset</span>
                                </button>
                            </div>

                            {/* Categories Filter */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kategori</h4>
                                <div className="space-y-1.5">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setSelectedCategory(cat.slug);
                                                handleApplyFilter(cat.slug);
                                            }}
                                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                                                selectedCategory === cat.slug
                                                    ? 'bg-crimson-800 text-white font-bold shadow-sm'
                                                    : 'text-gray-600 hover:bg-[#FAF6EE] hover:text-crimson-800'
                                            }`}
                                        >
                                            <span>{cat.name}</span>
                                            {selectedCategory === cat.slug && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter Slider */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Maksimal Harga</h4>
                                    <span className="text-xs font-extrabold text-crimson-800">{formatIDR(maxPrice)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="30000"
                                    max="1000000"
                                    step="10000"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-crimson-700 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                                    <span>Rp 30.000</span>
                                    <span>Rp 1.000.000</span>
                                </div>
                                <button
                                    onClick={() => handleApplyFilter(selectedCategory, sortBy, maxPrice)}
                                    className="w-full mt-3 py-2 bg-crimson-50 hover:bg-crimson-100 text-crimson-800 text-xs font-bold rounded-xl transition"
                                >
                                    Terapkan Rentang Harga
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* RIGHT: PRODUCTS GRID */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* Control Bar: Count & Sort */}
                        <div className="bg-white rounded-2xl p-4 border border-[#EBE3D3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs font-semibold text-gray-600">
                                Menampilkan <strong className="text-gray-900">{products.data ? products.data.length : products.length}</strong> produk kue pilihan
                            </p>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Urutkan:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        handleApplyFilter(selectedCategory, e.target.value);
                                    }}
                                    className="bg-[#FAF6EE] border border-[#EBE3D3] text-xs font-bold text-gray-700 py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-crimson-700 cursor-pointer"
                                >
                                    <option value="latest">Terbaru</option>
                                    <option value="price_asc">Harga Terendah</option>
                                    <option value="price_desc">Harga Tertinggi</option>
                                </select>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {(products.data && products.data.length > 0) ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border border-[#EBE3D3] space-y-4">
                                <div className="w-16 h-16 rounded-full bg-crimson-50 text-crimson-700 flex items-center justify-center mx-auto">
                                    <Cake className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Kue tidak ditemukan</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                    Tidak ada produk yang sesuai dengan filter pencarian atau rentang harga saat ini.
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2.5 rounded-full bg-crimson-800 text-white text-xs font-bold hover:bg-crimson-900 transition"
                                >
                                    Tampilkan Semua Kue
                                </button>
                            </div>
                        )}

                        {/* Pagination links if available */}
                        {products.links && products.links.length > 3 && (
                            <div className="flex justify-center items-center gap-1 pt-6">
                                {products.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                                            link.active
                                                ? 'bg-crimson-800 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-crimson-50 border border-[#EBE3D3]'
                                                : 'text-gray-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </MarketplaceLayout>
    );
}
