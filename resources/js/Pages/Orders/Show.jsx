import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import ImageWithFallback from '@/Components/ImageWithFallback';
import PaymentProofPanel from '@/Components/PaymentProofPanel';
import PaymentStatusBadge from '@/Components/PaymentStatusBadge';
import { CheckCircle2, Clock, Truck, ChefHat, MapPin, Calendar, Phone, Sparkles, ArrowLeft, XCircle, Star } from 'lucide-react';

const CANDLE_UNIT_PRICE = 3000;

/** Convert a local phone number (08xx / +628xx) to the international digits wa.me expects. */
const toWhatsAppNumber = (phone, fallback) => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return fallback;

    return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
};

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0);

const formatDate = (value) => {
    if (!value) return '-';
    const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

function ReviewForm({ order, item }) {
    const form = useForm({ product_id: item.product_id, rating: 0, comment: '' });
    const [hoveredRating, setHoveredRating] = useState(0);

    const submit = (event) => {
        event.preventDefault();
        form.post(route('orders.reviews.store', order.order_number), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="mt-3 space-y-2 rounded-2xl border border-[#EBE3D3] bg-[#FDFAF5] p-3">
            <fieldset>
                <legend className="text-[11px] font-bold text-gray-700">Beri rating untuk {item.product_name}</legend>
                <div className="mt-1 flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                    {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value} className="cursor-pointer" onMouseEnter={() => setHoveredRating(value)}>
                            <input
                                type="radio"
                                name={`rating-${item.id}`}
                                value={value}
                                checked={form.data.rating === value}
                                onChange={() => form.setData('rating', value)}
                                className="sr-only"
                            />
                            <span className="sr-only">{value} bintang</span>
                            <Star
                                aria-hidden="true"
                                className={`h-6 w-6 ${
                                    value <= (hoveredRating || form.data.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`}
                            />
                        </label>
                    ))}
                </div>
            </fieldset>
            <label htmlFor={`review-comment-${item.id}`} className="sr-only">Ulasan</label>
            <textarea
                id={`review-comment-${item.id}`}
                rows={2}
                maxLength={1000}
                value={form.data.comment}
                onChange={(event) => form.setData('comment', event.target.value)}
                placeholder="Ceritakan rasa dan tampilan kuenya (opsional)"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-crimson-700"
            />
            {(form.errors.rating || form.errors.product_id || form.errors.comment) && (
                <p className="text-[11px] font-semibold text-red-600">{form.errors.rating || form.errors.product_id || form.errors.comment}</p>
            )}
            <button
                type="submit"
                disabled={form.processing || form.data.rating === 0}
                className="rounded-lg bg-crimson-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-crimson-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {form.processing ? 'Mengirim...' : 'Kirim ulasan'}
            </button>
        </form>
    );
}

export default function Show({ order, isBuyer = true, paymentAccounts = {}, reviewedProductIds = [] }) {
    const { platform } = usePage().props;

    const statusSteps = [
        { key: 'pending', label: 'Menunggu Konfirmasi', icon: Clock, desc: 'Menunggu pembayaran & konfirmasi penjual' },
        { key: 'confirmed', label: 'Dikonfirmasi', icon: CheckCircle2, desc: 'Pesanan telah diterima baker' },
        { key: 'baking', label: 'Sedang Dibuat', icon: ChefHat, desc: 'Kue sedang dipanggang & dihias' },
        { key: 'delivering', label: 'Pengiriman', icon: Truck, desc: 'Kue dalam perjalanan ke alamat' },
        { key: 'completed', label: 'Selesai', icon: CheckCircle2, desc: 'Pesanan telah sampai' },
    ];

    const isCancelled = order.status === 'cancelled';
    const isCompleted = order.status === 'completed';
    const currentStepIndex = isCancelled ? -1 : Math.max(0, statusSteps.findIndex((step) => step.key === order.status));
    const whatsAppNumber = toWhatsAppNumber(order.store?.phone, platform?.contact?.whatsapp);
    const whatsAppText = encodeURIComponent(`Halo ${order.store?.name || 'LAPAKan'}, saya ingin menanyakan status pesanan ${order.order_number}`);

    return (
        <MarketplaceLayout>
            <Head title={`Pesanan #${order.order_number}`} />

            <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                {/* Back button & Title */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                        <Link
                            href={isBuyer ? route('orders.index') : route('admin.dashboard')}
                            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-crimson-800"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>{isBuyer ? 'Kembali ke Pesanan Saya' : 'Kembali ke Seller Center'}</span>
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900">Detail Pesanan</h1>
                        <p className="mt-1 break-all text-xs text-gray-500">
                            Nomor Pesanan: <span className="font-mono font-bold text-crimson-800">#{order.order_number}</span>
                        </p>
                        {order.store?.name && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                Toko: <span className="font-bold text-gray-800">{order.store.name}</span>
                            </p>
                        )}
                    </div>

                    {isBuyer && whatsAppNumber && (
                        <a
                            href={`https://wa.me/${whatsAppNumber}?text=${whatsAppText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:self-center"
                        >
                            <Phone className="h-4 w-4" />
                            <span>Chat WhatsApp Baker</span>
                        </a>
                    )}
                </div>

                {/* STATUS TRACKING BAR */}
                <div className="rounded-3xl border border-[#EBE3D3] bg-white p-6 shadow-sm sm:p-8">
                    <h3 className="mb-6 text-sm font-extrabold text-gray-900">Status Pengerjaan & Pengiriman Kue</h3>

                    {isCancelled && (
                        <div role="status" className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                            <XCircle className="h-5 w-5 flex-shrink-0" />
                            <span>Pesanan ini telah dibatalkan.</span>
                        </div>
                    )}

                    <div className="relative grid grid-cols-2 gap-4 md:grid-cols-5">
                        {statusSteps.map((step, idx) => {
                            const isDone = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            const StepIcon = step.icon;

                            return (
                                <div key={step.key} className="flex flex-col items-center space-y-2 text-center">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                                            isDone ? 'bg-crimson-800 text-white shadow-md shadow-crimson-900/20' : 'bg-gray-100 text-gray-400'
                                        } ${isCurrent ? 'ring-4 ring-pink-200' : ''}`}
                                    >
                                        <StepIcon className="h-6 w-6" />
                                    </div>
                                    <h4 className={`text-xs font-bold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h4>
                                    <p className="text-[10px] leading-tight text-gray-400">{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    {/* Items List */}
                    <div className="min-w-0 space-y-4 rounded-3xl border border-[#EBE3D3] bg-white p-6 shadow-sm sm:p-8 lg:col-span-8">
                        <h3 className="border-b border-gray-100 pb-3 text-sm font-extrabold text-gray-900">Rincian Kue yang Dipesan</h3>

                        <div className="divide-y divide-gray-100">
                            {order.items?.map((item) => {
                                const canReview = isBuyer && isCompleted && item.product_id && !reviewedProductIds.includes(item.product_id);
                                const hasReviewed = isBuyer && isCompleted && reviewedProductIds.includes(item.product_id);

                                return (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-4">
                                                <ImageWithFallback
                                                    src={item.product?.image}
                                                    alt={item.product_name}
                                                    className="h-16 w-16 flex-shrink-0 rounded-xl border border-gray-100 bg-gray-100 object-cover"
                                                />
                                                <div className="min-w-0 space-y-1">
                                                    <h4 className="text-xs font-bold text-gray-900">{item.product_name}</h4>
                                                    {item.variant_name && (
                                                        <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                                                            {item.variant_name}
                                                        </span>
                                                    )}
                                                    {item.cake_text && (
                                                        <div className="flex items-center gap-1 rounded bg-pink-50 px-2 py-0.5 text-[11px] text-pink-700">
                                                            <Sparkles className="h-3 w-3 flex-shrink-0" />
                                                            <span className="break-words">Tulisan: "{item.cake_text}"</span>
                                                        </div>
                                                    )}
                                                    <span className="block text-[11px] text-gray-500">
                                                        {item.quantity} x {formatIDR(item.price)}
                                                    </span>
                                                    {hasReviewed && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                                            <CheckCircle2 className="h-3 w-3" /> Sudah diulas
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-xs font-extrabold text-crimson-800">{formatIDR(item.subtotal)}</span>
                                        </div>
                                        {canReview && <ReviewForm order={order} item={item} />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
                            <div className="flex justify-between gap-3">
                                <span>Ongkos Kirim</span>
                                <span className="font-bold text-gray-900">{formatIDR(order.shipping_cost)}</span>
                            </div>
                            {order.candles_count > 0 && (
                                <div className="flex justify-between gap-3">
                                    <span>Lilin ({order.candles_count} x {formatIDR(CANDLE_UNIT_PRICE)})</span>
                                    <span className="font-bold text-gray-900">{formatIDR(order.candles_count * CANDLE_UNIT_PRICE)}</span>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span>Metode Pembayaran</span>
                                <span className="flex items-center gap-2 font-bold text-gray-900">
                                    {order.payment_method}
                                    <PaymentStatusBadge status={order.payment_status} />
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between border-t border-gray-100 pt-2">
                                <span className="text-sm font-bold text-gray-900">Total Pesanan</span>
                                <span className="text-xl font-extrabold text-crimson-800">{formatIDR(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="min-w-0 space-y-6 lg:col-span-4">
                        {isBuyer && <PaymentProofPanel order={order} paymentAccounts={paymentAccounts} />}

                        {/* Delivery Information */}
                        <div className="space-y-4 rounded-3xl border border-[#EBE3D3] bg-white p-6 shadow-sm">
                            <h3 className="border-b border-gray-100 pb-2 text-sm font-extrabold text-gray-900">Tujuan Pengiriman</h3>

                            <div className="space-y-3 text-xs text-gray-600">
                                <div>
                                    <span className="block font-bold text-gray-900">{order.recipient_name}</span>
                                    <span>{order.recipient_phone}</span>
                                </div>

                                {order.delivery_courier && (
                                    <div className="flex items-center gap-2 border-t border-gray-50 pt-1">
                                        <Truck className="h-3.5 w-3.5 flex-shrink-0 text-crimson-700" />
                                        <span>Kurir: {order.delivery_courier}</span>
                                    </div>
                                )}

                                <div className="flex items-start gap-2 border-t border-gray-50 pt-1">
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-crimson-700" />
                                    <span className="break-words">{order.delivery_address}</span>
                                </div>

                                <div className="flex items-center gap-2 border-t border-gray-50 pt-1">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-crimson-700" />
                                    <span>
                                        {formatDate(order.delivery_date)} ({order.delivery_time_slot})
                                    </span>
                                </div>

                                {order.delivery_notes && (
                                    <div className="border-t border-gray-50 pt-1">
                                        <span className="block text-[11px] text-gray-400">Catatan:</span>
                                        <span className="break-words">{order.delivery_notes}</span>
                                    </div>
                                )}

                                {order.greeting_card_message && (
                                    <div className="space-y-1 rounded-xl border border-pink-100 bg-pink-50 p-3">
                                        <span className="block text-[10px] font-bold uppercase text-crimson-900">Pesan Kartu Ucapan:</span>
                                        <p className="break-words italic text-gray-700">"{order.greeting_card_message}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
