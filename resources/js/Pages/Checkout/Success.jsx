import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { ClipboardCheck, ArrowRight, Home } from 'lucide-react';

const STATUS_LABELS = {
    pending: 'Menunggu Konfirmasi Penjual',
    confirmed: 'Dikonfirmasi',
    baking: 'Sedang Dibuat',
    delivering: 'Dalam Pengiriman',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const formatDate = (value) => {
    if (!value) return '-';
    const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function Success({ order }) {
    const isPaid = order.payment_status === 'paid';
    const isAwaitingPayment = order.payment_status === 'unpaid';
    const isAwaitingVerification = order.payment_status === 'pending_verification';

    return (
        <MarketplaceLayout>
            <Head title={isAwaitingVerification ? 'Pembayaran Menunggu Konfirmasi' : isPaid ? 'Pembayaran Berhasil' : 'Pesanan Dibuat'} />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <div className="space-y-6 rounded-3xl border border-[#EBE3D3] bg-white p-6 text-center shadow-xl sm:p-12">
                    <div
                        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ring-8 ${
                            isPaid ? 'bg-emerald-100 text-emerald-700 ring-emerald-50' : 'bg-amber-100 text-amber-700 ring-amber-50'
                        }`}
                    >
                        <ClipboardCheck className="h-11 w-11" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-crimson-700">
                            {isPaid
                                ? 'Pembayaran berhasil'
                                : isAwaitingPayment
                                    ? 'Pesanan berhasil dibuat'
                                    : isAwaitingVerification
                                        ? 'Pembayaran menunggu konfirmasi'
                                        : 'Pesanan tercatat'}
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            {isAwaitingVerification ? 'Pesanan Menunggu Konfirmasi' : 'Pesanan Berhasil Dibuat!'}
                        </h1>
                        <p className="mx-auto max-w-md text-xs leading-relaxed text-gray-500 sm:text-sm">
                            {isPaid
                                ? 'Pembayaran berhasil dicatat. Penjual akan segera mengonfirmasi dan menyiapkan pesananmu.'
                                : isAwaitingPayment
                                    ? 'Pembayaran belum tercatat. Buka rincian pesanan untuk menyelesaikan pembayaran.'
                                    : isAwaitingVerification
                                        ? 'Pembayaran menunggu konfirmasi penjual. Pesanan akan mulai diproses setelah pembayaran dikonfirmasi.'
                                        : 'Terima kasih! Pantau status pesananmu dari halaman Pesanan Saya.'}
                        </p>
                    </div>

                    <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-[#EBE3D3] bg-[#FAF6EE] p-6 text-left text-xs">
                        <div className="flex justify-between gap-3 border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Nomor Pesanan</span>
                            <span className="break-all text-right font-mono font-bold text-gray-900">{order.order_number}</span>
                        </div>
                        {order.store?.name && (
                            <div className="flex justify-between gap-3 border-b border-gray-200 pb-2">
                                <span className="text-gray-500">Toko</span>
                                <span className="text-right font-bold text-gray-900">{order.store.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-3 border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Status Pesanan</span>
                            <span className="text-right font-bold text-amber-700">{STATUS_LABELS[order.status] ?? order.status}</span>
                        </div>
                        <div className="flex justify-between gap-3 border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Penerima</span>
                            <span className="text-right font-bold text-gray-900">{order.recipient_name}</span>
                        </div>
                        <div className="flex justify-between gap-3 border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Kurir</span>
                            <span className="text-right font-bold text-gray-900">{order.delivery_courier || 'Belum tercatat'}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-gray-500">Tanggal Pengiriman</span>
                            <span className="text-right font-bold text-crimson-800">
                                {formatDate(order.delivery_date)} ({order.delivery_time_slot})
                            </span>
                        </div>
                    </div>

                    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                        <Link
                            href={route('orders.show', order.order_number)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-crimson-800 px-8 py-3.5 text-xs font-bold text-white shadow-md shadow-crimson-900/20 transition hover:bg-crimson-900 sm:w-auto"
                        >
                            <span>Lihat Rincian Pesanan</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={route('home')}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#EBE3D3] bg-white px-6 py-3.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                        >
                            <Home className="h-4 w-4" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
