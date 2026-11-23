<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Creates the shared demo accounts and rewrites them to a known state on every run,
 * so a teammate who changed a demo password, email or role can always restore it.
 */
class DemoUserSeeder extends Seeder
{
    public const PASSWORD = 'password';

    /**
     * @var list<array{email: string, name: string, role: string, phone: string, address: string|null}>
     */
    public const ACCOUNTS = [
        [
            'email' => 'admin@lapakan.com',
            'name' => 'Admin LAPAKan',
            'role' => 'admin',
            'phone' => '081234567890',
            'address' => null,
        ],
        [
            'email' => 'baker@lapakan.com',
            'name' => 'LAPAKan Artisan Bakery',
            'role' => 'merchant',
            'phone' => '081298765432',
            'address' => 'Jl. Boulevard Raya Blok M No. 18, Jakarta Selatan',
        ],
        [
            'email' => 'pembeli@lapakan.com',
            'name' => 'Pembeli Demo',
            'role' => 'customer',
            'phone' => '081311112222',
            'address' => 'Jl. Melati No. 5, Bandung',
        ],
    ];

    public function run(): void
    {
        foreach (self::ACCOUNTS as $account) {
            $user = User::firstOrNew(['email' => $account['email']]);

            $user->forceFill([
                'name' => $account['name'],
                'role' => $account['role'],
                'phone' => $account['phone'],
                'address' => $account['address'],
                'password' => self::PASSWORD,
                'email_verified_at' => now(),
                'remember_token' => null,
            ])->save();
        }
    }
}
