import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import {
    ShoppingBag,
    ChefHat,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowRight,
    PackageOpen,
    Cake,
    CalendarDays,
    Receipt,
    ChevronRight,
} from 'lucide-react';

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CONFIG = {
    pending: {
        label: 'Menunggu Konfirmasi',
        color: 'bg-amber-100 text-amber-700 border border-amber-200',
        dot: 'bg-amber-500',
        icon: Clock,
    },
    confirmed: {
        label: 'Dikonfirmasi',
        color: 'bg-blue-100 text-blue-700 border border-blue-200',
        dot: 'bg-blue-500',
        icon: CheckCircle2,
    },
    baking: {
        label: 'Sedang Dibuat',
        color: 'bg-purple-100 text-purple-700 border border-purple-200',
        dot: 'bg-purple-500',
        icon: ChefHat,
    },
    delivering: {
        label: 'Dalam Pengiriman',
        color: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
        dot: 'bg-indigo-500',
        icon: Truck,
    },
    completed: {
        label: 'Selesai',
        color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
    },
    cancelled: {
        label: 'Dibatalkan',
        color: 'bg-red-100 text-red-700 border border-red-200',
        dot: 'bg-red-400',
        icon: XCircle,
    },
};

const TABS = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'baking', label: 'Sedang Dibuat' },
    { key: 'delivering', label: 'Dikirim' },
    { key: 'completed', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
];

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(val ?? 0);

/* ─── Order Card ─────────────────────────────────────────────── */
function OrderCard({ order }) {
    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;

    return (
        <div className="bg-white rounded-2xl border border-[#EBE3D3] shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Card Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E8DA] bg-[#FDFAF5]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-crimson-700 to-crimson-900 flex items-center justify-center shadow-sm">
                        <Receipt className="w-4 h-4 text-pink-100" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400 font-medium">No. Pesanan</p>
                        <p className="font-mono font-bold text-sm text-crimson-900">#{order.order_number}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                </span>
            </div>

            {/* Product List (max 2 items preview) */}
            <div className="px-5 py-4 space-y-3">
                {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        {/* Product image or fallback */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center flex-shrink-0 border border-pink-100 overflow-hidden">
                            {item.product_image ? (
                                <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Cake className="w-5 h-5 text-crimson-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-400">{item.quantity}x &nbsp;&middot;&nbsp; {formatIDR(item.subtotal)}</p>
                        </div>
                    </div>
                ))}

                {/* More items indicator */}
                {order.items_count > 2 && (
                    <p className="text-xs text-gray-400 pl-1">
                        +{order.items_count - 2} produk lainnya
                    </p>
                )}
            </div>

            {/* Card Footer */}
            <div className="px-5 py-4 border-t border-[#F0E8DA] bg-[#FDFAF5] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                    {order.delivery_date && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <CalendarDays className="w-3.5 h-3.5 text-crimson-400" />
                            <span>Kirim: {order.delivery_date}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Total:</span>
                        <span className="font-extrabold text-crimson-800 text-base">{formatIDR(order.total_amount)}</span>
                    </div>
                </div>

                <Link
                    href={route('orders.show', order.order_number)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-bold shadow-sm transition hover:scale-105 active:scale-95 group-hover:shadow-md"
                >
                    <span>Lihat Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </div>
    );
}

/* ─── Empty State ────────────────────────────────────────────── */
function EmptyOrders({ status }) {
    return (
        <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-6 shadow-inner">
                <PackageOpen className="w-10 h-10 text-crimson-400" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">
                {status === 'all' ? 'Belum Ada Pesanan' : 'Tidak ada pesanan di sini'}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-8">
                {status === 'all'
                    ? 'Yuk, pesan kue spesial pertamamu untuk momen yang tak terlupakan!'
                    : 'Belum ada pesanan dengan status ini saat ini.'}
            </p>
            <Link
                href={route('catalog')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white font-bold text-sm shadow-lg shadow-crimson-900/20 transition hover:scale-105 active:scale-95"
            >
                <ShoppingBag className="w-4 h-4" />
                <span>Mulai Belanja</span>
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function OrdersIndex({ orders = [], activeStatus = 'all' }) {
    const handleTabChange = (key) => {
        router.get(route('orders.index'), key !== 'all' ? { status: key } : {}, {
            preserveState: false,
            replace: true,
        });
    };

    return (
        <MarketplaceLayout>
            <Head title="Pesanan Saya - LAPAKan" />

            {/* ─ Hero Sub-banner ─ */}
            <div className="bg-gradient-to-r from-crimson-900 via-crimson-800 to-crimson-950 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-pink-300 text-xs font-semibold tracking-widest uppercase mb-1">Akun Saya</p>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                Pesanan Saya
                            </h1>
                            <p className="text-pink-200/70 text-sm mt-1">
                                Pantau status dan riwayat semua pesanan kuemu
                            </p>
                        </div>
                        <Link
                            href={route('catalog')}
                            className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition backdrop-blur-sm"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Pesan Lagi</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ─ Status Tabs ─ */}
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
                    <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap pb-2">
                        {TABS.map((tab) => {
                            const isActive = activeStatus === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    id={`tab-${tab.key}`}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                                        isActive
                                            ? 'bg-crimson-800 text-white shadow-md shadow-crimson-800/30 scale-[1.02]'
                                            : 'bg-white text-gray-600 border border-[#E5DCCB] hover:border-crimson-300 hover:text-crimson-700'
                                    }`}
                                >
                                    {tab.label}
                                    {isActive && orders.length > 0 && (
                                        <span className="ml-2 bg-white/25 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                                            {orders.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─ Orders Grid ─ */}
                {orders.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <EmptyOrders status={activeStatus} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </MarketplaceLayout>
    );
}
