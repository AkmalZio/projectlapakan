<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function index(): Response
    {
        $users = User::orderBy('role')->orderBy('name')->get();

        return Inertia::render('SuperAdmin/Dashboard', [
            'users' => $users,
            'stats' => [
                'total_users' => User::count(),
                'total_admins' => User::whereIn('role', ['admin', 'merchant'])->count(),
                'total_super_admins' => User::where('role', 'super_admin')->count(),
            ],
            'success' => session('success'),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['customer', 'merchant', 'admin', 'super_admin'])],
        ]);

        $user->update([
            'role' => $validated['role'],
        ]);

        return redirect()->route('superadmin.dashboard')->with('success', 'Role pengguna berhasil diperbarui.');
    }
}
