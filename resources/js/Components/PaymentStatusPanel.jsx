import PaymentStatusBadge from '@/Components/PaymentStatusBadge';
import { CheckCircle2, Clock, Copy, FileImage } from 'lucide-react';
import { useState } from 'react';

const formatIDR = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value) || 0);

const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export default function PaymentStatusPanel({ order, paymentAccounts = {} }) {
    const [copied, setCopied] = useState(false);
    const account = paymentAccounts[String(order.payment_method || '').toLowerCase()];
    const isCancelled = order.status === 'cancelled';

    const copyAccount = () => {
        navigator.clipboard?.writeText(account?.account ?? '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section aria-labelledby="payment-heading" className="space-y-4 rounded-3xl border border-[#EBE3D3] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <h3 id="payment-heading" className="text-sm font-extrabold text-gray-900">
                    Pembayaran
                </h3>
                <PaymentStatusBadge status={order.payment_status} />
            </div>

            {order.payment_status === 'paid' && (
                <p className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Pembayaran sudah tercatat{order.paid_at ? ` pada ${formatDateTime(order.paid_at)}` : ''}.</span>
                </p>
            )}

            {order.payment_status === 'refunded' && (
                <p className="rounded-2xl bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-700">
                    Pesanan dibatalkan. Jika kamu sudah mentransfer, penjual akan mengembalikan dana. Hubungi penjual bila ada kendala.
                </p>
            )}

            {isCancelled && order.payment_status === 'unpaid' && (
                <p className="rounded-2xl bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-700">
                    Pesanan dibatalkan sebelum pembayaran diterima.
                </p>
            )}

            {order.payment_status === 'pending_verification' && !isCancelled && (
                <p className="flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-800">
                    <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Pembayaran menunggu konfirmasi penjual.</span>
                </p>
            )}

            {order.payment_status === 'unpaid' && !isCancelled && (
                <div className="space-y-3 rounded-2xl bg-[#FAF6EE] p-4 text-xs text-gray-700">
                    <p className="font-semibold">
                        Silakan transfer sesuai nominal di bawah. Penjual akan mengonfirmasi pembayaran setelah dana diterima.
                    </p>
                    {account ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold uppercase text-gray-400">Transfer ke {account.name}</span>
                                <span className="block break-all font-mono text-base font-extrabold tracking-wider text-gray-900">{account.account}</span>
                                <span className="block text-gray-500">a/n {account.holder}</span>
                            </div>
                            <button
                                type="button"
                                onClick={copyAccount}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-crimson-50 px-3 py-1.5 text-xs font-bold text-crimson-800 transition hover:bg-crimson-100"
                            >
                                {copied ? <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
                                {copied ? 'Tersalin' : 'Salin'}
                            </button>
                        </div>
                    ) : (
                        <p>Metode pembayaran: {order.payment_method}</p>
                    )}
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[#EBE3D3] pt-3">
                        <span className="font-semibold">Nominal transfer</span>
                        <span className="text-lg font-extrabold text-crimson-800">{formatIDR(order.total_amount)}</span>
                    </div>
                    {order.payment_due_at && (
                        <p className="flex items-start gap-2 text-[11px] text-gray-500">
                            <Clock aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                            <span>
                                Selesaikan pembayaran sebelum <strong className="text-gray-700">{formatDateTime(order.payment_due_at)}</strong>. Pesanan akan
                                dibatalkan otomatis setelah batas waktu.
                            </span>
                        </p>
                    )}
                </div>
            )}

            {order.has_payment_proof && (
                <a
                    href={route('orders.payment-proof.show', order.order_number)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-800 hover:underline"
                >
                    <FileImage aria-hidden="true" className="h-4 w-4" />
                    Lihat bukti transfer lama
                </a>
            )}
        </section>
    );
}
