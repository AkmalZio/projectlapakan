<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '081234567890',
                'address' => 'Jl. Merdeka No. 123, Jakarta',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertSame('081234567890', $user->phone);
        $this->assertSame('Jl. Merdeka No. 123, Jakarta', $user->address);
        $this->assertNull($user->email_verified_at);
    }

    public function test_profile_rejects_a_phone_number_with_letters(): void
    {
        $user = User::factory()->create(['phone' => '081200000000']);

        $this->actingAs($user)
            ->patch('/profile', ['name' => $user->name, 'email' => $user->email, 'phone' => '0812-ABC'])
            ->assertSessionHasErrors(['phone' => 'Nomor telepon hanya boleh berisi angka (boleh diawali +), 8 sampai 20 digit.']);

        $this->assertSame('081200000000', $user->fresh()->phone);
    }

    public function test_seller_whose_store_has_orders_cannot_delete_the_account(): void
    {
        $seller = User::factory()->create(['role' => 'merchant']);
        $order = $this->createOrder(User::factory()->create(), $seller->ownedStore(), 'completed');

        $this->actingAs($seller)
            ->from('/profile')
            ->delete('/profile', ['password' => 'password'])
            ->assertSessionHasErrors(['password' => 'Akun tidak dapat dihapus karena toko Anda sudah memiliki pesanan. Riwayat pesanan pembeli harus tetap tersimpan. Hubungi admin LAPAKan untuk menutup toko.'])
            ->assertRedirect('/profile');

        $this->assertModelExists($seller);
        $this->assertModelExists($order);
    }

    public function test_buyer_with_an_unfinished_order_cannot_delete_the_account(): void
    {
        $buyer = User::factory()->create();
        $this->createOrder($buyer, User::factory()->create(['role' => 'merchant'])->ownedStore(), 'baking');

        $this->actingAs($buyer)
            ->delete('/profile', ['password' => 'password'])
            ->assertSessionHasErrors(['password' => 'Akun tidak dapat dihapus karena masih ada pesanan yang belum selesai. Tunggu hingga semua pesanan selesai atau dibatalkan.']);

        $this->assertModelExists($buyer);
    }

    public function test_deleting_a_buyer_account_keeps_its_finished_orders_for_the_store(): void
    {
        $buyer = User::factory()->create();
        $order = $this->createOrder($buyer, User::factory()->create(['role' => 'merchant'])->ownedStore(), 'completed');

        $this->actingAs($buyer)
            ->delete('/profile', ['password' => 'password'])
            ->assertSessionHasNoErrors();

        $this->assertModelMissing($buyer);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'user_id' => null]);
        $this->assertDatabaseCount('order_items', 1);
    }

    private function createOrder(User $buyer, Store $store, string $status): Order
    {
        $category = Category::firstOrCreate(['slug' => 'kue'], ['name' => 'Kue', 'order_index' => 1, 'is_active' => true]);
        $product = $store->products()->create([
            'category_id' => $category->id,
            'name' => 'Bolu Pandan',
            'slug' => 'bolu-pandan-'.$store->id,
            'base_price' => 75000,
            'is_active' => true,
        ]);
        $order = Order::create([
            'order_number' => 'LPK-'.fake()->unique()->numerify('########'),
            'user_id' => $buyer->id,
            'store_id' => $store->id,
            'total_amount' => 75000,
            'status' => $status,
            'payment_status' => 'paid',
            'recipient_name' => 'Penerima',
            'recipient_phone' => '081234567890',
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 75000,
            'quantity' => 1,
            'subtotal' => 75000,
        ]);

        return $order;
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
