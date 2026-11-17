<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_missing_page_shows_the_branded_indonesian_404_page(): void
    {
        $this->get('/halaman-yang-tidak-ada')
            ->assertNotFound()
            ->assertSee('Halaman Tidak Ditemukan')
            ->assertSee('Kembali ke Beranda');
    }

    public function test_forbidden_page_shows_the_reason_in_indonesian(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'customer']))
            ->get(route('admin.dashboard'))
            ->assertForbidden()
            ->assertSee('Akses Ditolak')
            ->assertSee('Anda tidak memiliki akses ke halaman ini.');
    }
}
