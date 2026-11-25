import { ArrowLeft, Cake, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#f7f3ec] px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-[1080px] overflow-hidden rounded-[24px] border border-[#eee5d8] bg-white shadow-[0_24px_70px_rgba(56,24,30,0.10)] sm:rounded-[30px]">
                <header className="flex items-center justify-between gap-4 border-b border-[#f1ece4] px-5 py-4 sm:px-8 sm:py-5">
                    <Link href={route('home')} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7d0f2e] text-white shadow-sm shadow-[#7d0f2e]/20">
                            <Cake aria-hidden="true" className="h-5 w-5" />
                        </div>
                        <div className="leading-none">
                            <div className="text-xl font-black tracking-tight text-[#351b22] sm:text-[22px]">
                                LAPAK<span className="text-[#9b2448]">an</span>
                            </div>
                            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#907c7e]">
                                Cakes & Desserts
                            </div>
                        </div>
                    </Link>

                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-2 rounded-full border border-[#eee5d8] px-3.5 py-2 text-xs font-semibold text-[#67595d] transition hover:border-[#d8bdc4] hover:bg-[#fcf8f6] hover:text-[#7d0f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1f3f]/30 sm:px-4"
                    >
                        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Kembali ke beranda</span>
                        <span className="sm:hidden">Beranda</span>
                    </Link>
                </header>

                <main className="grid gap-5 p-3 sm:gap-7 sm:p-6 lg:grid-cols-[1fr_0.92fr] lg:items-stretch lg:gap-10 lg:p-8">
                    <section className="relative isolate flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,#851538_0%,#a5264e_55%,#681027_100%)] px-6 py-7 text-white sm:min-h-[250px] sm:px-8 sm:py-8 lg:min-h-[570px] lg:justify-center lg:rounded-[24px] lg:px-10 lg:py-12">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full border-[34px] border-white/[0.07]" />
                        <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-20 -z-10 h-72 w-72 rounded-full border-[42px] border-white/[0.06]" />
                        <div className="max-w-lg space-y-5 sm:space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-pink-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-pink-200" />
                                Manisnya momen spesial
                            </div>

                            <h2 className="max-w-md text-[26px] font-black leading-[1.15] tracking-tight sm:text-3xl lg:text-[38px]">
                                Kue spesial untuk momen yang tak terlupakan.
                            </h2>

                            <p className="max-w-md text-sm leading-6 text-pink-100/90 sm:leading-7">
                                Dessert premium dan kue custom, dibuat fresh untuk merayakan cerita istimewamu.
                            </p>

                            <div className="hidden gap-3 pt-1 text-sm text-pink-100/95 lg:grid">
                                {[
                                    'Kue custom sesuai tema acara',
                                    'Bahan premium, dibuat fresh',
                                    'Pengiriman aman dan tepat waktu',
                                ].map((benefit) => (
                                    <div key={benefit} className="flex items-center gap-3">
                                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                                            <Check aria-hidden="true" className="h-4 w-4" />
                                        </span>
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center justify-center px-3 py-5 sm:px-6 sm:py-8 lg:px-5 lg:py-12">
                        <div className="w-full max-w-[400px]">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
