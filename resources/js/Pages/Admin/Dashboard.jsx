import SellerCenterLayout from '@/Layouts/SellerCenterLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, ClipboardList, ImageOff, Loader, Package, Plus } from 'lucide-react';

const orderStatusLabels = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    baking: 'Sedang dibuat',
    delivering: 'Dalam pengiriman',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const orderStatusStyles = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-blue-50 text-blue-700',
    baking: 'bg-purple-50 text-purple-700',
    delivering: 'bg-indigo-50 text-indigo-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-gray-100 text-gray-600',
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

function OrderRow({ order, orderStatuses }) {
    const form = useForm({ status: order.status });

    const updateStatus = (event) => {
        event.preventDefault();
        form.patch(route('admin.orders.update-status', { order: order.id }), {
            preserveScroll: true,
        });
    };

    return (
        <tr className="align-top">
            <td className="px-4 py-4">
                <p className="font-semibold text-gray-900">{order.order_number}</p>
                <p className="mt-1 text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </p>
                <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-crimson-800">
                        Lihat rincian
                    </summary>
                    <div className="mt-3 min-w-64 space-y-3 rounded-xl bg-cream-50 p-3 text-xs text-gray-600">
                        <div>
                            <p className="font-semibold text-gray-800">Penerima</p>
                            <p>{order.recipient_name} · {order.recipient_phone}</p>
                            <p>{order.delivery_address || 'Ambil di toko'}</p>
                            {order.delivery_courier && <p>Kurir: {order.delivery_courier}</p>}
                            {order.delivery_notes && <p>Catatan: {order.delivery_notes}</p>}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Item pesanan</p>
                            <ul className="mt-1 space-y-1">
                                {order.items?.map((item) => (
                                    <li key={item.id} className="flex flex-wrap justify-between gap-2">
                                        <span>
                                            {item.product_name}
                                            {item.variant_name ? ` (${item.variant_name})` : ''} × {item.quantity}
                                        </span>
                                        <span className="shrink-0">{formatCurrency(item.subtotal)}</span>
                                        {(item.cake_text || item.custom_request) && (
                                            <span className="basis-full text-gray-500">
                                                {item.cake_text ? `Tulisan: ${item.cake_text}` : ''}
                                                {item.custom_request ? ` Catatan: ${item.custom_request}` : ''}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {order.greeting_card_message && (
                            <p>Pesan kartu: {order.greeting_card_message}</p>
                        )}
                        <p>
                            Pengiriman: {order.delivery_type === 'pickup' ? 'Ambil di toko' : 'Diantar'}
                            {Number(order.shipping_cost) > 0 ? ` · Ongkir ${formatCurrency(order.shipping_cost)}` : ''}
                        </p>
                        <p>
                            Pembayaran: {order.payment_status}
                            {order.payment_method ? ` · ${order.payment_method}` : ''}
                        </p>
                        {order.delivery_date && (
                            <p>
                                Jadwal: {new Date(`${order.delivery_date}T00:00:00`).toLocaleDateString('id-ID')}
                                {order.delivery_time_slot ? ` · ${order.delivery_time_slot}` : ''}
                            </p>
                        )}
                    </div>
                </details>
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
                {order.user?.name ?? order.recipient_name}
            </td>
            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-900">
                {formatCurrency(order.total_amount)}
            </td>
            <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatusStyles[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {orderStatusLabels[order.status] ?? order.status}
                </span>
            </td>
            <td className="px-4 py-4">
                <form onSubmit={updateStatus} className="flex min-w-56 items-center gap-2">
                    <label className="sr-only" htmlFor={`order-status-${order.id}`}>
                        Status pesanan {order.order_number}
                    </label>
                    <select
                        id={`order-status-${order.id}`}
                        value={form.data.status}
                        onChange={(event) => form.setData('status', event.target.value)}
                        className="min-w-0 flex-1 rounded-lg border-gray-300 text-xs text-gray-800 focus:border-crimson-700 focus:ring-crimson-700"
                    >
                        {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                                {orderStatusLabels[status] ?? status}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={form.processing || form.data.status === order.status}
                        className="rounded-lg bg-crimson-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-crimson-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {form.processing ? 'Menyimpan' : 'Simpan'}
                    </button>
                </form>
                {form.errors.status && (
                    <p className="mt-1 text-xs text-red-600">{form.errors.status}</p>
                )}
            </td>
        </tr>
    );
}

function StatCard({ label, value, icon: Icon, tone }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-[#eadfcd] bg-white p-4">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
                <p className="text-2xl font-bold leading-tight text-[#3d1725]">{value}</p>
                <p className="truncate text-xs font-medium text-[#746b64]">{label}</p>
            </div>
        </div>
    );
}

export default function Dashboard({
    store,
    products = [],
    orders = { data: [], current_page: 1, last_page: 1 },
    orderStatusFilter = 'all',
    orderStatuses = [],
    stats = {},
}) {
    const statusFilters = [
        { value: 'all', label: 'Semua' },
        ...orderStatuses.map((status) => ({ value: status, label: orderStatusLabels[status] ?? status })),
    ];

    return (
        <SellerCenterLayout
            title="Pesanan"
            description={`Kelola pesanan masuk ${store?.name ?? 'tokomu'}.`}
            actions={
                <Link
                    href={route('admin.products.create')}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-crimson-800 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-crimson-700"
                >
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    Tambah produk
                </Link>
            }
        >
            <Head title="Dashboard Admin" />

            <section aria-label="Ringkasan pesanan" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Pesanan baru" value={stats.new_orders ?? 0} icon={ClipboardList} tone="bg-amber-50 text-amber-700" />
                <StatCard label="Sedang diproses" value={stats.processing_orders ?? 0} icon={Loader} tone="bg-blue-50 text-blue-700" />
                <StatCard label="Selesai" value={stats.completed_orders ?? 0} icon={CheckCircle2} tone="bg-green-50 text-green-700" />
                <StatCard
                    label={`Produk aktif dari ${stats.total_products ?? 0}`}
                    value={stats.active_products ?? 0}
                    icon={Package}
                    tone="bg-crimson-50 text-crimson-800"
                />
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                <section className="min-w-0 overflow-hidden rounded-2xl border border-[#eadfcd] bg-white">
                    <div className="flex flex-col gap-4 border-b border-[#f0e6d6] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-base font-bold text-[#3d1725]">Pesanan masuk</h2>
                            <span className="text-xs font-medium text-[#8b8178]">
                                {orders.total ?? 0} dari {stats.total_orders ?? 0} pesanan
                            </span>
                        </div>

                        <nav aria-label="Filter status pesanan" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                            {statusFilters.map((filter) => (
                                <Link
                                    key={filter.value}
                                    href={route('admin.dashboard', filter.value === 'all' ? {} : { status: filter.value })}
                                    preserveScroll
                                    aria-current={orderStatusFilter === filter.value ? 'page' : undefined}
                                    className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${
                                        orderStatusFilter === filter.value
                                            ? 'bg-crimson-800 text-white'
                                            : 'bg-[#f6f0e4] text-[#5f5650] hover:bg-[#efe6d4]'
                                    }`}
                                >
                                    {filter.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {orders.data?.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[52rem] text-left">
                                    <thead className="bg-[#faf6f0] text-xs uppercase tracking-wide text-[#8b8178]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Pesanan</th>
                                            <th className="px-4 py-3 font-semibold">Pembeli</th>
                                            <th className="px-4 py-3 font-semibold">Total</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Perbarui status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f0e6d6]">
                                        {orders.data.map((order) => (
                                            <OrderRow key={order.id} order={order} orderStatuses={orderStatuses} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {orders.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-[#f0e6d6] px-5 py-4 text-sm">
                                    {orders.prev_page_url ? (
                                        <Link href={orders.prev_page_url} preserveScroll className="font-semibold text-crimson-800 hover:underline">
                                            &larr; Sebelumnya
                                        </Link>
                                    ) : (
                                        <span className="text-gray-400">&larr; Sebelumnya</span>
                                    )}
                                    <span className="text-xs text-[#8b8178]">
                                        Halaman {orders.current_page} dari {orders.last_page}
                                    </span>
                                    {orders.next_page_url ? (
                                        <Link href={orders.next_page_url} preserveScroll className="font-semibold text-crimson-800 hover:underline">
                                            Berikutnya &rarr;
                                        </Link>
                                    ) : (
                                        <span className="text-gray-400">Berikutnya &rarr;</span>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center px-6 py-14 text-center">
                            <ClipboardList aria-hidden="true" className="h-10 w-10 text-[#cdbfa6]" />
                            <p className="mt-3 font-semibold text-[#3d1725]">
                                {orderStatusFilter === 'all' ? 'Belum ada pesanan' : 'Tidak ada pesanan dengan status ini'}
                            </p>
                            <p className="mt-1 text-sm text-[#746b64]">Pesanan untuk toko ini akan muncul di sini.</p>
                        </div>
                    )}
                </section>

                <section className="self-start rounded-2xl border border-[#eadfcd] bg-white">
                    <div className="flex items-center justify-between border-b border-[#f0e6d6] px-5 py-4">
                        <h2 className="text-base font-bold text-[#3d1725]">Produk terbaru</h2>
                        <Link
                            href={route('admin.products.index')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-crimson-800 hover:underline"
                        >
                            Semua
                            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    {products.length > 0 ? (
                        <ul className="divide-y divide-[#f0e6d6]">
                            {products.map((product) => (
                                <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                                    {product.image ? (
                                        <img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                                    ) : (
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f3ecdc] text-[#b3a48c]">
                                            <ImageOff aria-hidden="true" className="h-4 w-4" />
                                        </span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[#3d1725]">{product.name}</p>
                                        <p className="text-xs text-[#8b8178]">
                                            {formatCurrency(product.base_price)} · Stok {product.stock}
                                        </p>
                                    </div>
                                    {!product.is_active && (
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">Nonaktif</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-5 py-6 text-sm text-[#746b64]">Belum ada produk yang diunggah.</p>
                    )}
                </section>
            </div>
        </SellerCenterLayout>
    );
}
