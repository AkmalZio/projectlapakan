import { AuthHeader, AuthInput, AuthSubmitButton } from '@/Components/AuthForm';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { LockKeyhole, Mail } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Password" />

            <div className="space-y-6">
                <AuthHeader title="Atur Ulang Password" description="Buat password baru untuk akun LAPAKan-mu." />

                <form onSubmit={submit} className="space-y-5">
                    <AuthInput
                        id="email"
                        type="email"
                        label="Email"
                        icon={Mail}
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                    />

                    <AuthInput
                        id="password"
                        type="password"
                        label="Password Baru"
                        icon={LockKeyhole}
                        value={data.password}
                        autoComplete="new-password"
                        autoFocus
                        placeholder="Minimal 8 karakter"
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />

                    <AuthInput
                        id="password_confirmation"
                        type="password"
                        label="Ulangi Password Baru"
                        icon={LockKeyhole}
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={errors.password_confirmation}
                    />

                    <AuthSubmitButton processing={processing} processingLabel="Menyimpan...">
                        Simpan Password Baru
                    </AuthSubmitButton>
                </form>
            </div>
        </GuestLayout>
    );
}
