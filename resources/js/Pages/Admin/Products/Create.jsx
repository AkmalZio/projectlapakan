import SellerCenterLayout from '@/Layouts/SellerCenterLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const inputClass =
    'mt-1.5 block w-full rounded-xl border-[#e2d6c3] bg-white text-sm text-gray-900 shadow-sm focus:border-crimson-700 focus:ring-crimson-700';

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

function formatFileSize(bytes) {
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function Field({ id, label, hint, error, className = '', children }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="text-sm font-semibold text-[#3d1725]">
                {label}
            </label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-[#8b8178]">{hint}</p>}
            {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

export default function Create({ store, categories = [] }) {
    const form = useForm({
        name: '',
        category_id: categories[0]?.id ?? '',
        base_price: '',
        stock: 10,
        weight_grams: '',
        description: '',
        image: null,
        is_active: true,
        is_featured: true,
    });
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

    const selectedCategory = categories.find((category) => String(category.id) === String(form.data.category_id));
    const selectedImage = form.data.image;
    const isImageTooLarge = selectedImage && selectedImage.size > MAX_IMAGE_BYTES;

    const chooseImage = (event) => {
        const file = event.target.files?.[0] ?? null;

        form.setData('image', file);
        form.clearErrors('image');
        setPreviewUrl(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    };

    const removeImage = () => {
        form.setData('image', null);
        setPreviewUrl(null);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.products.store'), { forceFormData: true });
    };

    return (
        <SellerCenterLayout
            title="Tambah Produk"
            description={`Unggah produk baru untuk ${store?.name ?? 'tokomu'}.`}
            actions={
                <Link
                    href={route('admin.products.index')}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e2d6c3] bg-white px-4 text-sm font-semibold text-[#3d1725] transition hover:bg-[#fffaf4]"
                >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Daftar produk
                </Link>
            }
        >
            <Head title="Tambah Produk" />

            <form
                onSubmit={submit}
                method="post"
                encType="multipart/form-data"
                className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
            >
                <div className="space-y-6">
                    <section className="rounded-2xl border border-[#eadfcd] bg-white p-5 sm:p-6">
                        <h2 className="text-base font-bold text-[#3d1725]">Foto produk</h2>
                        <p className="mt-1 text-sm text-[#746b64]">JPG, PNG, atau WEBP. Maksimal 2 MB.</p>

                        <label
                            htmlFor="image"
                            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                                form.errors.image ? 'border-red-300 bg-red-50' : 'border-[#e2d6c3] bg-[#fffaf4] hover:border-crimson-400'
                            }`}
                        >
                            <ImagePlus aria-hidden="true" className="h-8 w-8 text-crimson-700" />
                            <span className="mt-2 text-sm font-semibold text-[#3d1725]">
                                {selectedImage ? 'Ganti foto' : 'Pilih foto dari perangkat'}
                            </span>
                            <span className="mt-1 text-xs text-[#8b8178]">Klik untuk memilih file</span>
                            <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={chooseImage}
                                className="sr-only"
                            />
                        </label>

                        {selectedImage && (
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#faf6f0] px-3 py-2 text-sm">
                                <span className="min-w-0 truncate text-[#3d1725]">
                                    {selectedImage.name}{' '}
                                    <span className={isImageTooLarge ? 'font-semibold text-red-600' : 'text-[#8b8178]'}>
                                        ({formatFileSize(selectedImage.size)})
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                                    Hapus
                                </button>
                            </div>
                        )}
                        {isImageTooLarge && !form.errors.image && (
                            <p className="mt-2 text-xs font-medium text-amber-700">
                                Foto lebih dari 2 MB dan akan ditolak server saat disimpan.
                            </p>
                        )}
                        {form.errors.image && <p className="mt-2 text-xs font-medium text-red-600">{form.errors.image}</p>}
                    </section>

                    <section className="rounded-2xl border border-[#eadfcd] bg-white p-5 sm:p-6">
                        <h2 className="text-base font-bold text-[#3d1725]">Informasi produk</h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <Field id="name" label="Nama produk" error={form.errors.name} className="sm:col-span-2">
                                <input
                                    id="name"
                                    type="text"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    className={inputClass}
                                    placeholder="Contoh: Red Velvet Bento Cake"
                                    required
                                />
                            </Field>

                            <Field id="category_id" label="Kategori" error={form.errors.category_id}>
                                <select
                                    id="category_id"
                                    value={form.data.category_id}
                                    onChange={(event) => form.setData('category_id', event.target.value)}
                                    className={inputClass}
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field id="base_price" label="Harga (Rp)" error={form.errors.base_price}>
                                <input
                                    id="base_price"
                                    type="number"
                                    min="0"
                                    step="500"
                                    inputMode="numeric"
                                    value={form.data.base_price}
                                    onChange={(event) => form.setData('base_price', event.target.value)}
                                    className={inputClass}
                                    placeholder="85000"
                                    required
                                />
                            </Field>

                            <Field id="stock" label="Stok" error={form.errors.stock}>
                                <input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    value={form.data.stock}
                                    onChange={(event) => form.setData('stock', event.target.value)}
                                    className={inputClass}
                                    required
                                />
                            </Field>

                            <Field id="weight_grams" label="Berat (gram)" hint="Opsional, untuk ongkos kirim." error={form.errors.weight_grams}>
                                <input
                                    id="weight_grams"
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    value={form.data.weight_grams}
                                    onChange={(event) => form.setData('weight_grams', event.target.value)}
                                    className={inputClass}
                                    placeholder="500"
                                />
                            </Field>

                            <Field id="description" label="Deskripsi" error={form.errors.description} className="sm:col-span-2">
                                <textarea
                                    id="description"
                                    rows="5"
                                    value={form.data.description}
                                    onChange={(event) => form.setData('description', event.target.value)}
                                    className={inputClass}
                                    placeholder="Rasa, ukuran, bahan utama, dan daya tahan produk."
                                />
                            </Field>
                        </div>

                        <div className="mt-5 space-y-3 border-t border-[#f0e6d6] pt-5">
                            <label className="flex items-start gap-3 text-sm text-[#3d1725]">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) => form.setData('is_active', event.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-crimson-700 focus:ring-crimson-700"
                                />
                                <span>
                                    <span className="font-semibold">Aktifkan produk</span>
                                    <span className="block text-xs text-[#8b8178]">Produk bisa dilihat dan dibeli pelanggan.</span>
                                </span>
                            </label>
                            <label className="flex items-start gap-3 text-sm text-[#3d1725]">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_featured}
                                    onChange={(event) => form.setData('is_featured', event.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-crimson-700 focus:ring-crimson-700"
                                />
                                <span>
                                    <span className="font-semibold">Tampilkan di beranda</span>
                                    <span className="block text-xs text-[#8b8178]">Masuk ke bagian produk pilihan di halaman utama.</span>
                                </span>
                            </label>
                        </div>
                    </section>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                    <section className="overflow-hidden rounded-2xl border border-[#eadfcd] bg-white">
                        <p className="border-b border-[#f0e6d6] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a5466]">
                            Pratinjau di etalase
                        </p>
                        <div className="aspect-square bg-[#f3ecdc]">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Pratinjau foto produk" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-[#b3a48c]">
                                    <ImagePlus aria-hidden="true" className="h-10 w-10" />
                                    <span className="text-xs">Belum ada foto</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1 p-5">
                            <p className="text-xs font-medium text-[#9a5466]">{selectedCategory?.name ?? 'Kategori'}</p>
                            <p className="font-bold text-[#3d1725]">{form.data.name || 'Nama produk'}</p>
                            <p className="text-lg font-extrabold text-crimson-800">{formatCurrency(form.data.base_price)}</p>
                            <p className="text-xs text-[#8b8178]">
                                Stok {form.data.stock || 0}
                                {form.data.weight_grams ? ` · ${form.data.weight_grams} g` : ''}
                            </p>
                            {form.data.description && (
                                <p className="line-clamp-3 pt-2 text-sm text-[#746b64]">{form.data.description}</p>
                            )}
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-crimson-800 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-crimson-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {form.processing
                            ? form.progress
                                ? `Mengunggah ${form.progress.percentage}%`
                                : 'Menyimpan...'
                            : 'Simpan produk'}
                    </button>
                </aside>
            </form>
        </SellerCenterLayout>
    );
}
