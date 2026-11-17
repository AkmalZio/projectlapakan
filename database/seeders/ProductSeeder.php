<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder; // [PENTING] Memanggil Kepala Gudang

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Menggunakan fitur Eloquent Create agar kolom created_at (timestamps) terisi otomatis
        Product::create([
            'name' => 'Sepatu Keren',
            'description' => 'Sepatu gaya kasual.',
            'price' => 150000,
            'image' => null,
        ]);

        Product::create([
            'name' => 'Jaket Premium',
            'description' => 'Jaket bahan tebal.',
            'price' => 200000,
            'image' => null,
        ]);

        Product::create([
            'name' => 'Tas Multifungsi',
            'description' => 'Tas ukuran besar.',
            'price' => 350000,
            'image' => null,
        ]);
    }
}
