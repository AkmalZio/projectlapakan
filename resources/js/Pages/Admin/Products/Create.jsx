import SellerCenterLayout from '@/Layouts/SellerCenterLayout';
import ProductForm from '@/Pages/Admin/Products/Partials/ProductForm';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Create({ store, categories = [] }) {
    const form = useForm({
        name: '',
        category_id: '',
        base_price: '',
        stock: 10,
        weight_grams: '',
        description: '',
        image: null,
        is_active: true,
        is_featured: true,
    });

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

            <ProductForm form={form} categories={categories} submitLabel="Simpan produk" onSubmit={submit} />
        </SellerCenterLayout>
    );
}
