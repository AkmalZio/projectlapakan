/** Buyer- and seller-facing labels for Order::PAYMENT_STATUSES. */
export const PAYMENT_STATUS_LABELS = {
    unpaid: 'Menunggu Pembayaran',
    pending_verification: 'Menunggu Verifikasi',
    paid: 'Lunas',
    refunded: 'Dana Dikembalikan',
};

const PAYMENT_STATUS_STYLES = {
    unpaid: 'bg-amber-50 text-amber-800 border-amber-200',
    pending_verification: 'bg-sky-50 text-sky-800 border-sky-200',
    paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    refunded: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function PaymentStatusBadge({ status, className = '' }) {
    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                PAYMENT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
            } ${className}`}
        >
            {PAYMENT_STATUS_LABELS[status] ?? status}
        </span>
    );
}
