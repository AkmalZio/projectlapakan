import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { CheckCircle, Cake, ArrowRight, Home, Calendar, MapPin } from 'lucide-react';

export default function Success({ order }) {
    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    return (
        <MarketplaceLayout>
            <Head title="Pesanan Berhasil - LAPAKan" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EBE3D3] shadow-xl text-center space-y-6">
                    
                    {/* Big Checkmark */}
                    <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                        <CheckCircle className="w-12 h-12" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-crimson-700">Status Pembayaran Berhasil</span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                            PESANAN BERHASIL!
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                            Terima kasih telah berbelanja di LAPAKan. Pesanan kuemu sudah diterima dan akan segera dibuat oleh pastry chef kami.
                        </p>
                    </div>

                    {/* Order summary card */}
                    <div className="bg-[#FAF6EE] rounded-2xl p-6 border border-[#EBE3D3] text-left space-y-3 max-w-md mx-auto text-xs">
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                            <span className="text-gray-500">Nomor Pesanan</span>
                            <span className="font-mono font-bold text-gray-900">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                            <span className="text-gray-500">Penerima</span>
                            <span className="font-bold text-gray-900">{order.recipient_name}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                            <span className="text-gray-500">Tanggal Pengiriman</span>
                            <span className="font-bold text-crimson-800">{order.delivery_date} ({order.delivery_time_slot})</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-1">
                            <span className="font-bold text-gray-700">Total Pembayaran</span>
                            <span className="text-base font-extrabold text-crimson-900">{formatIDR(order.total_amount)}</span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
                        <Link
                            href={route('orders.show', order.order_number)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white font-bold text-xs shadow-md shadow-crimson-900/20 transition hover:scale-105 active:scale-95"
                        >
                            <span>Lihat Rincian Pesanan</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href={route('home')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#EBE3D3] text-gray-700 hover:bg-gray-50 font-bold text-xs transition"
                        >
                            <Home className="w-4 h-4" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                    </div>

                </div>
            </div>
        </MarketplaceLayout>
    );
}
