<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SellerRegistrationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        abort_unless($user instanceof User && $user->isCustomer(), 403);

        DB::transaction(function () use ($user, $validated): void {
            $store = $user->store()->firstOrNew([]);
            $store->fill([
                'name' => $validated['store_name'],
                'slug' => $store->exists
                    ? $store->slug
                    : ((Str::slug($validated['store_name']) ?: 'store').'-'.$user->id),
                'description' => $validated['description'] ?? null,
                'phone' => $validated['phone'],
                'city' => $validated['city'],
                'is_open' => true,
            ]);
            $store->save();

            $user->update(['role' => 'merchant']);
        });

        return redirect()->route('seller.dashboard');
    }
}
