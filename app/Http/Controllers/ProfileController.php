<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        $this->ensureAccountCanBeDeleted($user);

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Protect order history before an account is deleted.
     *
     * A seller whose store already received orders cannot delete the account, because the store
     * (and the buyers' orders with it) must stay. A buyer must wait until every order is completed
     * or cancelled; afterwards their orders stay with the store with the buyer link removed.
     *
     * @throws ValidationException
     */
    private function ensureAccountCanBeDeleted(User $user): void
    {
        if ($user->store()->whereHas('orders')->exists()) {
            throw ValidationException::withMessages([
                'password' => 'Akun tidak dapat dihapus karena toko Anda sudah memiliki pesanan. Riwayat pesanan pembeli harus tetap tersimpan. Hubungi admin LAPAKan untuk menutup toko.',
            ]);
        }

        if ($user->orders()->whereNotIn('status', Order::FINAL_STATUSES)->exists()) {
            throw ValidationException::withMessages([
                'password' => 'Akun tidak dapat dihapus karena masih ada pesanan yang belum selesai. Tunggu hingga semua pesanan selesai atau dibatalkan.',
            ]);
        }
    }
}
