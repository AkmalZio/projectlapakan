import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import ProductCard from '@/Components/ProductCard';
import { Cake, Sparkles, Truck, ShieldCheck, HeartHandshake, ArrowRight, Star, Gift } from 'lucide-react';

export default function Home({ categories = [], featuredProducts = [] }) {
    return (
        <MarketplaceLayout>
            <Head title="Pilihan Kue & Dessert Terbaik untuk Momen Spesialmu" />

            {/* HERO SECTION - Dark Crimson Matching Figma */}
            <section className="relative overflow-hidden bg-[linear-gradient(135deg,#6d0f2f,#9f2348,#3b0b1d)] text-white py-16 lg:py-24">
                {/* Background decorative blurs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Hero Text */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wider text-pink-200">
                                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                                <span>ARTISAN DESSERT & CUSTOM CAKES</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                                Temukan Kue Spesial <br className="hidden sm:inline" />
                                Untuk <span className="text-amber-300v  decoration-wavy decoration-2">Momen Spesialmu</span>                            </h1>

                            <p className="text-base sm:text-lg text-pink-100/80 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                                Pesan kue ulang tahun custom, Korean bento cake, cheesecake lembut, dan sajian manis berkualitas langsung dari pastry chef berpengalaman.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                                <Link
                                    href={route('catalog')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-crimson-900 hover:bg-pink-100 font-extrabold text-sm shadow-xl shadow-crimson-950/40 transition duration-200 hover:scale-105 active:scale-95"
                                >
                                    <span>Belanja Sekarang</span>
                                    <ArrowRight className="w-4 h-4 text-crimson-700" />
                                </Link>
                                <Link
                                    href={route('about')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-crimson-800/80 hover:bg-crimson-800 text-pink-100 border border-pink-300/30 font-bold text-sm transition duration-200"
                                >
                                    <span>Tentang Kami</span>
                                </Link>
                            </div>

                            {/* Trust metrics */}
                            <div className="pt-6 border-t border-white/10 flex items-center justify-center lg:justify-start gap-8 text-xs font-medium text-pink-200/80">
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                                    <span><strong>4.9 / 5.0</strong> dari 1.200+ Ulasan</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>100% Halal & Higienis</span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image Showcase */}
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative w-full max-w-md">
                                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-amber-300 rounded-3xl transform rotate-3 opacity-20 blur-lg scale-95" />
                                <div className="relative rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-crimson-950">
                                    <img
                                        src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop"
                                        alt="Chocolate Drip Cake Signature"
                                        className="w-full h-96 object-cover object-center transform hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs text-pink-300 font-semibold block">Kue Terlaris Bulan Ini</span>
                                                <h4 className="font-bold text-sm">Chocolate Drip Cake</h4>
                                            </div>
                                            <span className="text-base font-extrabold text-white">Rp 280.000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 4 VALUE PROPOSITIONS */}
            <section className="py-10 bg-white border-b border-[#EBE3D3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3.5 p-3">
                            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-crimson-700 flex items-center justify-center flex-shrink-0">
                                <Cake className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Freshly Baked</h4>
                                <p className="text-xs text-gray-500">Dibuat segar setiap hari</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5 p-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Custom Ucapan</h4>
                                <p className="text-xs text-gray-500">Kartu ucapan gratis, lilin Rp3.000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5 p-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-crimson-800 flex items-center justify-center flex-shrink-0">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Pengiriman Terjadwal</h4>
                                <p className="text-xs text-gray-500">Bisa pilih tanggal & jam</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5 p-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Bahan Premium</h4>
                                <p className="text-xs text-gray-500">Butter & cokelat impor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORY EXPLORATION */}
            <section className="py-12 bg-[#FAF6EE]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-crimson-700">Kategori Pilihan</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Pilih Sajian Favoritmu</h2>
                        </div>
                        <Link 
                            href={route('catalog')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-800 hover:text-crimson-900 hover:underline"
                        >
                            <span>Lihat Semua Produk</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={route('catalog', { category: category.slug })}
                                className="group p-5 rounded-2xl bg-white border border-[#EBE3D3] hover:border-crimson-600 hover:shadow-lg transition-all text-center flex flex-col items-center gap-3"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-crimson-50 group-hover:bg-crimson-700 text-crimson-700 group-hover:text-white flex items-center justify-center transition-colors">
                                    <Cake className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-sm text-gray-800 group-hover:text-crimson-800 transition">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRODUK TERBAIK KAMI SECTION - MATCHING FIGMA */}
            <section className="py-16 bg-white border-t border-[#EBE3D3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-crimson-700">Menu Rekomendasi</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
                            Produk Terbaik Kami
                        </h2>
                        <p className="text-gray-500 text-sm mt-3">
                            Dipilih langsung dari kue dan sajian manis paling digemari pelanggan setia LAPAKan.
                        </p>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href={route('catalog')}
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white font-bold text-sm shadow-lg shadow-crimson-900/20 transition hover:scale-105 active:scale-95"
                        >
                            <span>Jelajahi Seluruh Katalog Kami</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* SPECIAL CELEBRATION CTA BANNER */}
            <section className="py-16 bg-[#FAF6EE]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-gradient-to-r from-crimson-900 to-crimson-800 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
                            <Cake className="w-96 h-96 text-white" />
                        </div>

                        <div className="relative z-10 max-w-2xl space-y-5">
                            <span className="px-3.5 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-pink-200">
                                Pre-Order Spesial Ulang Tahun
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                                Mau Pesan Kue Custom Sesuai Keinginanmu?
                            </h2>
                            <p className="text-pink-100/90 text-sm sm:text-base leading-relaxed">
                                Konsultasikan desain kue impian, tulisan ucapan khusus, atau request rasa spesial langsung dengan baker kami.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-4">
                                <a
                                    href="https://wa.me/6281298765432?text=Halo%20LAPAKan,%20saya%20ingin%20konsultasi%20kue%20custom"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-crimson-900 hover:bg-pink-100 font-extrabold text-sm shadow-md transition hover:scale-105 active:scale-95"
                                >
                                    <span>Hubungi Baker via WhatsApp</span>
                                    <ArrowRight className="w-4 h-4 text-crimson-700" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketplaceLayout>
    );
}
