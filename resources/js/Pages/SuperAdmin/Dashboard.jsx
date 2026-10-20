import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Dashboard({ users = [], stats = {}, success }) {
    const updateRole = (userId, role) => {
        router.patch(route('superadmin.users.update-role', { user: userId }), {
            role,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Super Admin
                </h2>
            }
        >
            <Head title="Dashboard Super Admin" />

            {success && (
                <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm text-gray-500">Total User</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_users ?? 0}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm text-gray-500">Admin & Penjual</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_admins ?? 0}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm text-gray-500">Super Admin</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_super_admins ?? 0}</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <h3 className="mb-5 text-xl font-semibold text-gray-900">Kelola User & Role</h3>

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Nama</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <select
                                                value={user.role}
                                                onChange={(event) => updateRole(user.id, event.target.value)}
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#4a071c] focus:outline-none"
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="merchant">Merchant</option>
                                                <option value="admin">Admin</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
