import SellerCenterLayout from '@/Layouts/SellerCenterLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    CircleDollarSign,
    Package,
    Plus,
    ShoppingBag,
    Store,
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
    pending: 'bg-[#fff0e2] text-[#9a5720] ring-[#e2bd91]/50',
    confirmed: 'bg-[#e8f3ec] text-[#28704c] ring-[#9bc9ac]/50',
    baking: 'bg-[#f7e7ec] text-[#832747] ring-[#d9a6b5]/50',
    delivering: 'bg-[#e8edf7] text-[#405d8c] ring-[#a9b8d5]/50',
    completed: 'bg-[#e6f4eb] text-[#28704c] ring-[#9bc9ac]/50',
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
        <div className="group flex items-start justify-between gap-4 rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-5 shadow-[0_8px_24px_rgba(74,7,28,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(74,7,28,0.09)]">
            <div>
                <p className="text-sm font-medium text-[#746b64]">{label}</p>
                <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[#3d1725]">{value}</p>
                <p className="mt-1 text-xs leading-5 text-[#8b8178]">{description}</p>
            </div>
            <div className={`rounded-2xl p-3.5 transition-transform duration-200 group-hover:rotate-[-4deg] ${accent}`}>
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            </div>
        </div>
    );
}

export default function Dashboard({ store, stats = {}, recentOrders = [], lowStockProducts = [] }) {
    return (
        <SellerCenterLayout title="Ringkasan" description="Gambaran performa tokomu hari ini.">
            <Head title="Dashboard Penjual" />

            <div className="flex w-full flex-col gap-7">
                <section className="overflow-hidden rounded-[24px] bg-gradient-to-r from-[#4a071c] to-[#7e103c] px-6 py-7 text-white shadow-[0_14px_32px_rgba(74,7,28,0.13)] sm:px-9 sm:py-9">
                    <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 flex flex-wrap items-center gap-2.5">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.09] px-3 py-1.5 text-xs font-medium text-[#f9e9ed]">
                                    <Store aria-hidden="true" className="h-3.5 w-3.5" />
                                    {store?.name ?? 'Toko Saya'}
                                </span>
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${store?.is_open ? 'bg-emerald-300/15 text-emerald-100' : 'bg-white/10 text-white/80'}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${store?.is_open ? 'bg-emerald-300' : 'bg-white/50'}`} />
                                    {store?.is_open ? 'Sedang buka' : 'Sedang tutup'}
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Halo, {store?.name ?? 'penjual'}.
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#f4dfe5]/85">
                                Pantau pesanan, penjualan, dan stok produkmu dari sini.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                href={route('admin.dashboard')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#fffaf4] px-4 py-2.5 text-sm font-semibold text-[#4a071c] shadow-sm transition hover:bg-white"
                            >
                                Kelola toko
                                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('admin.products.create')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.15]"
                            >
                                <Plus aria-hidden="true" className="h-4 w-4" />
                                Tambah produk
                            </Link>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a5466]">Gambaran singkat</p>
                            <h2 className="mt-1 text-lg font-semibold text-[#3d1725]">Ringkasan tokomu</h2>
                        </div>
                        <p className="text-xs text-[#8b8178]">Angka penjualan dihitung dari pesanan yang sudah dibayar.</p>
                    </div>
                    <section aria-label="Ringkasan performa toko" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Penjualan bulan ini"
                            value={formatCurrency(stats.monthly_revenue)}
                            description="Total pesanan yang sudah dibayar"
                            icon={CircleDollarSign}
                            accent="bg-[#e6f4eb] text-[#28704c]"
                        />
                        <StatCard
                            label="Pesanan perlu diproses"
                            value={stats.orders_to_process ?? 0}
                            description="Menunggu konfirmasi atau diproses"
                            icon={ShoppingBag}
                            accent="bg-[#fff0e2] text-[#9a5720]"
                        />
                        <StatCard
                            label="Produk aktif"
                            value={stats.active_products ?? 0}
                            description="Tersedia untuk dipesan pelanggan"
                            icon={Package}
                            accent="bg-[#f7e7ec] text-[#832747]"
                        />
                        <StatCard
                            label="Stok menipis"
                            value={stats.low_stock_products ?? 0}
                            description="Produk aktif dengan stok 5 atau kurang"
                            icon={AlertTriangle}
                            accent="bg-[#fce9e7] text-[#a33c36]"
                        />
                    </section>
                </section>

                <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
                    <div className="overflow-hidden rounded-[24px] border border-[#eadfcd] bg-[#fffdf8] shadow-[0_10px_30px_rgba(74,7,28,0.055)]">
                        <div className="flex items-center justify-between gap-4 border-b border-[#f0e8dc] px-5 py-5 sm:px-6">
                            <div>
                                <h2 className="font-semibold text-[#3d1725]">Pesanan terbaru</h2>
                                <p className="mt-1 text-sm text-[#8b8178]">Yang baru masuk ke tokomu</p>
                            </div>
                            <span className="rounded-full bg-[#f5eadf] px-3 py-1.5 text-xs font-semibold text-[#6b2338]">
                                {stats.total_orders ?? 0} pesanan
                            </span>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[38rem] text-left text-sm">
                                    <thead className="bg-[#faf5ed] text-[11px] uppercase tracking-[0.08em] text-[#8b8178]">
                                        <tr>
                                            <th className="px-6 py-3.5 font-semibold">Pesanan</th>
                                            <th className="px-6 py-3.5 font-semibold">Pembeli</th>
                                            <th className="px-6 py-3.5 font-semibold">Tanggal</th>
                                            <th className="px-6 py-3.5 font-semibold">Total</th>
                                            <th className="px-6 py-3.5 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1e9de]">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="transition-colors hover:bg-[#fcf8f1]">
                                                <td className="whitespace-nowrap px-6 py-4 font-semibold text-[#4a071c]">
                                                    {order.order_number}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-[#625a54]">
                                                    {order.user?.name ?? 'Pelanggan'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-[#8b8178]">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 font-semibold text-[#3d1725]">
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
                            <div className="px-6 py-14 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5eadf] text-[#8b3b55]">
                                    <ShoppingBag aria-hidden="true" className="h-5 w-5" />
                                </div>
                                <p className="mt-4 font-medium text-[#3d1725]">Belum ada pesanan</p>
                                <p className="mt-1 text-sm text-[#8b8178]">
                                    Pesanan baru akan muncul di sini.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-[24px] border border-[#eadfcd] bg-[#fffdf8] shadow-[0_10px_30px_rgba(74,7,28,0.055)]">
                        <div className="border-b border-[#f0e8dc] px-5 py-5 sm:px-6">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-semibold text-[#3d1725]">Perlu restok</h2>
                                <span className="rounded-full bg-[#fff0e2] px-2.5 py-1 text-xs font-semibold text-[#9a5720]">
                                    {stats.low_stock_products ?? 0}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-[#8b8178]">
                                Produk aktif dengan stok paling banyak 5
                            </p>
                        </div>

                        {lowStockProducts.length > 0 ? (
                            <ul className="divide-y divide-[#f1e9de]">
                                {lowStockProducts.map((product) => (
                                    <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#fcf8f1] sm:px-6">
                                        <div className="flex min-w-0 items-center gap-3">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt=""
                                                    className="h-11 w-11 shrink-0 rounded-xl border border-[#efe5d8] object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5eadf] text-[#8b3b55]">
                                                    <Package aria-hidden="true" className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[#3d1725]">
                                                    {product.name}
                                                </p>
                                                <p className="mt-1 truncate text-xs text-[#8b8178]">
                                                    {product.category?.name ?? 'Tanpa kategori'}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                product.stock === 0
                                                    ? 'bg-rose-50 text-rose-700'
                                                    : 'bg-[#fff0e2] text-[#9a5720]'
                                            }`}
                                        >
                                            {product.stock === 0 ? 'Habis' : `${product.stock} tersisa`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f4eb] text-[#28704c]">
                                    <Package aria-hidden="true" className="h-5 w-5" />
                                </div>
                                <p className="mt-4 text-sm font-medium text-[#3d1725]">
                                    Stok produk aman
                                </p>
                                <p className="mt-1 text-xs text-[#8b8178]">
                                    Tidak ada produk aktif yang perlu direstok.
                                </p>
                            </div>
                        )}

                        <div className="border-t border-[#f0e8dc] px-5 py-4 sm:px-6">
                            <Link
                                href={route('admin.dashboard')}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-[#7b1738] transition hover:text-[#a12d51]"
                            >
                                Buka pengelolaan produk
                                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </SellerCenterLayout>
    );
}
