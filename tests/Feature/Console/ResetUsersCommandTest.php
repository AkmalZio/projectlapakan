<?php

namespace Tests\Feature\Console;

use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\DessertMarketplaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ResetUsersCommandTest extends TestCase
{
    use RefreshDatabase;

    private string $publicPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->publicPath = storage_path('framework/testing/public-'.uniqid());
        File::ensureDirectoryExists($this->publicPath.'/assets/images');
        $this->app->usePublicPath($this->publicPath);
        Storage::fake('local');
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->publicPath);

        parent::tearDown();
    }

    public function test_default_mode_restores_changed_demo_accounts_and_keeps_other_users(): void
    {
        $this->seed(DessertMarketplaceSeeder::class);
        User::where('email', 'baker@lapakan.com')->firstOrFail()->forceFill(['password' => 'diganti-teman', 'role' => 'customer'])->save();
        $otherUser = User::factory()->create();

        $this->artisan('lapakan:reset-users')->assertSuccessful();

        $baker = User::where('email', 'baker@lapakan.com')->firstOrFail();
        $this->assertTrue(Hash::check('password', $baker->password));
        $this->assertSame('merchant', $baker->role);
        $this->assertModelExists($otherUser);
    }

    public function test_default_mode_gives_the_demo_store_back_when_the_merchant_email_was_changed(): void
    {
        $this->seed(DessertMarketplaceSeeder::class);
        User::where('email', 'baker@lapakan.com')->update(['email' => 'baker-diganti@lapakan.com']);

        $this->artisan('lapakan:reset-users')->assertSuccessful();

        $this->assertSame(
            'baker@lapakan.com',
            Store::where('slug', 'lapakan-artisan-bakery')->firstOrFail()->user->email,
        );
    }

    public function test_demo_accounts_can_log_in_after_a_reset(): void
    {
        $this->artisan('lapakan:reset-users')->assertSuccessful();

        $this->post('/login', ['email' => 'pembeli@lapakan.com', 'password' => 'password'])
            ->assertRedirect();

        $this->assertAuthenticatedAs(User::where('email', 'pembeli@lapakan.com')->firstOrFail());

        $this->post('/logout')->assertRedirect('/');

        $this->post('/login', ['email' => 'pembeli2@lapakan.com', 'password' => 'password'])
            ->assertRedirect();

        $this->assertAuthenticatedAs(User::where('email', 'pembeli2@lapakan.com')->firstOrFail());
    }

    public function test_fresh_mode_wipes_all_users_with_their_data_and_reseeds_the_demo(): void
    {
        $this->seed(DessertMarketplaceSeeder::class);
        $buyer = User::factory()->create();
        $order = $this->createOrderFor($buyer);
        File::put($this->publicPath.'/assets/images/upload-penjual.png', 'img');
        File::put($this->publicPath.'/assets/images/.gitkeep', '');
        Storage::disk('local')->put('payment-proofs/bukti.png', 'img');

        $this->artisan('lapakan:reset-users', ['--fresh' => true, '--force' => true])->assertSuccessful();

        $this->assertModelMissing($buyer);
        $this->assertModelMissing($order);
        $this->assertSame(
            ['admin@lapakan.com', 'baker@lapakan.com', 'pembeli2@lapakan.com', 'pembeli@lapakan.com'],
            User::orderBy('email')->pluck('email')->all(),
        );
        $this->assertTrue(Store::where('slug', 'lapakan-artisan-bakery')->firstOrFail()->user->is(User::where('email', 'baker@lapakan.com')->first()));
        $this->assertGreaterThan(0, Product::count());
        $this->assertFileDoesNotExist($this->publicPath.'/assets/images/upload-penjual.png');
        $this->assertFileExists($this->publicPath.'/assets/images/.gitkeep');
        Storage::disk('local')->assertMissing('payment-proofs/bukti.png');
    }

    public function test_fresh_mode_changes_nothing_when_the_confirmation_is_declined(): void
    {
        $user = User::factory()->create();

        $this->artisan('lapakan:reset-users', ['--fresh' => true])
            ->expectsConfirmation('Ini akan MENGHAPUS semua user, toko, produk, dan pesanan. Lanjutkan?', 'no')
            ->assertFailed();

        $this->assertModelExists($user);
    }

    public function test_it_refuses_to_run_in_production_without_force(): void
    {
        $this->app->detectEnvironment(fn (): string => 'production');
        $user = User::factory()->create();

        $this->artisan('lapakan:reset-users', ['--fresh' => true])->assertFailed();

        $this->assertModelExists($user);
    }

    private function createOrderFor(User $buyer): Order
    {
        $store = Store::firstOrFail();

        return Order::create([
            'order_number' => 'LPK-RESET-001',
            'user_id' => $buyer->id,
            'store_id' => $store->id,
            'total_amount' => 100000,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'recipient_name' => $buyer->name,
            'recipient_phone' => '0812',
            'delivery_address' => 'Jl. Uji',
        ]);
    }
}
