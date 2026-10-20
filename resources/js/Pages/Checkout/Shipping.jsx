import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { MapPin, Calendar, Clock, Sparkles, Phone, User, ArrowRight, XCircle } from 'lucide-react';

export default function Shipping({ cartItems = [], subtotal = 0, shippingCost = 20000, candleUnitPrice = 3000, shippingData = {} }) {
    const [form, setForm] = useState({
        recipient_name: shippingData.recipient_name || '',
        recipient_phone: shippingData.recipient_phone || '',
        delivery_address: shippingData.delivery_address || '',
        delivery_date: shippingData.delivery_date || '',
        delivery_time_slot: shippingData.delivery_time_slot || '10:00 - 14:00',
        greeting_card_message: shippingData.greeting_card_message || '',
        cake_text: shippingData.cake_text || '',
        notes: shippingData.notes || '',
        candles_count: shippingData.candles_count ?? 1,
    });

    const [errors, setErrors] = useState({});

    const candlesCount = Number(form.candles_count) || 0;
    const currentCandleCost = candlesCount * candleUnitPrice;
    const total = subtotal + shippingCost + currentCandleCost;

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('checkout.saveShipping'), form, {
            onError: (err) => setErrors(err),
        });
    };

    const handleCancel = () => {
        if (window.confirm('Batalkan checkout dan kembali ke keranjang?')) {
            router.delete(route('checkout.cancel'));
        }
    };

    return (
        <MarketplaceLayout>
            <Head title="Checkout - Data Pengiriman - LAPAKan" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                {/* STEPPER PROGRESS */}
                <div className="max-w-2xl mx-auto mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="w-full absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-gray-200 z-0" />
                        <div className="w-1/2 absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-crimson-800 z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-crimson-800 text-white font-bold flex items-center justify-center text-sm shadow-md ring-4 ring-crimson-100">
                                1
                            </div>
                            <span className="text-xs font-bold text-crimson-800 mt-2">Data Pengiriman</span>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-400 font-bold flex items-center justify-center text-sm">
                                2
                            </div>
                            <span className="text-xs font-semibold text-gray-400 mt-2">Pembayaran</span>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-400 font-bold flex items-center justify-center text-sm">
                                3
                            </div>
                            <span className="text-xs font-semibold text-gray-400 mt-2">Konfirmasi</span>
                        </div>
                    </div>
                </div>

                {/* FORM & SUMMARY */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* LEFT FORM: SHIPPING & CUSTOMIZATION */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE3D3] shadow-sm space-y-8">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">Informasi Pengiriman & Kustom Kue</h2>
                            <p className="text-xs text-gray-500 mt-1">Lengkapi alamat dan instruksi khusus pembuatan kue untuk baker kami.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Contact Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-crimson-700" />
                                        <span>Nama Penerima *</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nama lengkap penerima"
                                        value={form.recipient_name}
                                        onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700"
                                    />
                                    {errors.recipient_name && <p className="text-[11px] text-red-600">{errors.recipient_name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-crimson-700" />
                                        <span>No. WhatsApp Aktif *</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="08xxxxxxxxxx"
                                        value={form.recipient_phone}
                                        onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700"
                                    />
                                    {errors.recipient_phone && <p className="text-[11px] text-red-600">{errors.recipient_phone}</p>}
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-crimson-700" />
                                    <span>Alamat Pengiriman Lengkap *</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan alamat..."
                                    value={form.delivery_address}
                                    onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700"
                                />
                                {errors.delivery_address && <p className="text-[11px] text-red-600">{errors.delivery_address}</p>}
                            </div>

                            {/* Delivery Date & Time Slot */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-crimson-700" />
                                        <span>Tanggal Diinginkan *</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={form.delivery_date}
                                        onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700 cursor-pointer"
                                    />
                                    {errors.delivery_date && <p className="text-[11px] text-red-600">{errors.delivery_date}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-crimson-700" />
                                        <span>Pilihan Slot Waktu *</span>
                                    </label>
                                    <select
                                        value={form.delivery_time_slot}
                                        onChange={(e) => setForm({ ...form, delivery_time_slot: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700 cursor-pointer"
                                    >
                                        <option value="09:00 - 12:00">Pagi (09:00 - 12:00 WIB)</option>
                                        <option value="13:00 - 17:00">Siang / Sore (13:00 - 17:00 WIB)</option>
                                        <option value="18:00 - 20:00">Malam (18:00 - 20:00 WIB)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Bakery Special: Custom Cake Text */}
                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                <h3 className="text-sm font-bold text-crimson-900 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-crimson-700" />
                                    <span>Kustomisasi Spesial Kue</span>
                                </h3>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Tulisan di Atas Kue</label>
                                    <input
                                        type="text"
                                        maxLength={35}
                                        placeholder="Contoh: Happy Birthday Sarah!"
                                        value={form.cake_text}
                                        onChange={(e) => setForm({ ...form, cake_text: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700"
                                    />
                                    <span className="text-[10px] text-gray-400">Akan dilukis oleh pastry chef</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700" htmlFor="candles_count">Jumlah Lilin Ulang Tahun</label>
                                    <input
                                        id="candles_count"
                                        type="number"
                                        min="0"
                                        value={form.candles_count}
                                        onChange={(e) => setForm({ ...form, candles_count: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700"
                                    />
                                    <span className="text-[10px] text-gray-400">{formatIDR(candleUnitPrice)} per lilin</span>
                                    {errors.candles_count && <p className="text-[11px] text-red-600">{errors.candles_count}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Pesan Kartu Ucapan (Opsional)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Pesan manis yang ingin dicetak di kartu ucapan hadiah..."
                                        value={form.greeting_card_message}
                                        onChange={(e) => setForm({ ...form, greeting_card_message: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 px-6 rounded-2xl bg-crimson-800 hover:bg-crimson-900 text-white font-extrabold text-sm shadow-lg shadow-crimson-900/20 transition hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Lanjut ke Pembayaran</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full py-3 px-6 rounded-xl border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-700 font-bold text-xs transition flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Batalkan Pesanan</span>
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: ORDER SUMMARY */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EBE3D3] shadow-sm space-y-6 sticky top-28">
                        <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
                            Pesananmu ({cartItems.length} Produk)
                        </h3>

                        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                            {cartItems.map((item) => (
                                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                                        <p className="text-[11px] text-gray-500">
                                            {item.quantity}x • {formatIDR(item.price)}
                                        </p>
                                    </div>
                                    <span className="text-xs font-extrabold text-crimson-800">
                                        {formatIDR(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-900">{formatIDR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ongkir Delivery</span>
                                <span className="font-bold text-gray-900">{formatIDR(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Lilin ({candlesCount} x {formatIDR(candleUnitPrice)})</span>
                                <span className="font-bold text-gray-900">{formatIDR(currentCandleCost)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Pisau Kue</span>
                                <span>GRATIS</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                            <span className="text-sm font-bold text-gray-900">Total Tagihan</span>
                            <span className="text-2xl font-extrabold text-crimson-800">{formatIDR(total)}</span>
                        </div>
                    </div>

                </div>

            </div>
        </MarketplaceLayout>
    );
}
