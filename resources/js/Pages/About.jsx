import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Cake, Sparkles, Heart, ShieldCheck, Clock, Award, ArrowRight } from 'lucide-react';

export default function About() {
    return (
        <MarketplaceLayout>
            <Head title="Tentang Kami - LAPAKan" />

            {/* HEADER BANNER */}
            <div className="bg-gradient-to-r from-crimson-900 via-crimson-800 to-crimson-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
                <div className="max-w-3xl mx-auto space-y-4 relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-pink-300">Cerita Kami</span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Tentang LAPAKan</h1>
                    <p className="text-pink-100/80 text-sm sm:text-base leading-relaxed">
                        Platform marketplace dessert dan kue perayaan yang menghadirkan kebahagiaan di setiap momen manismu.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
                
                {/* STORY SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-6 space-y-6">
                        <span className="text-xs font-bold uppercase tracking-wider text-crimson-700 bg-crimson-50 px-3.5 py-1 rounded-full">
                            Misi & Dedikasi Kami
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                            Menghubungkan Momen Berharga dengan Sentuhan Rasa Istimewa
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            LAPAKan lahir dari kecintaan kami terhadap seni pastry dan keinginan untuk mempermudah siapa saja menemukan kue berkualitas tinggi untuk perayaan istimewa. Mulai dari kue ulang tahun dengan dekorasi custom, Korean bento cake yang sedang tren, hingga dessert box lumer untuk dinikmati bersama sahabat.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Kami percaya setiap gigitan kue menyimpan cerita, tawa, dan kenangan berharga. Karena itu, setiap baker mitra kami dipilih melalui kurasi ketat demi memastikan rasa, estetika, dan kebersihan yang terbaik.
                        </p>
                        <div className="pt-2">
                            <Link
                                href={route('catalog')}
                                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-bold shadow-md transition hover:scale-105"
                            >
                                <span>Lihat Menu Kue Kami</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-6">
                        <div className="grid grid-cols-2 gap-4">
                            <img
                                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop"
                                alt="Cake 1"
                                className="rounded-3xl shadow-lg w-full h-56 object-cover transform hover:-translate-y-1 transition"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=600&auto=format&fit=crop"
                                alt="Cake 2"
                                className="rounded-3xl shadow-lg w-full h-56 object-cover transform translate-y-6 hover:translate-y-4 transition"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=600&auto=format&fit=crop"
                                alt="Cake 3"
                                className="rounded-3xl shadow-lg w-full h-56 object-cover transform hover:-translate-y-1 transition"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=600&auto=format&fit=crop"
                                alt="Cake 4"
                                className="rounded-3xl shadow-lg w-full h-56 object-cover transform translate-y-6 hover:translate-y-4 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* 3 CORE VALUES MATCHING FIGMA */}
                <div className="space-y-8">
                    <div className="text-center max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-crimson-700">Kenapa Memilih Kami?</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Keunggulan LAPAKan</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-3xl p-8 border border-[#EBE3D3] shadow-sm text-center space-y-4 hover:shadow-md transition">
                            <div className="w-16 h-16 rounded-2xl bg-pink-100 text-crimson-800 flex items-center justify-center mx-auto">
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Bahan Premium Berkualitas</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Selalu menggunakan butter berkualitas, cokelat Belgia asli, dan buah-buahan segar tanpa bahan pengawet buatan.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-[#EBE3D3] shadow-sm text-center space-y-4 hover:shadow-md transition">
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Custom Ucapan & Lilin Ulang Tahun</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Buat kue perayaanmu lebih personal dengan pesan khusus di atas kue, kartu ucapan eksklusif, dan lilin spiral Rp3.000 per batang.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-[#EBE3D3] shadow-sm text-center space-y-4 hover:shadow-md transition">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Pengiriman Tepat Waktu</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Jadwalkan tanggal dan jam pengiriman sesuai kebutuhan acaramu dengan armada khusus pengantaran kue yang aman.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </MarketplaceLayout>
    );
}
