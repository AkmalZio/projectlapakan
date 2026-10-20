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

            <div className="space-y-6">
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b1f3f]">LAPAKan</p>
                    <h1 className="text-3xl font-black text-[#2d1a1f]">Masuk</h1>
                    <p className="text-sm text-[#67595d]">Silakan masuk untuk melanjutkan pesanan dan riwayatmu.</p>
                </div>

                {status && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-bold text-[#3a2b2f]">Email</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#8b1f3f]" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-[#dbc7a5] bg-white px-10 py-3 text-sm text-[#2a1d20] placeholder:text-[#7f6a70] focus:border-[#8b1f3f] focus:outline-none focus:ring-2 focus:ring-[#8b1f3f]/15"
                                placeholder="nama@email.com"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-bold text-[#3a2b2f]">Password</label>
                        <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#8b1f3f]" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-xl border border-[#dbc7a5] bg-white px-10 py-3 text-sm text-[#2a1d20] placeholder:text-[#7f6a70] focus:border-[#8b1f3f] focus:outline-none focus:ring-2 focus:ring-[#8b1f3f]/15"
                                placeholder="Masukkan password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-3.5 text-[#7a5b62] transition hover:text-[#8b1f3f]"
                                aria-label="Tampilkan password"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex items-center gap-2 text-sm text-[#5f4a50]">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-[#c9b07d] text-[#8b1f3f] focus:ring-[#8b1f3f]"
                            />
                            Ingat saya
                        </label>

                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-sm font-semibold text-[#8b1f3f] hover:underline">
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-[#7d0f2e] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#99183d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="border-t border-[#dccaa5] pt-5 text-center text-sm text-[#5f4a50]">
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="font-bold text-[#8b1f3f] hover:underline">
                        Daftar sekarang
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
