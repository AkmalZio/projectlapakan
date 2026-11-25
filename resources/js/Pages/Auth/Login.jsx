import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="space-y-7">
                <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b2448]">Akun LAPAKan</p>
                    <h1 className="text-[32px] font-black leading-tight tracking-tight text-[#351b22] sm:text-4xl">Selamat datang</h1>
                    <p className="text-sm leading-6 text-[#75676a]">Masuk untuk melanjutkan pesanan dan melihat kembali momen favoritmu.</p>
                </div>

                {status && (
                    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm font-medium text-emerald-700">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-[13px] font-bold text-[#3a2b2f]">Email</label>
                        <div className="relative">
                            <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b2448]" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-[#e7ded2] bg-[#fffdfa] py-3.5 pl-11 pr-4 text-sm text-[#2a1d20] placeholder:text-[#9b8b8b] transition focus:border-[#9b2448] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#9b2448]/10"
                                placeholder="nama@email.com"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-[13px] font-bold text-[#3a2b2f]">Password</label>
                        <div className="relative">
                            <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b2448]" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                required
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-xl border border-[#e7ded2] bg-[#fffdfa] py-3.5 pl-11 pr-11 text-sm text-[#2a1d20] placeholder:text-[#9b8b8b] transition focus:border-[#9b2448] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#9b2448]/10"
                                placeholder="Masukkan password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#7a5b62] transition hover:text-[#8b1f3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1f3f]/30"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-[#67595d]">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-[#d7c8b7] text-[#8b1f3f] focus:ring-[#8b1f3f]/30"
                            />
                            Ingat saya
                        </label>

                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-sm font-semibold text-[#8b1f3f] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1f3f]/30">
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-[#7d0f2e] px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(125,15,46,0.16)] transition hover:-translate-y-0.5 hover:bg-[#92183b] hover:shadow-[0_12px_22px_rgba(125,15,46,0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9b2448]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="border-t border-[#eee7de] pt-5 text-center text-sm text-[#75676a]">
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="font-bold text-[#8b1f3f] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1f3f]/30">
                        Daftar sekarang
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
