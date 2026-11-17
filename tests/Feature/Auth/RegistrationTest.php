<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_registration_returns_the_guest_to_the_page_that_required_login(): void
    {
        $this->from(route('cart.index'))->post('/checkout/start')->assertRedirect(route('login', absolute: false));

        $response = $this->post('/register', [
            'name' => 'Pembeli Baru',
            'email' => 'baru@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('cart.index'));
    }

    public function test_registration_errors_are_reported_in_indonesian(): void
    {
        User::factory()->create(['email' => 'terdaftar@example.com']);

        $response = $this->from('/register')->post('/register', [
            'name' => '',
            'email' => 'terdaftar@example.com',
            'password' => 'password',
            'password_confirmation' => 'berbeda',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors([
            'name' => 'Nama wajib diisi.',
            'email' => 'Email ini sudah terdaftar.',
            'password' => 'Konfirmasi kata sandi tidak cocok.',
        ]);
        $this->assertGuest();
    }
}
