import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { QrCode, Copy, CheckCircle2, MapPin, Calendar, Truck, XCircle, Store, Sparkles } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0);

export default function Payment({
    shipping = {},
    stores = [],
    subtotal = 0,
    shippingCost = 0,
    storeCount = 1,
    deliveryCourier = '',
    deliveryEstimate = '',
    candleUnitPrice = 3000,
    candleCost = 0,
    total = 0,
    paymentAccounts = {},
}) {
    const methodKeys = Object.keys(paymentAccounts);
    const [selectedMethod, setSelectedMethod] = useState(methodKeys[0] ?? '');
    const [copied, setCopied] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const currentPayment = paymentAccounts[selectedMethod];

    const handleCopy = (text) => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateOrder = () => {
        router.post(
            route('checkout.process'),
            { payment_method: selectedMethod },
            {
                onStart: () => setProcessing(true),
                onError: (err) => setErrors(err),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleCancel = () => {
        if (window.confirm('Batalkan checkout dan kembali ke keranjang?')) {
            router.delete(route('checkout.cancel'));
        }
    };

    return (
        <MarketplaceLayout>
            <Head title="Checkout - Pembayaran" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* STEPPER PROGRESS */}
                <div className="mx-auto mb-10 max-w-2xl">
                    <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 top-1/2 z-0 h-1 w-full -translate-y-1/2 bg-crimson-800" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crimson-800 text-sm font-bold text-white shadow-md">✓</div>
                            <span className="mt-2 text-xs font-bold text-crimson-800">Data Pengiriman</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crimson-800 text-sm font-bold text-white shadow-md ring-4 ring-crimson-100">2</div>
                            <span className="mt-2 text-xs font-bold text-crimson-800">Pembayaran</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                    {/* LEFT: PAYMENT METHOD SELECTION */}
                    <div className="min-w-0 space-y-6 lg:col-span-8">
                        <div className="space-y-6 rounded-3xl border border-[#EBE3D3] bg-white p-6 shadow-sm sm:p-10">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">Pilih Tujuan Transfer</h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Selesaikan transfer ke rekening tujuan di bawah, lalu konfirmasikan pembayaran saat membuat pesanan.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Tujuan transfer">
                                {methodKeys.map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        role="radio"
                                        aria-checked={selectedMethod === key}
                                        onClick={() => setSelectedMethod(key)}
                                        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                                            selectedMethod === key
                                                ? 'border-crimson-800 bg-crimson-50/50 shadow-sm ring-2 ring-crimson-700/20'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <span className="block text-xs font-bold text-gray-900">{paymentAccounts[key].name}</span>
                                            <span className="text-[11px] text-gray-500">{paymentAccounts[key].type}</span>
                                        </div>
                                        <div
                                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                                selectedMethod === key ? 'border-crimson-800 bg-crimson-800 text-white' : 'border-gray-300 bg-white'
                                            }`}
                                        >
                                            {selectedMethod === key && <span className="h-2 w-2 rounded-full bg-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {currentPayment && (
                                <div className="space-y-4 rounded-2xl border border-[#EBE3D3] bg-[#FAF6EE] p-6">
                                    <h3 className="text-sm font-bold text-crimson-900">Instruksi Transfer: {currentPayment.name}</h3>

                                    {selectedMethod === 'qris' && (
                                        <div className="space-y-3 py-2 text-center">
                                            <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                                                <QrCode className="h-36 w-36 text-gray-800" />
                                                <span className="text-[10px] font-bold text-crimson-700">QRIS STANDAR NASIONAL</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Scan kode QR dengan aplikasi e-wallet atau mobile banking.</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                                        <div className="min-w-0">
                                            <span className="block text-[10px] font-bold uppercase text-gray-400">
                                                {selectedMethod === 'qris' ? 'Merchant QRIS' : 'Nomor Rekening'}
                                            </span>
                                            <span className="block break-all font-mono text-lg font-extrabold tracking-wider text-gray-900">
                                                {currentPayment.account}
                                            </span>
                                            <span className="block text-xs text-gray-500">a/n {currentPayment.holder}</span>
                                        </div>
                                        {selectedMethod !== 'qris' && (
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(currentPayment.account)}
                                                className="flex items-center gap-1.5 rounded-lg bg-crimson-50 px-3 py-1.5 text-xs font-bold text-crimson-800 transition hover:bg-crimson-100"
                                            >
                                                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                                        <span className="block text-[10px] font-bold uppercase text-gray-400">Total yang harus ditransfer</span>
                                        <span className="text-xl font-extrabold text-crimson-800">{formatIDR(total)}</span>
                                        {storeCount > 1 && (
                                            <p className="mt-1 text-[11px] text-gray-500">
                                                Pesanan dipisah menjadi {storeCount} pesanan per toko. Rincian transfer dan nominal tiap pesanan tersedia
                                                setelah checkout.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(errors.cart || errors.payment_method) && (
                                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                                    {errors.cart || errors.payment_method}
                                </p>
                            )}
                            <button
                                type="button"
                                disabled={processing || !selectedMethod}
                                onClick={handleCreateOrder}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-4 text-sm font-extrabold text-crimson-950 shadow-xl shadow-amber-900/20 transition hover:bg-amber-500 disabled:opacity-50"
                            >
                                <span>{processing ? 'Membuat Pesanan...' : 'Saya Sudah Membayar & Buat Pesanan'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-xs font-bold text-gray-600 transition hover:border-red-300 hover:text-red-700"
                            >
                                <XCircle className="h-4 w-4" />
                                <span>Batalkan Checkout</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: SHIPPING DETAILS & PER-STORE SUMMARY */}
                    <div className="min-w-0 space-y-6 lg:col-span-4">
                        <div className="space-y-4 rounded-3xl border border-[#EBE3D3] bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="text-sm font-extrabold text-gray-900">Rincian Pengiriman</h3>
                                <Link href={route('checkout.shipping')} className="text-xs font-bold text-crimson-700 hover:underline">
                                    Ubah
                                </Link>
                            </div>

                            <div className="space-y-3 text-xs text-gray-600">
                                <div>
                                    <span className="block font-bold text-gray-900">{shipping.recipient_name}</span>
                                    <span>{shipping.recipient_phone}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-crimson-700" />
                                    <span className="break-words">{shipping.delivery_address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="h-3.5 w-3.5 flex-shrink-0 text-crimson-700" />
                                    <span>
                                        {deliveryCourier} · estimasi {deliveryEstimate}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-crimson-700" />
                                    <span>
                                        {shipping.delivery_date} ({shipping.delivery_time_slot})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {stores.map((store) => (
                            <div key={store.store_id} className="space-y-3 rounded-3xl border border-[#EBE3D3] bg-white p-6 text-xs shadow-sm">
                                <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-extrabold text-gray-900">
                                    <Store className="h-4 w-4 text-crimson-700" />
                                    <span className="min-w-0 truncate">{store.store_name}</span>
                                </h3>
                                <ul className="space-y-1 text-gray-600">
                                    {store.items.map((item) => (
                                        <li key={item.id} className="flex justify-between gap-3">
                                            <span className="min-w-0">
                                                {item.name}
                                                {item.variant_name ? ` (${item.variant_name})` : ''} × {item.quantity}
                                            </span>
                                            <span className="shrink-0 font-semibold text-gray-900">{formatIDR(item.price * item.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                                {store.cake_text && (
                                    <p className="flex items-start gap-1 rounded-xl bg-pink-50 px-2.5 py-1.5 text-crimson-900">
                                        <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                        <span className="break-words">Tulisan kue: "{store.cake_text}"</span>
                                    </p>
                                )}
                                <div className="space-y-1 border-t border-gray-100 pt-2 text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Ongkir {deliveryCourier}</span>
                                        <span className="font-bold text-gray-900">{formatIDR(store.shipping_cost)}</span>
                                    </div>
                                    {store.candles_count > 0 && (
                                        <div className="flex justify-between">
                                            <span>
                                                Lilin ({store.candles_count} x {formatIDR(candleUnitPrice)})
                                            </span>
                                            <span className="font-bold text-gray-900">{formatIDR(store.candle_cost)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-gray-900">
                                        <span>Total pesanan toko ini</span>
                                        <span>{formatIDR(store.total)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="space-y-3 rounded-3xl border border-[#EBE3D3] bg-white p-6 text-xs shadow-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-900">{formatIDR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Ongkir{storeCount > 1 ? ` (${storeCount} toko)` : ''}</span>
                                <span className="font-bold text-gray-900">{formatIDR(shippingCost)}</span>
                            </div>
                            {candleCost > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Lilin</span>
                                    <span className="font-bold text-gray-900">{formatIDR(candleCost)}</span>
                                </div>
                            )}
                            <div className="flex items-baseline justify-between border-t border-gray-100 pt-2">
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
