import { Cake } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#efe5d1] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[28px] border border-[#d9caa6] bg-[#efe5d1] shadow-[0_20px_40px_rgba(58,17,24,0.12)]">
                <header className="bg-[#7d0f2e] px-5 py-4 sm:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <Link href={route('home')} className="flex items-center gap-3 text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                                <Cake className="h-5 w-5" />
                            </div>
                            <div className="leading-none">
                                <div className="text-2xl font-black tracking-tight">
                                    LAPAK<span className="text-[#f7d5df]">an</span>
                                </div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f5dfe7]">
                                    Cakes & Desserts
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route('home')}
                            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                        >
                            Kembali ke Home
                        </Link>
                    </div>
                </header>

                <main className="grid min-h-[760px] items-center justify-center px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
                    <div className="hidden h-full items-center justify-center rounded-[24px] bg-[radial-gradient(circle_at_top,_rgba(128,0,45,0.18),_transparent_45%),linear-gradient(135deg,#7d0f2e,#9d1c45,#5f0b1f)] p-6 text-white lg:flex">
                        <div className="max-w-md space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-pink-100">
                                <span className="inline-block h-2 w-2 rounded-full bg-pink-200" />
                                Selamat Datang
                            </div>

                            <h1 className="text-4xl font-black leading-tight tracking-tight">
                                Kue spesial untuk momen yang tak terlupakan.
                            </h1>

                            <p className="text-sm leading-7 text-pink-100/90">
                                Nikmati dessert premium, kue custom, dan pengiriman tepat waktu untuk setiap perayaan spesialmu.
                            </p>

                            <div className="grid gap-3 text-sm text-pink-100/90">
                                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">✓</span>
                                    Kue custom sesuai tema acara
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">✓</span>
                                    Bahan premium dan dibuat fresh
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">✓</span>
                                    Pengiriman aman & tepat waktu
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-[460px] rounded-[28px] border border-[#d7c7a2] bg-[#f9f4ea] p-6 shadow-[0_18px_30px_rgba(59,20,26,0.08)] sm:p-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
