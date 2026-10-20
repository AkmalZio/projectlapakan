import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            address: user.address ?? '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="mb-6">
                <h2 className="text-xl font-extrabold text-gray-900">
                    Informasi Akun
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Perbarui nama, email, dan alamat pengiriman akun kamu.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Nama" className="mb-1.5 text-sm font-semibold text-gray-700" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full rounded-xl border-[#e7d7c6] bg-[#fffaf7] px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-[#7d0f2e] focus:ring-[#f0bfd0]"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" className="mb-1.5 text-sm font-semibold text-gray-700" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full rounded-xl border-[#e7d7c6] bg-[#fffaf7] px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-[#7d0f2e] focus:ring-[#f0bfd0]"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="address" value="Alamat" className="mb-1.5 text-sm font-semibold text-gray-700" />

                    <TextInput
                        id="address"
                        className="mt-1 block w-full rounded-xl border-[#e7d7c6] bg-[#fffaf7] px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-[#7d0f2e] focus:ring-[#f0bfd0]"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        autoComplete="street-address"
                        placeholder="Contoh: Jl. Merdeka No. 123, Jakarta"
                    />

                    <InputError className="mt-2" message={errors.address} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl border border-[#f0e0d8] bg-[#fffaf7] p-3 text-sm text-gray-700">
                        <p>
                            Alamat email kamu belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 font-semibold text-[#7d0f2e] underline decoration-[#d19aa9] underline-offset-2 hover:text-[#5d0b20]"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-700">
                                Link verifikasi baru telah dikirim ke email kamu.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="rounded-xl border border-[#481225] bg-[#4b0a1c] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_18px_rgba(74,7,28,0.18)] hover:bg-[#651730] focus:bg-[#651730]">
                        Simpan
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-emerald-700">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
