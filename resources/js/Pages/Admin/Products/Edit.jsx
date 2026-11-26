import SellerCenterLayout from '@/Layouts/SellerCenterLayout';
import ProductForm from '@/Pages/Admin/Products/Partials/ProductForm';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ store, product, categories = [] }) {
    const form = useForm({
        _method: 'patch',
        name: product.name ?? '',
        category_id: categories.some((category) => category.id === product.category_id) ? product.category_id : '',
        base_price: product.base_price != null ? String(Number(product.base_price)) : '',
        stock: product.stock ?? 0,
        weight_grams: product.weight_grams ?? '',
        description: product.description ?? '',
        image: null,
        is_active: Boolean(product.is_active),
        is_featured: Boolean(product.is_featured),
        variants_present: true,
        variants: (product.variants ?? []).map((variant) => ({
            id: variant.id,
            type: variant.type,
            name: variant.name,
            image: null,
            current_image: variant.image,
            preview_url: null,
            remove_image: false,
            additional_price: String(Number(variant.additional_price)),
            stock: variant.stock,
        })),
    });

    const submit = (event) => {
        event.preventDefault();
        // Files cannot be sent with a real PATCH request, so the update is a POST spoofed with _method.
        form.post(route('admin.products.update', product.id), { forceFormData: true });
    };

    return (
        <SellerCenterLayout
            title="Edit Produk"
            description={`Perbarui "${product.name}" di ${store?.name ?? 'tokomu'}.`}
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
            <Head title="Edit Produk" />

            <ProductForm
                form={form}
                categories={categories}
                currentImage={product.image}
                submitLabel="Simpan perubahan"
                onSubmit={submit}
            />
        </SellerCenterLayout>
    );
}
