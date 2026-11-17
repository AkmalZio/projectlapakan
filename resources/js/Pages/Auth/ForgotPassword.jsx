import { AuthHeader, AuthInput, AuthStatus, AuthSubmitButton } from '@/Components/AuthForm';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <div className="space-y-6">
                <AuthHeader
                    title="Lupa Password"
                    description="Masukkan email akunmu. Kami akan mengirim tautan untuk membuat password baru."
                />

                {status && <AuthStatus>{status}</AuthStatus>}

                <form onSubmit={submit} className="space-y-5">
                    <AuthInput
                        id="email"
                        type="email"
                        label="Email"
                        icon={Mail}
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        placeholder="nama@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                    />

                    <AuthSubmitButton processing={processing} processingLabel="Mengirim...">
                        Kirim Tautan Reset Password
                    </AuthSubmitButton>
                </form>

                <div className="border-t border-[#dccaa5] pt-5 text-center text-sm text-[#5f4a50]">
                    Sudah ingat passwordnya?{' '}
                    <Link href={route('login')} className="font-bold text-[#8b1f3f] hover:underline">
                        Kembali masuk
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
