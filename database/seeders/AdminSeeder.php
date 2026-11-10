<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Seed the admin account.
     *
     * The password comes from ADMIN_PASSWORD, falling back to "password".
     */
    public function run(): void
    {
        $accounts = [
            [
                'email' => 'admin@lapakan.com',
                'name' => 'Admin LAPAKan',
                'role' => 'admin',
                'phone' => '081234567890',
                'password' => env('ADMIN_PASSWORD', 'password'),
            ],
        ];

        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                $account + ['email_verified_at' => now()],
            );
        }
    }
}
