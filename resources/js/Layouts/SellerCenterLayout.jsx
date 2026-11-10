import { Link, usePage } from '@inertiajs/react';
import {
    Cake,
    CheckCircle2,
    ClipboardList,
    ExternalLink,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    PackagePlus,
    UserRound,
    X,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { label: 'Ringkasan', routeName: 'seller.dashboard', icon: LayoutDashboard },
    { label: 'Pesanan', routeName: 'admin.dashboard', icon: ClipboardList },
    { label: 'Produk Saya', routeName: 'admin.products.index', icon: Package },
    { label: 'Tambah Produk', routeName: 'admin.products.create', icon: PackagePlus },
];

function SidebarContent({ user, onNavigate }) {
    return (
        <div className="flex h-full flex-col">
            <Link href={route('seller.dashboard')} className="flex items-center gap-3 px-5 py-6" onClick={onNavigate}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Cake aria-hidden="true" className="h-5 w-5" />
                </span>
                <span>
                    <span className="block text-lg font-extrabold leading-none tracking-tight">
                        LAPAK<span className="text-crimson-200">an</span>
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                        Seller Center
                    </span>
                </span>
            </Link>

            <nav aria-label="Navigasi Seller Center" className="flex-1 space-y-1 px-3">
                {navigation.map(({ label, routeName, icon: Icon }) => {
                    const isActive = route().current(routeName);

                    return (
                        <Link
                            key={routeName}
                            href={route(routeName)}
                            onClick={onNavigate}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                                isActive
                                    ? 'bg-white text-crimson-800 shadow-sm'
                                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                            {label}
                        </Link>
                    );
                })}

                <Link
                    href={route('home')}
                    className="mt-4 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                    <ExternalLink aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                    Lihat etalase
                </Link>
            </nav>

            <div className="border-t border-white/10 p-3">
                <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-xs text-white/60">{user?.email}</p>
                </div>
                <Link
                    href={route('profile.edit')}
                    className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                    <UserRound aria-hidden="true" className="h-4 w-4" />
                    Profil
                </Link>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Keluar
                </Link>
            </div>
        </div>
    );
}

export default function SellerCenterLayout({ title, description, actions, children }) {
    const { auth, flash } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#faf6f0] font-sans text-gray-800">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-crimson-950 text-white lg:block">
                <SidebarContent user={auth.user} />
            </aside>

            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu Seller Center">
                    <button
                        type="button"
                        aria-label="Tutup menu"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <aside className="relative h-full w-72 max-w-[85vw] bg-crimson-950 text-white shadow-xl">
                        <button
                            type="button"
                            aria-label="Tutup menu"
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute right-3 top-6 flex h-10 w-10 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
                        >
                            <X aria-hidden="true" className="h-5 w-5" />
                        </button>
                        <SidebarContent user={auth.user} onNavigate={() => setIsSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 border-b border-[#eadfcd] bg-[#faf6f0]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            aria-label="Buka menu"
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#eadfcd] bg-white text-crimson-800 lg:hidden"
                        >
                            <Menu aria-hidden="true" className="h-5 w-5" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-xl font-bold tracking-tight text-[#3d1725] sm:text-2xl">{title}</h1>
                            {description && <p className="mt-0.5 text-sm text-[#746b64]">{description}</p>}
                        </div>
                        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                    </div>
                </header>

                <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {flash?.success && (
                        <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                            {flash.error}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
