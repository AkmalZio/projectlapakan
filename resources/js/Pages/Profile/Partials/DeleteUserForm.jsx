import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-5 ${className}`}>
            <header>
                <h2 className="text-xl font-extrabold text-gray-900">
                    Hapus Akun
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Setelah akun kamu dihapus, semua data dan informasi akan hilang secara permanen.
                    Harap pastikan Anda sudah menyimpan data penting sebelum melanjutkan.
                </p>
            </header>

            <DangerButton
                onClick={confirmUserDeletion}
                className="rounded-xl border border-[#b32d3f] bg-[#d92d4d] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_18px_rgba(217,45,77,0.18)] hover:bg-[#c72845] focus:bg-[#c72845]"
            >
                Hapus Akun
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900">
                        Apakah Anda yakin ingin menghapus akun?
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Setelah akun dihapus, semua data dan sumber daya akan terhapus permanen.
                        Mohon masukkan password Anda untuk konfirmasi akhir.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-[#e7d7c6] bg-[#fffaf7] px-3 py-2.5 text-sm shadow-sm focus:border-[#7d0f2e] focus:ring-[#f0bfd0]"
                            isFocused
                            placeholder="Password"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} className="rounded-xl border border-[#ddd0c2] bg-[#f9f5f0] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-700 hover:bg-[#f1eae1]">
                            Batal
                        </SecondaryButton>

                        <DangerButton className="rounded-xl bg-[#d92d4d] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#c72845]" disabled={processing}>
                            Hapus Akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
