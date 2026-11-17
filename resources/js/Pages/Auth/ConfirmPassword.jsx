import { AuthHeader, AuthInput, AuthSubmitButton } from '@/Components/AuthForm';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Password" />

            <div className="space-y-6">
                <AuthHeader
                    title="Konfirmasi Password"
                    description="Ini area yang aman. Masukkan password-mu sekali lagi untuk melanjutkan."
                />

                <form onSubmit={submit} className="space-y-5">
                    <AuthInput
                        id="password"
                        type="password"
                        label="Password"
                        icon={LockKeyhole}
                        value={data.password}
                        autoComplete="current-password"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />

                    <AuthSubmitButton processing={processing}>Konfirmasi</AuthSubmitButton>
                </form>
            </div>
        </GuestLayout>
    );
}
