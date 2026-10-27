<?php

namespace Tests\Feature\Seller;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerRegistrationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_a_store_and_become_a_merchant(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
            'phone' => null,
        ]);

        $response = $this->actingAs($customer)->post(route('seller.register'), [
            'store_name' => 'Dapur Manis',
            'city' => 'Bandung',
            'phone' => '081234567890',
            'description' => 'Kue rumahan fresh setiap hari.',
        ]);

        $response->assertRedirect(route('seller.dashboard'));
        $this->assertDatabaseHas('users', [
            'id' => $customer->id,
            'role' => 'merchant',
        ]);
        $this->assertDatabaseHas('stores', [
            'user_id' => $customer->id,
            'name' => 'Dapur Manis',
            'slug' => 'dapur-manis-'.$customer->id,
            'city' => 'Bandung',
            'phone' => '081234567890',
            'description' => 'Kue rumahan fresh setiap hari.',
        ]);
    }

    public function test_customer_must_provide_required_store_details_to_register(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer)->from('/dashboard')->post(route('seller.register'), [
            'store_name' => '',
            'city' => '',
            'phone' => '',
        ]);

        $response->assertRedirect('/dashboard');
        $response->assertSessionHasErrors(['store_name', 'city', 'phone']);
        $this->assertDatabaseHas('users', [
            'id' => $customer->id,
            'role' => 'customer',
        ]);
        $this->assertDatabaseMissing('stores', ['user_id' => $customer->id]);
    }

    public function test_non_customers_cannot_register_as_a_seller(): void
    {
        $merchant = User::factory()->create(['role' => 'merchant']);

        $this->actingAs($merchant)
            ->post(route('seller.register'), [
                'store_name' => 'Toko Lain',
                'city' => 'Bandung',
                'phone' => '081234567890',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('users', [
            'id' => $merchant->id,
            'role' => 'merchant',
        ]);
        $this->assertDatabaseMissing('stores', ['name' => 'Toko Lain']);
    }

    public function test_guests_are_redirected_to_login_when_registering_as_a_seller(): void
    {
        $this->post(route('seller.register'), [
            'store_name' => 'Dapur Manis',
            'city' => 'Bandung',
            'phone' => '081234567890',
        ])->assertRedirect(route('login'));
    }

    public function test_existing_customer_store_is_reused(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $store = Store::create([
            'user_id' => $customer->id,
            'name' => 'Nama Lama',
            'slug' => 'nama-lama',
            'city' => 'Jakarta',
            'phone' => '081111111111',
        ]);

        $response = $this->actingAs($customer)->post(route('seller.register'), [
            'store_name' => 'Dapur Baru',
            'city' => 'Bandung',
            'phone' => '081234567890',
        ]);

        $response->assertRedirect(route('seller.dashboard'));
        $this->assertDatabaseCount('stores', 1);
        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'name' => 'Dapur Baru',
            'slug' => 'nama-lama',
            'city' => 'Bandung',
        ]);
    }
}
