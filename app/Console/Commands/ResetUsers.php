<?php

namespace App\Console\Commands;

use App\Models\Store;
use App\Models\User;
use Database\Seeders\DemoUserSeeder;
use Database\Seeders\DessertMarketplaceSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

#[Signature('lapakan:reset-users
    {--fresh : Hapus SEMUA user beserta toko, produk, pesanan, ulasan, dan favorit, lalu isi ulang data demo}
    {--force : Jalankan tanpa konfirmasi (wajib di environment production)}')]
#[Description('Pulihkan akun demo LAPAKan, atau kosongkan tabel users dan isi ulang dengan --fresh')]
class ResetUsers extends Command
{
    /**
     * Tables emptied by --fresh, children before parents so foreign keys never block a delete.
     *
     * @var list<string>
     */
    private const FRESH_TABLES = [
        'reviews',
        'favorites',
        'order_items',
        'orders',
        'product_variants',
        'products',
        'stores',
        'sessions',
        'password_reset_tokens',
        'users',
    ];

    public function handle(): int
    {
        $isFresh = (bool) $this->option('fresh');

        if (! $this->confirmToProceed($isFresh)) {
            $this->warn('Dibatalkan. Tidak ada data yang diubah.');

            return self::FAILURE;
        }

        if ($isFresh) {
            $this->wipeUserData();
            $this->call('db:seed', ['--class' => DessertMarketplaceSeeder::class, '--force' => true]);
            $this->info('Tabel users dikosongkan dan diisi ulang dengan data demo.');
        } else {
            $this->call('db:seed', ['--class' => DemoUserSeeder::class, '--force' => true]);
            $this->relinkDemoStore();
            $this->info('Akun demo dipulihkan. User lain dan datanya tidak diubah.');
        }

        $this->table(
            ['Email', 'Password', 'Role'],
            array_map(fn (array $account): array => [$account['email'], DemoUserSeeder::PASSWORD, $account['role']], DemoUserSeeder::ACCOUNTS),
        );

        return self::SUCCESS;
    }

    private function confirmToProceed(bool $isFresh): bool
    {
        if ($this->option('force')) {
            return true;
        }

        if ($this->laravel->isProduction()) {
            $this->error('Environment production: tambahkan --force jika benar-benar ingin menjalankan perintah ini.');

            return false;
        }

        if (! $isFresh) {
            return true;
        }

        return $this->confirm('Ini akan MENGHAPUS semua user, toko, produk, dan pesanan. Lanjutkan?', false);
    }

    /**
     * Give the demo bakery back to the demo merchant, in case its email was changed and the account recreated.
     */
    private function relinkDemoStore(): void
    {
        $merchant = User::where('email', 'baker@lapakan.com')->first();

        if ($merchant) {
            Store::where('slug', 'lapakan-artisan-bakery')->update(['user_id' => $merchant->id]);
        }
    }

    /**
     * Delete every user together with the data that belongs to users, plus their uploaded files.
     * Categories are kept because they are shared reference data.
     */
    private function wipeUserData(): void
    {
        DB::transaction(function (): void {
            foreach (self::FRESH_TABLES as $table) {
                DB::table($table)->delete();
            }
        });

        Storage::disk('local')->deleteDirectory('payment-proofs');

        foreach (File::files(public_path('assets/images')) as $file) {
            if ($file->getFilename() !== '.gitkeep') {
                File::delete($file->getPathname());
            }
        }
    }
}
