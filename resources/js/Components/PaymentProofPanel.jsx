import PaymentStatusBadge from '@/Components/PaymentStatusBadge';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, Copy, FileImage, Upload } from 'lucide-react';
import { useState } from 'react';

const MAX_PROOF_BYTES = 2 * 1024 * 1024;

const formatIDR = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value) || 0);

const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

/**
 * Manual bank-transfer box for the buyer: where to transfer, how much, the deadline,
 * and the transfer-proof upload. It reflects every payment status of the order.
 */
export default function PaymentProofPanel({ order, paymentAccounts = {} }) {
    const form = useForm({ payment_proof: null });
    const [copied, setCopied] = useState(false);
    const account = paymentAccounts[String(order.payment_method || '').toLowerCase()];
    const isCancelled = order.status === 'cancelled';
    const canUpload = !isCancelled && order.status !== 'completed' && ['unpaid', 'pending_verification'].includes(order.payment_status);
    const selectedFile = form.data.payment_proof;
    const isFileTooLarge = selectedFile && selectedFile.size > MAX_PROOF_BYTES;

    const copyAccount = () => {
        navigator.clipboard?.writeText(account?.account ?? '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('orders.payment-proof.store', order.order_number), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
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
                    <span>Pembayaran sudah diverifikasi penjual{order.paid_at ? ` pada ${formatDateTime(order.paid_at)}` : ''}.</span>
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
                    <span>
                        Bukti transfer diunggah {formatDateTime(order.payment_proof_uploaded_at)} dan sedang diperiksa penjual.
                        Kamu masih bisa mengganti fotonya jika salah unggah.
                    </span>
                </p>
            )}

            {order.payment_status === 'unpaid' && !isCancelled && (
                <>
                    {order.payment_rejection_reason && (
                        <p role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                            <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>Bukti transfer sebelumnya ditolak penjual: “{order.payment_rejection_reason}”. Unggah ulang bukti yang benar.</span>
                        </p>
                    )}

                    <div className="space-y-3 rounded-2xl bg-[#FAF6EE] p-4 text-xs text-gray-700">
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
                                    Unggah bukti transfer sebelum <strong className="text-gray-700">{formatDateTime(order.payment_due_at)}</strong>.
                                    Lewat dari itu pesanan dibatalkan otomatis.
                                </span>
                            </p>
                        )}
                    </div>
                </>
            )}

            {order.has_payment_proof && order.payment_status !== 'unpaid' && (
                <a
                    href={route('orders.payment-proof.show', order.order_number)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-800 hover:underline"
                >
                    <FileImage aria-hidden="true" className="h-4 w-4" />
                    Lihat bukti transfer
                </a>
            )}

            {canUpload && (
                <form onSubmit={submit} className="space-y-2">
                    <label htmlFor={`payment-proof-${order.id}`} className="block text-xs font-bold text-gray-700">
                        {order.payment_status === 'pending_verification' ? 'Ganti bukti transfer' : 'Unggah bukti transfer'}
                    </label>
                    <input
                        id={`payment-proof-${order.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                            form.setData('payment_proof', event.target.files?.[0] ?? null);
                            form.clearErrors('payment_proof');
                        }}
                        className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-crimson-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-crimson-800 hover:file:bg-crimson-100"
                    />
                    <p className="text-[11px] text-gray-500">Foto atau tangkapan layar bukti transfer. JPG, PNG, atau WEBP, maksimal 2 MB.</p>
                    {isFileTooLarge && !form.errors.payment_proof && (
                        <p className="text-[11px] font-semibold text-amber-700">File lebih dari 2 MB dan akan ditolak.</p>
                    )}
                    {form.errors.payment_proof && <p className="text-[11px] font-semibold text-red-600">{form.errors.payment_proof}</p>}
                    <button
                        type="submit"
                        disabled={!selectedFile || form.processing}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-crimson-800 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-crimson-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Upload aria-hidden="true" className="h-4 w-4" />
                        {form.processing ? 'Mengunggah...' : 'Kirim bukti transfer'}
                    </button>
                </form>
            )}
        </section>
    );
}
