import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Dashboard({ store, products = [], categories = [], stats = {}, success }) {
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
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard Penjual
                    </h2>
                    <span className="rounded-full bg-[#4a071c] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        {store?.name ?? 'Toko Baru'}
                    </span>
                </div>
            }
        >
            <Head title="Dashboard Penjual" />

            {success && (
                <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm text-gray-500">Total Produk</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_products ?? 0}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm text-gray-500">Produk Aktif</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.active_products ?? 0}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm text-gray-500">Stock Keseluruhan</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_stock ?? 0}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
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

                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
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
        </AuthenticatedLayout>
    );
}
