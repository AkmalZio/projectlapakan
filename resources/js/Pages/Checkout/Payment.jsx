import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { QrCode, CreditCard, Copy, CheckCircle2, ArrowRight, ShieldCheck, Clock, MapPin, Calendar, XCircle } from 'lucide-react';

export default function Payment({ cartItems = [], shipping = {}, subtotal = 0, shippingCost = 20000, candlesCount = 0, candleUnitPrice = 3000, candleCost = 0, total = 0 }) {
    const [selectedMethod, setSelectedMethod] = useState('bca');
    const [copied, setCopied] = useState(false);
    const [processing, setProcessing] = useState(false);

    const paymentMethods = [
        {
            id: 'bca',
            name: 'Bank Central Asia (BCA)',
            code: 'BCA Virtual Account',
            account: '8830-1928-4412',
            holder: 'PT LAPAKAN MANIS NUSANTARA',
            logo: '🏦 BCA',
        },
        {
            id: 'mandiri',
            name: 'Bank Mandiri',
            code: 'Mandiri Livin Virtual Account',
            account: '137-00-9988-1234',
            holder: 'PT LAPAKAN MANIS NUSANTARA',
            logo: '🏦 Mandiri',
        },
        {
            id: 'bri',
            name: 'Bank Rakyat Indonesia (BRI)',
            code: 'BRIVA',
            account: '0206-01-002233-509',
            holder: 'PT LAPAKAN MANIS NUSANTARA',
            logo: '🏦 BRI',
        },
        {
            id: 'qris',
            name: 'QRIS (GoPay, OVO, ShopeePay, DANA)',
            code: 'Scan QRIS Instant',
            account: 'NMID: ID10200392810',
            holder: 'LAPAKAN BAKERY QRIS',
            logo: '📱 QRIS',
        },
    ];

    const currentPayment = paymentMethods.find((m) => m.id === selectedMethod) || paymentMethods[0];

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleProcessPayment = () => {
        setProcessing(true);
        router.post(route('checkout.process'), {
            payment_method: selectedMethod,
        });
    };

    const handleCancel = () => {
        if (window.confirm('Batalkan checkout dan kembali ke keranjang?')) {
            router.delete(route('checkout.cancel'));
        }
    };

    return (
        <MarketplaceLayout>
            <Head title="Checkout - Pembayaran - LAPAKan" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                {/* STEPPER PROGRESS */}
                <div className="max-w-2xl mx-auto mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="w-full absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-crimson-800 z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-crimson-800 text-white font-bold flex items-center justify-center text-sm shadow-md">
                                ✓
                            </div>
                            <span className="text-xs font-bold text-crimson-800 mt-2">Data Pengiriman</span>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-crimson-800 text-white font-bold flex items-center justify-center text-sm shadow-md ring-4 ring-crimson-100">
                                2
                            </div>
                            <span className="text-xs font-bold text-crimson-800 mt-2">Pembayaran</span>
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* LEFT: PAYMENT METHOD SELECTION */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE3D3] shadow-sm space-y-6">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">Pilih Metode Pembayaran</h2>
                                <p className="text-xs text-gray-500 mt-1">Pembayaran otomatis diverifikasi secara real-time.</p>
                            </div>

                            {/* Options Tabs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                                            selectedMethod === method.id
                                                ? 'border-crimson-800 bg-crimson-50/50 shadow-sm ring-2 ring-crimson-700/20'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-gray-900 block">{method.name}</span>
                                            <span className="text-[11px] text-gray-500">{method.code}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                            selectedMethod === method.id
                                                ? 'border-crimson-800 bg-crimson-800 text-white'
                                                : 'border-gray-300 bg-white'
                                        }`}>
                                            {selectedMethod === method.id && <span className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Payment Instructions Box */}
                            <div className="p-6 rounded-2xl bg-[#FAF6EE] border border-[#EBE3D3] space-y-4">
                                <h3 className="text-sm font-bold text-crimson-900">
                                    Instruksi Transfer: {currentPayment.name}
                                </h3>

                                {selectedMethod === 'qris' ? (
                                    <div className="text-center py-4 space-y-3">
                                        <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                                            <QrCode className="w-36 h-36 text-gray-800" />
                                            <span className="text-[10px] font-bold text-crimson-700">QRIS STANDAR NASIONAL</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Scan kode QR di atas menggunakan aplikasi e-wallet atau mobile banking favoritmu.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-white border border-gray-200 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Nomor Rekening / Virtual Account</span>
                                                <span className="text-lg font-mono font-extrabold text-gray-900 tracking-wider">
                                                    {currentPayment.account}
                                                </span>
                                                <span className="text-xs text-gray-500 block">a/n {currentPayment.holder}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(currentPayment.account)}
                                                className="px-3 py-1.5 rounded-lg bg-crimson-50 hover:bg-crimson-100 text-crimson-800 text-xs font-bold flex items-center gap-1.5 transition"
                                            >
                                                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-xl bg-white border border-gray-200 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Nominal yang Harus Ditransfer</span>
                                                <span className="text-xl font-extrabold text-crimson-800">
                                                    {formatIDR(total)}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(total.toString())}
                                                className="px-3 py-1.5 rounded-lg bg-crimson-50 hover:bg-crimson-100 text-crimson-800 text-xs font-bold flex items-center gap-1.5 transition"
                                            >
                                                <Copy className="w-4 h-4" />
                                                <span>Salin Jumlah</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="text-[11px] text-gray-500 flex items-center gap-2 pt-2">
                                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                    <span>Batas waktu pembayaran adalah 120 menit setelah pesanan dibuat.</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleProcessPayment}
                                className="w-full py-4 px-6 rounded-2xl bg-crimson-800 hover:bg-crimson-900 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-crimson-900/20 transition hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>{processing ? 'Memproses Pesanan...' : 'Konfirmasi & Selesaikan Pesanan'}</span>
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
                        </div>
                    </div>

                    {/* RIGHT: SHIPPING DETAILS PREVIEW */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-[#EBE3D3] shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h3 className="text-sm font-extrabold text-gray-900">Rincian Pengiriman</h3>
                                <Link href={route('checkout.shipping')} className="text-xs font-bold text-crimson-700 hover:underline">
                                    Ubah
                                </Link>
                            </div>

                            <div className="space-y-3 text-xs text-gray-600">
                                <div>
                                    <span className="font-bold text-gray-900 block">{shipping.recipient_name}</span>
                                    <span>{shipping.recipient_phone}</span>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600">
                                    <MapPin className="w-3.5 h-3.5 text-crimson-700 mt-0.5 flex-shrink-0" />
                                    <span>{shipping.delivery_address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-3.5 h-3.5 text-crimson-700 flex-shrink-0" />
                                    <span>{shipping.delivery_date} ({shipping.delivery_time_slot})</span>
                                </div>
                                {shipping.cake_text && (
                                    <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-100 text-crimson-900">
                                        <span className="font-bold block text-[10px] uppercase">Tulisan Kue:</span>
                                        <span>"{shipping.cake_text}"</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-[#EBE3D3] shadow-sm space-y-3 text-xs">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-900">{formatIDR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Ongkir Delivery</span>
                                <span className="font-bold text-gray-900">{formatIDR(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Lilin ({candlesCount} x {formatIDR(candleUnitPrice)})</span>
                                <span className="font-bold text-gray-900">{formatIDR(candleCost)}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                                <span className="text-sm font-bold text-gray-900">Total Pembayaran</span>
                                <span className="text-xl font-extrabold text-crimson-800">{formatIDR(total)}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </MarketplaceLayout>
    );
}
