import { AuthHeader, AuthStatus, AuthSubmitButton } from '@/Components/AuthForm';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="space-y-6">
                <AuthHeader
                    title="Verifikasi Email"
                    description="Terima kasih sudah mendaftar! Klik tautan verifikasi yang kami kirim ke emailmu. Belum menerima emailnya? Kami bisa mengirim ulang."
                />

                {status === 'verification-link-sent' && (
                    <AuthStatus>Tautan verifikasi baru sudah dikirim ke email yang kamu daftarkan.</AuthStatus>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <AuthSubmitButton processing={processing} processingLabel="Mengirim...">
                        Kirim Ulang Email Verifikasi
                    </AuthSubmitButton>
                </form>

                <div className="border-t border-[#dccaa5] pt-5 text-center text-sm text-[#5f4a50]">
                    <Link href={route('logout')} method="post" as="button" className="font-bold text-[#8b1f3f] hover:underline">
                        Keluar
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
