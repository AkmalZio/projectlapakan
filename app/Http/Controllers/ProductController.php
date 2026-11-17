<?php

namespace App\Http\Controllers;

use App\Models\Product; // Panggil Model Database (Kepala Gudang)

class ProductController extends Controller
{
    public function index()
    {
        // 1. Manajer menarik seluruh data dari Gudang
        $products = Product::all();

        // 2. Manajer melempar paket data tersebut ke halaman 'katalog'
        return view('katalog', compact('products'));
    }
}
