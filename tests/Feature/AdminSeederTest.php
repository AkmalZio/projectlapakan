<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_the_admin_account(): void
    {
        $this->seed(AdminSeeder::class);

        $this->assertTrue(User::where('email', 'admin@lapakan.com')->firstOrFail()->isAdmin());
    }

    public function test_it_can_run_twice_without_duplicating_accounts(): void
    {
        $this->seed(AdminSeeder::class);
        $this->seed(AdminSeeder::class);

        $this->assertSame(1, User::count());
    }
}
