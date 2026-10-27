import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ClipboardList, LogOut, PackageCheck, ShoppingBag, UserRound } from 'lucide-react';

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
                    <summary className="cursor-pointer text-xs font-semibold text-[#6d0d2a]">
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
                        className="min-w-0 flex-1 rounded-lg border-gray-300 text-xs text-gray-800 focus:border-[#4a071c] focus:ring-[#4a071c]"
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
                        className="rounded-lg bg-[#4a071c] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6d0d2a] disabled:cursor-not-allowed disabled:opacity-50"
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

export default function Dashboard({
    store,
    products = [],
    categories = [],
    orders = { data: [], current_page: 1, last_page: 1 },
    orderStatusFilter = 'all',
    orderStatuses = [],
    stats = {},
    success,
}) {
    const form = useForm({
        category_id: categories[0]?.id ?? '',
        name: '',
        description: '',
        base_price: '',
        stock: 10,
        image: '',
        is_active: true,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.products.store'));
    };

    return (
        <MarketplaceLayout title="Dashboard Admin">
            <Head title="Dashboard Admin" />

            <div className="lapakan-dashboard-shell">
                <section className="lapakan-dashboard-hero">
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-pink-100">
                            Ruang admin · {store?.name ?? 'Toko Baru'}
                        </span>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                            Kelola toko dan pesanan
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-white/75">
                            Pantau pesanan masuk dan atur produk tokomu dari satu tempat.
                        </p>
                    </div>
                    <ShoppingBag aria-hidden="true" className="relative z-10 hidden h-12 w-12 text-white/80 sm:block" />
                    <Link
                        href={route('profile.edit')}
                        className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                        Profil
                        <UserRound aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                        Keluar
                        <LogOut aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </section>

                {success && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800" role="status">
                        {success}
                    </div>
                )}

            <div className="flex flex-col gap-8">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="lapakan-dashboard-card p-5">
                        <p className="text-sm text-gray-500">Total Produk</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_products ?? 0}</p>
                    </div>
                    <div className="lapakan-dashboard-card p-5">
                        <p className="text-sm text-gray-500">Produk Aktif</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.active_products ?? 0}</p>
                    </div>
                    <div className="lapakan-dashboard-card p-5">
                        <p className="text-sm text-gray-500">Stock Keseluruhan</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_stock ?? 0}</p>
                    </div>
                </div>

                <section className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="lapakan-dashboard-card flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm text-gray-500">Total Pesanan</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.total_orders ?? 0}</p>
                            </div>
                            <ShoppingBag aria-hidden="true" className="h-6 w-6 text-[#6d0d2a]" />
                        </div>
                        <div className="lapakan-dashboard-card flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm text-gray-500">Pesanan Baru</p>
                                <p className="mt-2 text-2xl font-bold text-amber-700">{stats.new_orders ?? 0}</p>
                            </div>
                            <ClipboardList aria-hidden="true" className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="lapakan-dashboard-card flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm text-gray-500">Sedang Diproses</p>
                                <p className="mt-2 text-2xl font-bold text-blue-700">{stats.processing_orders ?? 0}</p>
                            </div>
                            <PackageCheck aria-hidden="true" className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="lapakan-dashboard-card flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm text-gray-500">Selesai</p>
                                <p className="mt-2 text-2xl font-bold text-green-700">{stats.completed_orders ?? 0}</p>
                            </div>
                            <PackageCheck aria-hidden="true" className="h-6 w-6 text-green-600" />
                        </div>
                    </div>

                    <div className="lapakan-dashboard-card overflow-hidden">
                        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Manajemen Pesanan Masuk</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Baca rincian pesanan dan perbarui status pengerjaannya.
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#fdf1f5] px-3 py-1 text-xs font-semibold text-[#6d0d2a]">
                                    {orders.total ?? 0} pesanan
                                </span>
                            </div>

                            <nav aria-label="Filter status pesanan" className="flex gap-2 overflow-x-auto pb-1">
                                {[
                                    { value: 'all', label: 'Semua' },
                                    ...orderStatuses.map((status) => ({
                                        value: status,
                                        label: orderStatusLabels[status] ?? status,
                                    })),
                                ].map((filter) => (
                                    <Link
                                        key={filter.value}
                                        href={route('admin.dashboard', filter.value === 'all' ? {} : { status: filter.value })}
                                        preserveScroll
                                        className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${
                                            orderStatusFilter === filter.value
                                                ? 'bg-[#4a071c] text-white'
                                                : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
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
                                    <table className="w-full min-w-[58rem] text-left">
                                        <thead className="bg-cream-50 text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Pesanan</th>
                                                <th className="px-4 py-3 font-semibold">Pembeli</th>
                                                <th className="px-4 py-3 font-semibold">Total</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                                <th className="px-4 py-3 font-semibold">Perbarui status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.data.map((order) => (
                                                <OrderRow
                                                    key={order.id}
                                                    order={order}
                                                    orderStatuses={orderStatuses}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-sm">
                                    {orders.prev_page_url ? (
                                        <Link
                                            href={orders.prev_page_url}
                                            preserveScroll
                                            className="font-semibold text-[#6d0d2a] hover:underline"
                                        >
                                            &larr; Sebelumnya
                                        </Link>
                                    ) : (
                                        <span className="text-gray-400">&larr; Sebelumnya</span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        Halaman {orders.current_page} dari {orders.last_page}
                                    </span>
                                    {orders.next_page_url ? (
                                        <Link
                                            href={orders.next_page_url}
                                            preserveScroll
                                            className="font-semibold text-[#6d0d2a] hover:underline"
                                        >
                                            Berikutnya &rarr;
                                        </Link>
                                    ) : (
                                        <span className="text-gray-400">Berikutnya &rarr;</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center px-6 py-12 text-center">
                                <ClipboardList aria-hidden="true" className="h-10 w-10 text-gray-300" />
                                <p className="mt-3 font-semibold text-gray-900">Belum ada pesanan</p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Pesanan untuk toko ini akan muncul di sini.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="lapakan-dashboard-card p-6">
                        <h3 className="mb-5 text-xl font-semibold text-gray-900">Tambah Produk Baru</h3>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                                    Nama Produk
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#4a071c] focus:outline-none"
                                        placeholder="Contoh: Kue Ulang Tahun Custom"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-gray-700">
                                    Kategori
                                    <select
                                        value={form.data.category_id}
                                        onChange={(event) => form.setData('category_id', event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#4a071c] focus:outline-none"
                                    >
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-sm font-medium text-gray-700">
                                    Harga Dasar
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.base_price}
                                        onChange={(event) => form.setData('base_price', event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#4a071c] focus:outline-none"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-gray-700">
                                    Stok
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.stock}
                                        onChange={(event) => form.setData('stock', event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#4a071c] focus:outline-none"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                                    Link Gambar Produk
                                    <input
                                        type="url"
                                        value={form.data.image}
                                        onChange={(event) => form.setData('image', event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#4a071c] focus:outline-none"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </label>

                                <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                                    Deskripsi Produk
                                    <textarea
                                        rows="4"
                                        value={form.data.description}
                                        onChange={(event) => form.setData('description', event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#4a071c] focus:outline-none"
                                        placeholder="Jelaskan spesifikasi dan manfaat produk ..."
                                    />
                                </label>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) => form.setData('is_active', event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#4a071c] focus:ring-[#4a071c]"
                                />
                                Produk aktif dan bisa dilihat pelanggan
                            </label>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-lg bg-[#4a071c] px-4 py-2 font-semibold text-white transition hover:bg-[#6d0d2a] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan Produk'}
                            </button>
                        </form>
                    </div>

                    <div className="lapakan-dashboard-card p-6">
                        <h3 className="mb-5 text-xl font-semibold text-gray-900">Produk Terbaru</h3>
                        <div className="space-y-3">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <div key={product.id} className="rounded-xl border border-gray-200 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500">{product.category?.name ?? 'Kategori'}</p>
                                            </div>
                                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                                {product.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                                            <span>Rp {Number(product.base_price).toLocaleString('id-ID')}</span>
                                            <span>Stok: {product.stock}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada produk yang diunggah.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </MarketplaceLayout>
    );
}
