import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

/**
 * Product fields shared by the create and edit pages.
 * `currentImage` is the photo already saved for the product (edit only); a new pick replaces it.
 */
export default function ProductForm({ form, categories = [], currentImage = null, submitLabel, onSubmit }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const variantPreviewUrls = useRef(new Set());

    useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);
    useEffect(() => () => variantPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

    const selectedCategory = categories.find((category) => String(category.id) === String(form.data.category_id));
    const selectedImage = form.data.image;
    const isImageTooLarge = selectedImage && selectedImage.size > MAX_IMAGE_BYTES;
    const displayedImage = previewUrl ?? currentImage;

    const chooseImage = (event) => {
        const file = event.target.files?.[0] ?? null;

        form.setData('image', file);
        form.clearErrors('image');
        setPreviewUrl(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
        event.target.value = '';
    };

    const removeImage = () => {
        form.setData('image', null);
        setPreviewUrl(null);
    };

    const updateVariant = (index, field, value) => {
        form.setData(
            'variants',
            form.data.variants.map((variant, variantIndex) =>
                variantIndex === index ? { ...variant, [field]: value } : variant,
            ),
        );
        form.clearErrors(`variants.${index}.${field}`);
    };

    const releaseVariantPreview = (url) => {
        if (url?.startsWith('blob:')) {
            URL.revokeObjectURL(url);
            variantPreviewUrls.current.delete(url);
        }
    };

    const chooseVariantImage = (index, event) => {
        const file = event.target.files?.[0] ?? null;
        const variant = form.data.variants[index];
        releaseVariantPreview(variant.preview_url);

        const nextPreviewUrl = file?.type.startsWith('image/') ? URL.createObjectURL(file) : null;

        if (nextPreviewUrl) {
            variantPreviewUrls.current.add(nextPreviewUrl);
        }

        form.setData(
            'variants',
            form.data.variants.map((currentVariant, variantIndex) =>
                variantIndex === index
                    ? {
                          ...currentVariant,
                          image: file,
                          preview_url: nextPreviewUrl,
                          remove_image: false,
                      }
                    : currentVariant,
            ),
        );
        form.clearErrors(`variants.${index}.image`);
        event.target.value = '';
    };

    const removeVariantImage = (index) => {
        const variant = form.data.variants[index];
        releaseVariantPreview(variant.preview_url);

        form.setData(
            'variants',
            form.data.variants.map((currentVariant, variantIndex) =>
                variantIndex === index
                    ? {
                          ...currentVariant,
                          image: null,
                          preview_url: null,
                          remove_image: Boolean(currentVariant.current_image),
                      }
                    : currentVariant,
            ),
        );
    };

    const addVariant = () => {
        form.setData('variants', [
            ...form.data.variants,
            {
                type: 'flavor',
                name: '',
                image: null,
                current_image: null,
                preview_url: null,
                remove_image: false,
                additional_price: '0',
                stock: form.data.stock || 10,
            },
        ]);
    };

    const removeVariant = (index) => {
        releaseVariantPreview(form.data.variants[index].preview_url);
        form.setData(
            'variants',
            form.data.variants.filter((_, variantIndex) => variantIndex !== index),
        );
    };

    return (
        <form
            onSubmit={onSubmit}
            method="post"
            encType="multipart/form-data"
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
        >
            <div className="space-y-6">
                <section className="rounded-2xl border border-[#eadfcd] bg-white p-5 sm:p-6">
                    <h2 className="text-base font-bold text-[#3d1725]">Foto produk</h2>
                    <p className="mt-1 text-sm text-[#746b64]">
                        JPG, PNG, atau WEBP. Maksimal 2 MB.
                        {currentImage ? ' Kosongkan jika tidak ingin mengganti foto.' : ''}
                    </p>

                    <label
                        htmlFor="image"
                        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                            form.errors.image ? 'border-red-300 bg-red-50' : 'border-[#e2d6c3] bg-[#fffaf4] hover:border-crimson-400'
                        }`}
                    >
                        <ImagePlus aria-hidden="true" className="h-8 w-8 text-crimson-700" />
                        <span className="mt-2 text-sm font-semibold text-[#3d1725]">
                            {selectedImage || currentImage ? 'Ganti foto' : 'Pilih foto dari perangkat'}
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
                                {currentImage ? 'Batal ganti' : 'Hapus'}
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
                                maxLength={255}
                                required
                            />
                        </Field>

                        <Field
                            id="category_id"
                            label="Kategori"
                            hint={categories.length === 0 ? 'Belum ada kategori aktif. Hubungi admin LAPAKan.' : null}
                            error={form.errors.category_id}
                        >
                            <select
                                id="category_id"
                                value={form.data.category_id}
                                onChange={(event) => form.setData('category_id', event.target.value)}
                                className={inputClass}
                                required
                            >
                                <option value="" disabled>
                                    Pilih kategori
                                </option>
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

                        <Field
                            id="stock"
                            label="Stok produk"
                            hint={form.data.variants.length > 0
                                ? 'Stok varian diatur secara terpisah pada setiap varian di bawah ini.'
                                : 'Digunakan untuk produk yang tidak memiliki varian.'}
                            error={form.errors.stock}
                        >
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
                                maxLength={2000}
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

                <section className="rounded-2xl border border-[#eadfcd] bg-white p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-[#3d1725]">Varian produk</h2>
                            <p className="mt-1 text-sm text-[#746b64]">
                                Tambahkan beberapa rasa atau pilihan lain, masing-masing dengan harga tambahan dan stok.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-crimson-700 px-3 text-sm font-semibold text-crimson-800 transition hover:bg-crimson-50"
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah varian
                        </button>
                    </div>

                    {form.errors.variants && (
                        <p className="mt-3 text-sm font-medium text-red-600">{form.errors.variants}</p>
                    )}

                    {form.data.variants.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-[#fffaf4] px-4 py-3 text-sm text-[#8b8178]">
                            Belum ada varian. Contoh: Belgian Dark Choco, Matcha Cream Cheese, dan Taro Milk Tea.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {form.data.variants.map((variant, index) => (
                                <div
                                    key={`${variant.id ?? 'new'}-${index}`}
                                    className="rounded-xl border border-[#f0e6d6] bg-[#fffdf9] p-4"
                                >
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[0.85fr_1.4fr_1.2fr_1fr_auto]">
                                        <Field
                                            id={`variant-type-${index}`}
                                            label="Jenis"
                                            error={form.errors[`variants.${index}.type`]}
                                        >
                                            <select
                                                id={`variant-type-${index}`}
                                                value={variant.type}
                                                onChange={(event) => updateVariant(index, 'type', event.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="flavor">Rasa</option>
                                                <option value="size">Ukuran</option>
                                                <option value="tier">Tingkat</option>
                                            </select>
                                        </Field>
                                        <Field
                                            id={`variant-name-${index}`}
                                            label="Nama varian"
                                            error={form.errors[`variants.${index}.name`]}
                                        >
                                            <input
                                                id={`variant-name-${index}`}
                                                type="text"
                                                value={variant.name}
                                                onChange={(event) => updateVariant(index, 'name', event.target.value)}
                                                className={inputClass}
                                                placeholder="Belgian Dark Choco"
                                                maxLength={255}
                                                required
                                            />
                                        </Field>
                                        <Field
                                            id={`variant-price-${index}`}
                                            label="Harga tambahan"
                                            error={form.errors[`variants.${index}.additional_price`]}
                                        >
                                            <div className="mt-1.5 flex items-center rounded-xl border border-[#e2d6c3] bg-white shadow-sm transition focus-within:border-crimson-700 focus-within:ring-1 focus-within:ring-crimson-700">
                                                <span className="shrink-0 pl-3 text-sm font-semibold text-[#8b8178]">Rp</span>
                                                <input
                                                    id={`variant-price-${index}`}
                                                    type="number"
                                                    min="0"
                                                    step="500"
                                                    value={variant.additional_price}
                                                    onChange={(event) => updateVariant(index, 'additional_price', event.target.value)}
                                                    className="block min-w-0 w-full border-0 bg-transparent py-2 pr-3 pl-2 text-sm text-gray-900 shadow-none focus:border-0 focus:outline-none focus:ring-0"
                                                    required
                                                />
                                            </div>
                                        </Field>
                                        <Field
                                            id={`variant-stock-${index}`}
                                            label="Stok varian"
                                            error={form.errors[`variants.${index}.stock`]}
                                        >
                                            <input
                                                id={`variant-stock-${index}`}
                                                type="number"
                                                min="0"
                                                value={variant.stock}
                                                onChange={(event) => updateVariant(index, 'stock', event.target.value)}
                                                className={inputClass}
                                                required
                                            />
                                        </Field>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            aria-label={`Hapus varian ${variant.name || index + 1}`}
                                            className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50 sm:justify-self-end"
                                        >
                                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-center">
                                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[#f0e6d6] bg-[#fffaf4]">
                                            {variant.preview_url || (!variant.remove_image && variant.current_image) ? (
                                                <img
                                                    src={variant.preview_url || variant.current_image}
                                                    alt={`Pratinjau gambar ${variant.name || 'varian'}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ImagePlus aria-hidden="true" className="h-7 w-7 text-[#b3a48c]" />
                                            )}
                                        </div>
                                        <Field
                                            id={`variant-image-${index}`}
                                            label="Gambar varian"
                                            hint="JPG, PNG, atau WEBP. Maksimal 2 MB."
                                            error={form.errors[`variants.${index}.image`]}
                                        >
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                <label
                                                    htmlFor={`variant-image-${index}`}
                                                    className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#e2d6c3] bg-white px-3 text-sm font-semibold text-[#3d1725] transition hover:bg-[#fffaf4]"
                                                >
                                                    <ImagePlus aria-hidden="true" className="h-4 w-4" />
                                                    {variant.current_image && !variant.remove_image ? 'Ganti gambar' : 'Pilih gambar'}
                                                </label>
                                                <input
                                                    id={`variant-image-${index}`}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(event) => chooseVariantImage(index, event)}
                                                    className="sr-only"
                                                />
                                                {(variant.preview_url || (!variant.remove_image && variant.current_image)) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantImage(index)}
                                                        className="inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                                                        Hapus gambar
                                                    </button>
                                                )}
                                                {variant.image && (
                                                    <span className="max-w-full truncate text-xs text-[#8b8178]">
                                                        {variant.image.name} ({formatFileSize(variant.image.size)})
                                                    </span>
                                                )}
                                            </div>
                                            {variant.image?.size > MAX_IMAGE_BYTES && !form.errors[`variants.${index}.image`] && (
                                                <p className="mt-1 text-xs font-medium text-amber-700">
                                                    Gambar lebih dari 2 MB dan akan ditolak server saat disimpan.
                                                </p>
                                            )}
                                        </Field>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                <section className="overflow-hidden rounded-2xl border border-[#eadfcd] bg-white">
                    <p className="border-b border-[#f0e6d6] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a5466]">
                        Pratinjau di etalase
                    </p>
                    <div className="aspect-square bg-[#f3ecdc]">
                        {displayedImage ? (
                            <img src={displayedImage} alt="Pratinjau foto produk" className="h-full w-full object-cover" />
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
                        : submitLabel}
                </button>
            </aside>
        </form>
    );
}
