import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Cake, CheckCircle2, Clock, Truck, ChefHat, MapPin, Calendar, Phone, Sparkles, ArrowLeft } from 'lucide-react';

export default function Show({ order }) {
    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const statusSteps = [
        { key: 'confirmed', label: 'Dikonfirmasi', icon: CheckCircle2, desc: 'Pesanan telah diterima baker' },
        { key: 'baking', label: 'Sedang Dibuat', icon: ChefHat, desc: 'Kue sedang dipanggang & dihias' },
        { key: 'delivering', label: 'Pengiriman', icon: Truck, desc: 'Kue dalam perjalanan ke alamat' },
        { key: 'completed', label: 'Selesai', icon: CheckCircle2, desc: 'Pesanan telah sampai' },
    ];

    const currentStepIndex = order.status === 'completed' ? 3 
        : order.status === 'delivering' ? 2 
        : order.status === 'baking' ? 1 
        : 0;

    return (
        <MarketplaceLayout>
            <Head title={`Pesanan #${order.order_number} - LAPAKan`} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                
                {/* Back button & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link 
                            href={route('home')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-crimson-800 transition mb-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900">Detail Pesanan Saya</h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Nomor Pesanan: <span className="font-mono font-bold text-crimson-800">#{order.order_number}</span>
                        </p>
                    </div>

                    <a
                        href={`https://wa.me/6281298765432?text=Halo%20LAPAKan,%20saya%20ingin%20menanyakan%20status%20pesanan%20${order.order_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                    >
                        <Phone className="w-4 h-4" />
                        <span>Chat WhatsApp Baker</span>
                    </a>
                </div>

                {/* STATUS TRACKING BAR */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D3] shadow-sm">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-6">Status Pengerjaan & Pengiriman Kue</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                        {statusSteps.map((step, idx) => {
                            const isDone = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            const StepIcon = step.icon;

                            return (
                                <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                        isDone 
                                            ? 'bg-crimson-800 text-white shadow-md shadow-crimson-900/20' 
                                            : 'bg-gray-100 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-pink-200' : ''}`}>
                                        <StepIcon className="w-6 h-6" />
                                    </div>
                                    <h4 className={`text-xs font-bold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 leading-tight">
                                        {step.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ORDER ITEMS & RECIPIENT INFO */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Items List */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D3] shadow-sm space-y-4">
                        <h3 className="text-sm font-extrabold text-gray-900 pb-3 border-b border-gray-100">
                            Rincian Kue yang Dipesan
                        </h3>

                        <div className="divide-y divide-gray-100">
                            {order.items?.map((item) => (
                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={item.product?.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop'}
                                            alt={item.product_name}
                                            className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-100 flex-shrink-0"
                                        />
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-bold text-gray-900">{item.product_name}</h4>
                                            {item.variant_name && (
                                                <span className="inline-block text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    {item.variant_name}
                                                </span>
                                            )}
                                            {item.cake_text && (
                                                <div className="flex items-center gap-1 text-[11px] text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                                                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                                                    <span>Tulisan: "{item.cake_text}"</span>
                                                </div>
                                            )}
                                            <span className="text-[11px] text-gray-500 block">
                                                {item.quantity} x {formatIDR(item.price)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-extrabold text-crimson-800">
                                        {formatIDR(item.subtotal)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Ongkos Kirim</span>
                                <span className="font-bold text-gray-900">{formatIDR(order.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Metode Pembayaran</span>
                                <span className="font-bold text-gray-900 uppercase">{order.payment_method} (Lunas)</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                                <span className="text-sm font-bold text-gray-900">Total Dibayar</span>
                                <span className="text-xl font-extrabold text-crimson-800">{formatIDR(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EBE3D3] shadow-sm space-y-4">
                        <h3 className="text-sm font-extrabold text-gray-900 pb-2 border-b border-gray-100">
                            Tujuan Pengiriman
                        </h3>

                        <div className="space-y-3 text-xs text-gray-600">
                            <div>
                                <span className="font-bold text-gray-900 block">{order.recipient_name}</span>
                                <span>{order.recipient_phone}</span>
                            </div>

                            {order.delivery_courier && (
                                <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                                    <Truck className="w-3.5 h-3.5 text-crimson-700 flex-shrink-0" />
                                    <span>Kurir: {order.delivery_courier}</span>
                                </div>
                            )}

                            <div className="flex items-start gap-2 pt-1 border-t border-gray-50">
                                <MapPin className="w-3.5 h-3.5 text-crimson-700 mt-0.5 flex-shrink-0" />
                                <span>{order.delivery_address}</span>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                                <Calendar className="w-3.5 h-3.5 text-crimson-700 flex-shrink-0" />
                                <span>{order.delivery_date} ({order.delivery_time_slot})</span>
                            </div>

                            <div className="pt-2 border-t border-gray-50 space-y-1">
                                <span className="text-gray-400 block text-[11px]">Jumlah Lilin:</span>
                                <span className="font-bold text-gray-800">
                                    {order.candles_count} pcs x {formatIDR(3000)} = {formatIDR(order.candles_count * 3000)}
                                </span>
                            </div>

                            {order.greeting_card_message && (
                                <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-crimson-900 block">Pesan Kartu Ucapan:</span>
                                    <p className="italic text-gray-700">"{order.greeting_card_message}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </MarketplaceLayout>
    );
}
