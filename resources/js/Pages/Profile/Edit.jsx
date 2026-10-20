import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <MarketplaceLayout title="Kelola Akun">
            <Head title="Kelola Akun" />

            <div className="bg-[#fffaf7] py-8 sm:py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-[28px] border border-[#e7d7c6] bg-white p-5 shadow-[0_10px_25px_rgba(74,7,28,0.04)] sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="mx-auto max-w-2xl"
                        />
                    </div>

                    <div className="rounded-[28px] border border-[#e7d7c6] bg-white p-5 shadow-[0_10px_25px_rgba(74,7,28,0.04)] sm:p-8">
                        <UpdatePasswordForm className="mx-auto max-w-2xl" />
                    </div>

                    <div className="rounded-[28px] border border-[#e7d7c6] bg-white p-5 shadow-[0_10px_25px_rgba(74,7,28,0.04)] sm:p-8">
                        <DeleteUserForm className="mx-auto max-w-2xl" />
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
