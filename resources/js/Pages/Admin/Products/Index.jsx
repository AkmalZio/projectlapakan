import SellerCenterLayout from '@/Layouts/SellerCenterLayout';
import ImageWithFallback from '@/Components/ImageWithFallback';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, EyeOff, ImageOff, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

function ProductThumbnail({ product }) {
    return product.image ? (
        <ImageWithFallback src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-[#eadfcd]" />
    ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f3ecdc] text-[#b3a48c]">
            <ImageOff aria-hidden="true" className="h-5 w-5" />
        </span>
    );
}

function StatusBadge({ isActive }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
        >
            {isActive ? 'Aktif' : 'Nonaktif'}
        </span>
    );
}

const actionButtonClass =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Edit, show/hide and delete controls for one product. Products that were already ordered
 * cannot be deleted (it would erase them from order history), so only hiding is offered.
 */
function ProductActions({ product }) {
    const [isBusy, setIsBusy] = useState(false);
    const hasOrders = Number(product.order_items_count) > 0;
    const requestOptions = {
        preserveScroll: true,
        onStart: () => setIsBusy(true),
        onFinish: () => setIsBusy(false),
    };

    const toggleActive = () => {
        router.patch(route('admin.products.toggle-active', product.id), {}, requestOptions);
    };

    const destroy = () => {
        if (window.confirm(`Hapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(route('admin.products.destroy', product.id), requestOptions);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Link
                href={route('admin.products.edit', product.id)}
                title={`Edit ${product.name}`}
                aria-label={`Edit ${product.name}`}
                className={`${actionButtonClass} border-[#e2d6c3] bg-white text-[#3d1725] hover:bg-[#fffaf4]`}
            >
                <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <button
                type="button"
                onClick={toggleActive}
                disabled={isBusy}
                title={product.is_active ? `Nonaktifkan ${product.name}` : `Aktifkan ${product.name}`}
                aria-label={product.is_active ? `Nonaktifkan ${product.name}` : `Aktifkan ${product.name}`}
                className={`${actionButtonClass} border-[#e2d6c3] bg-white text-[#3d1725] hover:bg-[#fffaf4]`}
            >
                {product.is_active ? (
                    <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                    <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                )}
            </button>
            <button
                type="button"
                onClick={destroy}
                disabled={isBusy || hasOrders}
                title={hasOrders ? 'Produk sudah pernah dipesan. Nonaktifkan untuk menyembunyikannya.' : `Hapus ${product.name}`}
                aria-label={`Hapus ${product.name}`}
                className={`${actionButtonClass} border-red-200 bg-white text-red-700 hover:bg-red-50`}
            >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export default function Index({ store, products = { data: [] }, isPlatformAdmin = false }) {
    const addProductButton = (
        <Link
            href={route('admin.products.create')}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-crimson-800 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-crimson-700"
        >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Tambah produk
        </Link>
    );

    return (
        <SellerCenterLayout
            title={isPlatformAdmin ? 'Semua Produk' : 'Produk Saya'}
            description={
                isPlatformAdmin
                    ? `${products.total ?? 0} produk dari semua toko.`
                    : `${products.total ?? 0} produk di ${store?.name ?? 'tokomu'}.`
            }
            actions={addProductButton}
        >
            <Head title={isPlatformAdmin ? 'Semua Produk' : 'Produk Saya'} />

            <section className="overflow-hidden rounded-2xl border border-[#eadfcd] bg-white">
                {products.data.length > 0 ? (
                    <>
                        <div className="relative hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#faf6f0] text-xs uppercase tracking-wide text-[#8b8178]">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Produk</th>
                                        <th className="px-5 py-3 font-semibold">Kategori</th>
                                        <th className="px-5 py-3 text-right font-semibold">Harga</th>
                                        <th className="px-5 py-3 text-right font-semibold">Stok</th>
                                        <th className="px-5 py-3 font-semibold">Status</th>
                                        <th className="px-5 py-3 font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f0e6d6]">
                                    {products.data.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <ProductThumbnail product={product} />
                                                    <div className="min-w-0">
                                                        {product.is_active ? (
                                                            <Link
                                                                href={route('product.show', product.slug)}
                                                                className="font-semibold text-[#3d1725] hover:text-crimson-700 hover:underline"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                        ) : (
                                                            <span className="font-semibold text-[#3d1725]">{product.name}</span>
                                                        )}
                                                        {isPlatformAdmin && (
                                                            <p className="mt-0.5 text-xs text-[#8b8178]">{product.store?.name ?? 'Toko tidak diketahui'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-[#746b64]">{product.category?.name ?? '-'}</td>
                                            <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-[#3d1725]">
                                                {formatCurrency(product.base_price)}
                                            </td>
                                            <td className={`px-5 py-3 text-right font-semibold ${product.stock <= 5 ? 'text-amber-700' : 'text-[#3d1725]'}`}>
                                                {product.stock}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge isActive={product.is_active} />
                                            </td>
                                            <td className="px-5 py-3">
                                                <ProductActions product={product} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <ul className="divide-y divide-[#f0e6d6] md:hidden">
                            {products.data.map((product) => (
                                <li key={product.id} className="flex gap-3 p-4">
                                    <ProductThumbnail product={product} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-[#3d1725]">{product.name}</p>
                                            <StatusBadge isActive={product.is_active} />
                                        </div>
                                        <p className="text-xs text-[#8b8178]">{product.category?.name ?? '-'}</p>
                                        <p className="mt-1 text-sm">
                                            <span className="font-semibold text-[#3d1725]">{formatCurrency(product.base_price)}</span>
                                            <span className="text-[#8b8178]"> · Stok {product.stock}</span>
                                        </p>
                                        <div className="mt-3">
                                            <ProductActions product={product} />
                                        </div>
                                        {isPlatformAdmin && (
                                            <p className="mt-2 text-xs text-[#8b8178]">{product.store?.name ?? 'Toko tidak diketahui'}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {products.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-[#f0e6d6] px-5 py-4 text-sm">
                                {products.prev_page_url ? (
                                    <Link href={products.prev_page_url} preserveScroll className="font-semibold text-crimson-800 hover:underline">
                                        &larr; Sebelumnya
                                    </Link>
                                ) : (
                                    <span className="text-gray-400">&larr; Sebelumnya</span>
                                )}
                                <span className="text-xs text-[#8b8178]">
                                    Halaman {products.current_page} dari {products.last_page}
                                </span>
                                {products.next_page_url ? (
                                    <Link href={products.next_page_url} preserveScroll className="font-semibold text-crimson-800 hover:underline">
                                        Berikutnya &rarr;
                                    </Link>
                                ) : (
                                    <span className="text-gray-400">Berikutnya &rarr;</span>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                        <Package aria-hidden="true" className="h-10 w-10 text-[#cdbfa6]" />
                        <p className="mt-3 font-semibold text-[#3d1725]">Belum ada produk</p>
                        <p className="mt-1 max-w-sm text-sm text-[#746b64]">
                            Unggah produk pertamamu supaya bisa tampil di etalase pembeli.
                        </p>
                        <div className="mt-5">{addProductButton}</div>
                    </div>
                )}
            </section>
        </SellerCenterLayout>
    );
}
