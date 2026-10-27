import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Crown, ShieldCheck, Store, Users, UserRound } from 'lucide-react';
import { useState } from 'react';

function StatCard({ label, value, description, icon: Icon, accent }) {
    return (
        <div className="lapakan-dashboard-card flex items-start justify-between gap-4 p-5">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
                <p className="mt-1 text-xs text-gray-500">{description}</p>
            </div>
            <div className={`rounded-xl p-3 ${accent}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
        </div>
    );
}

function UserRoleSelect({ user }) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const updateRole = (event) => {
        const role = event.target.value;

        setError(null);
        router.patch(route('superadmin.users.update-role', { user: user.id }), { role }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onError: (errors) => setError(errors.role),
        });
    };

    return (
        <div>
            <label className="sr-only" htmlFor={`user-role-${user.id}`}>
                Role untuk {user.name}
            </label>
            <select
                id={`user-role-${user.id}`}
                value={user.role}
                onChange={updateRole}
                disabled={processing}
                className="w-full min-w-36 rounded-xl border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition focus:border-crimson-700 focus:ring-crimson-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
                <option value="customer">Customer</option>
                <option value="merchant">Merchant</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
            </select>
            {error && (
                <p className="mt-1.5 text-xs text-red-600">{error}</p>
            )}
            {processing && (
                <p className="mt-1.5 text-xs text-gray-500" role="status">
                    Menyimpan perubahan...
                </p>
            )}
        </div>
    );
}

export default function Dashboard({ users = [], stats = {}, success }) {
    return (
        <MarketplaceLayout title="Dashboard Super Admin">
            <Head title="Dashboard Super Admin" />

            <div className="lapakan-dashboard-shell">
                <section className="lapakan-dashboard-hero">
                    <div className="relative z-10 max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-pink-100">
                            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                            Pusat administrasi
                        </div>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                            Kendalikan akses LAPAKan
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-white/75">
                            Pantau pengguna dan atur peran agar setiap orang mendapat akses yang tepat.
                        </p>
                    </div>
                    <Crown aria-hidden="true" className="relative z-10 hidden h-12 w-12 text-cream-100 sm:block" />
                    <Link
                        href={route('profile.edit')}
                        className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                        Profil
                        <UserRound aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                        Keluar
                    </Link>
                </section>

                {success && (
                    <div
                        className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800"
                        role="status"
                    >
                        {success}
                    </div>
                )}

                <section aria-label="Ringkasan pengguna" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard
                        label="Total pengguna"
                        value={stats.total_users ?? 0}
                        description="Semua akun yang terdaftar"
                        icon={Users}
                        accent="bg-blue-50 text-blue-700"
                    />
                    <StatCard
                        label="Admin & penjual"
                        value={stats.total_admins ?? 0}
                        description="Pengelola dan pemilik toko"
                        icon={Store}
                        accent="bg-amber-50 text-amber-700"
                    />
                    <StatCard
                        label="Super Admin"
                        value={stats.total_super_admins ?? 0}
                        description="Akun dengan kendali penuh"
                        icon={ShieldCheck}
                        accent="bg-crimson-50 text-crimson-800"
                    />
                </section>

                <section className="lapakan-dashboard-card overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 className="font-semibold text-gray-900">Pengguna & peran</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Perbarui tingkat akses akun yang terdaftar.
                            </p>
                        </div>
                        <span className="w-fit rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-crimson-900">
                            {users.length} pengguna
                        </span>
                    </div>

                    {users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[42rem] text-left text-sm">
                                <thead className="bg-cream-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3 font-medium sm:px-6">Pengguna</th>
                                        <th className="px-5 py-3 font-medium sm:px-6">Email</th>
                                        <th className="px-5 py-3 font-medium sm:px-6">Peran akses</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="transition hover:bg-cream-50/60">
                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-sm font-bold text-crimson-800">
                                                        {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 sm:px-6">
                                                {user.email}
                                            </td>
                                            <td className="px-5 py-4 sm:px-6">
                                                <UserRoleSelect user={user} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center px-6 py-14 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-100 text-crimson-700">
                                <Users aria-hidden="true" className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 font-semibold text-gray-900">Belum ada pengguna</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Akun yang terdaftar akan muncul di sini.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </MarketplaceLayout>
    );
}
