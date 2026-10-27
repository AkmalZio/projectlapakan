import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    CircleDollarSign,
    LogOut,
    Package,
    ShoppingBag,
    Store,
    UserRound,
} from 'lucide-react';

const orderStatusLabels = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    baking: 'Diproses',
    delivering: 'Dikirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const orderStatusStyles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    baking: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    delivering: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    completed: 'bg-green-50 text-green-700 ring-green-600/20',
    cancelled: 'bg-gray-100 text-gray-600 ring-gray-500/20',
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

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

export default function Dashboard({ store, stats = {}, recentOrders = [], lowStockProducts = [] }) {
    return (
        <MarketplaceLayout title="Dashboard Penjual">
            <Head title="Dashboard Penjual" />

            <div className="lapakan-dashboard-shell">
                <section className="lapakan-dashboard-hero">
                    <div className="relative z-10 max-w-2xl">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-pink-100">
                                <Store aria-hidden="true" className="h-3.5 w-3.5" />
                                Ruang penjual · {store?.name ?? 'Toko Saya'}
                            </span>
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${store?.is_open ? 'bg-green-400/15 text-green-100' : 'bg-white/10 text-white/75'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${store?.is_open ? 'bg-green-300' : 'bg-white/50'}`} />
                                {store?.is_open ? 'Toko buka' : 'Toko tutup'}
                            </span>
                        </div>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                            Selamat datang di {store?.name ?? 'toko kamu'}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-white/75">
                            Pantau pesanan, penjualan, dan ketersediaan produk tokomu dari satu tempat.
                        </p>
                    </div>
                    <Link
                        href={route('admin.dashboard')}
                        className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-crimson-950 shadow-lg shadow-crimson-950/20 transition hover:-translate-y-0.5 hover:bg-cream-50"
                    >
                        Kelola pesanan & produk
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
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
                        <LogOut aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </section>

                <section aria-label="Ringkasan performa toko" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Penjualan bulan ini"
                        value={formatCurrency(stats.monthly_revenue)}
                        description="Total pesanan yang sudah dibayar"
                        icon={CircleDollarSign}
                        accent="bg-green-50 text-green-700"
                    />
                    <StatCard
                        label="Pesanan perlu diproses"
                        value={stats.orders_to_process ?? 0}
                        description="Menunggu konfirmasi atau diproses"
                        icon={ShoppingBag}
                        accent="bg-amber-50 text-amber-700"
                    />
                    <StatCard
                        label="Produk aktif"
                        value={stats.active_products ?? 0}
                        description="Tersedia untuk dipesan pelanggan"
                        icon={Package}
                        accent="bg-blue-50 text-blue-700"
                    />
                    <StatCard
                        label="Stok menipis"
                        value={stats.low_stock_products ?? 0}
                        description="Produk aktif dengan stok 5 atau kurang"
                        icon={AlertTriangle}
                        accent="bg-rose-50 text-rose-700"
                    />
                </section>

                <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
                    <div className="lapakan-dashboard-card overflow-hidden">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="font-semibold text-gray-900">Pesanan terbaru</h2>
                                <p className="mt-1 text-sm text-gray-500">Aktivitas pesanan tokomu</p>
                            </div>
                            <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-crimson-900">
                                {stats.total_orders ?? 0} pesanan
                            </span>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[38rem] text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Pesanan</th>
                                            <th className="px-6 py-3 font-medium">Pembeli</th>
                                            <th className="px-6 py-3 font-medium">Tanggal</th>
                                            <th className="px-6 py-3 font-medium">Total</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                                                    {order.order_number}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                                    {order.user?.name ?? 'Pelanggan'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                                    {formatCurrency(order.total_amount)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                                                            orderStatusStyles[order.status] ??
                                                            'bg-gray-100 text-gray-600 ring-gray-500/20'
                                                        }`}
                                                    >
                                                        {orderStatusLabels[order.status] ?? order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <ShoppingBag aria-hidden="true" className="mx-auto h-9 w-9 text-gray-300" />
                                <p className="mt-3 font-medium text-gray-900">Belum ada pesanan</p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Pesanan baru akan muncul di sini.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="lapakan-dashboard-card">
                        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                            <h2 className="font-semibold text-gray-900">Perlu restok</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Produk aktif dengan stok paling banyak 5
                            </p>
                        </div>

                        {lowStockProducts.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {lowStockProducts.map((product) => (
                                    <li key={product.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {product.name}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-gray-500">
                                                {product.category?.name ?? 'Tanpa kategori'}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                product.stock === 0
                                                    ? 'bg-rose-50 text-rose-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
                                            Stok {product.stock}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-6 py-10 text-center">
                                <Package aria-hidden="true" className="mx-auto h-8 w-8 text-gray-300" />
                                <p className="mt-3 text-sm font-medium text-gray-900">
                                    Stok produk aman
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Tidak ada produk aktif yang perlu direstok.
                                </p>
                            </div>
                        )}

                        <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                            <Link
                                href={route('admin.dashboard')}
                                className="text-sm font-semibold text-crimson-800 transition hover:text-crimson-600"
                            >
                                Buka pengelolaan produk
                                <span aria-hidden="true"> &rarr;</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </MarketplaceLayout>
    );
}
