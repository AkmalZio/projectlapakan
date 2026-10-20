import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Search, Cake, Phone, MapPin, Clock, Menu, X, ChevronRight, User, CheckCircle2 } from 'lucide-react';

export default function MarketplaceLayout({ children, title }) {
    const { auth, cartCount, flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get(route('catalog'), { search: searchQuery.trim() });
        } else {
            router.get(route('catalog'));
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--lapakan-bg)] text-gray-800 selection:bg-crimson-700 selection:text-white">
            {/* Main Header / Navbar */}
            <header className="sticky top-0 z-40 bg-[#7b0d2d] text-white border-b border-[#5d0a20] shadow-[0_8px_18px_rgba(28,10,18,0.18)] rounded-b-[18px]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 gap-4">
                        
                        {/* Logo LAPAKan */}
                        <Link href={route('home')} className="flex items-center gap-2 group flex-shrink-0 text-white">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md shadow-[#4d0a22]/30 group-hover:scale-105 transition-transform">
                                <Cake className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-2xl tracking-tight leading-none text-white">
                                    LAPAK<span className="text-[#f7d0db]">an</span>
                                </span>
                                <span className="text-[10px] font-semibold text-[#f7dfe7] tracking-wider uppercase">
                                    Cakes & Desserts
                                </span>
                            </div>
                        </Link>

                        {/* Search Bar - Center */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[540px] mx-4">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Cari chocolate cake, bento cake, brownies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white text-gray-700 placeholder-gray-400 pl-11 pr-4 py-3 rounded-full border border-white/80 text-sm shadow-inner shadow-[#f0d8df]/30 focus:outline-none focus:border-[#f7dfe7] focus:ring-2 focus:ring-[#f7dfe7]/30 transition"
                                />
                                <Search className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
                            </div>
                        </form>

                        {/* Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#f7e0e8]">
                            <Link 
                                href={route('home')} 
                                className={`transition hover:text-white ${route().current('home') ? 'text-white font-bold' : ''}`}
                            >
                                Home
                            </Link>
                            <Link 
                                href={route('catalog')} 
                                className={`transition hover:text-white ${route().current('catalog*') ? 'text-white font-bold' : ''}`}
                            >
                                Katalog
                            </Link>
                            <Link 
                                href={route('orders.index')} 
                                className={`transition hover:text-white ${route().current('orders.index') ? 'text-white font-bold' : ''}`}
                            >
                                Pesanan Saya
                            </Link>
                            <Link 
                                href={route('about')} 
                                className={`transition hover:text-white ${route().current('about') ? 'text-white font-bold' : ''}`}
                            >
                                Tentang Kami
                            </Link>
                        </nav>

                        {/* Right Actions: Cart & Auth */}
                        <div className="flex items-center gap-3">
                            {/* Shopping Cart Button */}
                            <Link 
                                href={route('cart.index')} 
                                className="relative p-2.5 rounded-full bg-[#a2284c] hover:bg-[#b12d55] text-white border border-white/10 shadow-sm transition group"
                                title="Keranjang Belanja"
                            >
                                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#f9d7de] text-[#7b0d2d] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Button */}
                            {auth?.user ? (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link 
                                        href={route('dashboard')} 
                                        className="flex items-center gap-2 py-2 px-4 rounded-full bg-[#a2284c] border border-white/10 text-xs font-semibold text-white hover:bg-[#b12d55] shadow-sm transition"
                                    >
                                        <User className="w-4 h-4 text-white" />
                                        <span>{auth.user.name.split(' ')[0]}</span>
                                    </Link>

                                </div>
                            ) : (
                                <Link 
                                    href={route('login')} 
                                    className="hidden sm:inline-flex items-center justify-center py-2 px-5 rounded-full bg-[#4a071c] hover:bg-[#5e0d22] text-white text-xs font-bold tracking-wide shadow-md shadow-[#4a071c]/20 transition hover:scale-[1.02] active:scale-95"
                                >
                                    Masuk
                                </Link>
                            )}

                            {/* Mobile Hamburger Toggle */}
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-[#E5DCCB] bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
                        <form onSubmit={handleSearch} className="pt-2">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Cari kue..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            </div>
                        </form>
                        <div className="flex flex-col gap-2 pt-2 text-sm font-semibold text-white">
                            <Link href={route('home')} className="px-3 py-2 rounded-lg hover:bg-[#a2284c] text-white">Home</Link>
                            <Link href={route('catalog')} className="px-3 py-2 rounded-lg hover:bg-[#a2284c] text-white">Katalog</Link>
                            <Link href={route('orders.index')} className="px-3 py-2 rounded-lg hover:bg-[#a2284c] text-white">Pesanan Saya</Link>
                            <Link href={route('about')} className="px-3 py-2 rounded-lg hover:bg-[#a2284c] text-white">Tentang Kami</Link>
                            <Link href={route('cart.index')} className="px-3 py-2 rounded-lg hover:bg-[#a2284c] text-white flex justify-between">
                                <span>Keranjang</span>
                                <span className="bg-[#f9d7de] text-[#7b0d2d] text-xs px-2 py-0.5 rounded-full">{cartCount || 0}</span>
                            </Link>
                            {auth?.user ? (
                                <>
                                    <Link href={route('dashboard')} className="px-3 py-2 rounded-lg bg-[#4a071c] text-white">Dashboard ({auth.user.name})</Link>
                                </>
                            ) : (
                                <Link href={route('login')} className="px-3 py-2 text-center rounded-xl bg-[#4a071c] text-white font-bold">Masuk / Daftar</Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Flash Message Toast Notification */}
            {flash?.success && (
                <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span className="text-sm font-semibold">{flash.success}</span>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lapakan-page-shell">
                <div className="lapakan-panel rounded-[28px] overflow-hidden">
                    {children}
                </div>
            </main>

            {/* Footer - Dark Crimson matching Figma */}
            <footer className="bg-[linear-gradient(180deg,#771632,#4b0d23)] text-pink-50 pt-16 pb-12 border-t-4 border-crimson-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                        
                        {/* Column 1: Brand Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-white text-crimson-900 flex items-center justify-center font-bold">
                                    <Cake className="w-5 h-5 text-crimson-700" />
                                </div>
                                <span className="text-2xl font-extrabold tracking-tight text-white">
                                    LAPAK<span className="text-pink-300">an</span>
                                </span>
                            </div>
                            <p className="text-pink-200/80 text-sm leading-relaxed">
                                Marketplace dessert & custom cakes terpercaya. Menghubungkan pecinta sajian manis dengan pastry chef & baker artisan terbaik.
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-crimson-800 flex items-center justify-center hover:bg-pink-600 transition text-white">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                                <a href="https://wa.me/6281298765432" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-crimson-800 flex items-center justify-center hover:bg-pink-600 transition text-white">
                                    <Phone className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Navigasi Cepat */}
                        <div>
                            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">Navigasi</h4>
                            <ul className="space-y-2.5 text-sm text-pink-200/80">
                                <li><Link href={route('home')} className="hover:text-white transition">Beranda</Link></li>
                                <li><Link href={route('catalog')} className="hover:text-white transition">Katalog Produk</Link></li>
                                <li><Link href={route('about')} className="hover:text-white transition">Tentang Kami</Link></li>
                                <li><Link href={route('cart.index')} className="hover:text-white transition">Keranjang Belanja</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Kategori Favorit */}
                        <div>
                            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">Kategori Favorit</h4>
                            <ul className="space-y-2.5 text-sm text-pink-200/80">
                                <li><Link href={route('catalog', { category: 'celebration-cake' })} className="hover:text-white transition">Birthday Cakes</Link></li>
                                <li><Link href={route('catalog', { category: 'bento-cake' })} className="hover:text-white transition">Bento Cakes</Link></li>
                                <li><Link href={route('catalog', { category: 'cheesecake-slice' })} className="hover:text-white transition">Burnt Cheesecakes</Link></li>
                                <li><Link href={route('catalog', { category: 'pastries-breads' })} className="hover:text-white transition">Garlic Breads & Pastries</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Kontak & Lokasi */}
                        <div>
                            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">Layanan Pelanggan</h4>
                            <div className="space-y-3 text-sm text-pink-200/80">
                                <div className="flex items-start gap-2.5">
                                    <MapPin className="w-4 h-4 text-pink-300 mt-0.5 flex-shrink-0" />
                                    <span>Gg. Olahraga No.20, Ciriung, Kec. Cibinong, Kabupaten Bogor, Jawa Barat 16918</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-pink-300 flex-shrink-0" />
                                    <span>+62 812-456-7890 (WhatsApp)</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Clock className="w-4 h-4 text-pink-300 flex-shrink-0" />
                                    <span>Buka Setiap Hari: 08:00 - 20:00 WIB</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="border-t border-crimson-800/80 pt-8 text-center text-xs text-pink-300/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p>© {new Date().getFullYear()} LAPAKan. All rights reserved. Made with love for sweet moments.</p>
                        <div className="flex gap-6">
                            <span className="hover:text-white cursor-pointer">Kebijakan Privasi</span>
                            <span className="hover:text-white cursor-pointer">Syarat & Ketentuan</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
