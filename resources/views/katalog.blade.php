<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Katalog LAPAKan</title>
</head>
<body style="padding: 20px; font-family: sans-serif; background-color: #f8f9fa;">

    <h2>Katalog Produk LAPAKan</h2>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">

        <!-- BUKA MESIN LOOPING BLADE SESUAI SYARAT LKPD -->
        @forelse ($products as $product)
            <div style="background-color: white; border: 1px solid #ccc; width: 250px; padding: 15px; border-radius: 8px;">

                @if($product->image)
                    <img src="{{ asset('assets/images/' . $product->image) }}" width="100%" style="border-radius: 5px;">
                @else
                    <div style="background:#eee; height:150px; text-align:center; line-height: 150px; border-radius: 5px;">Tanpa Gambar</div>
                @endif

                <h3 style="margin-top: 15px;">{{ $product->name }}</h3>
                <p style="color: red; font-weight: bold;">Rp {{ number_format($product->price, 0, ',', '.') }}</p>
                <a href="/detail" style="display: block; text-align: center; background-color: #0B5ED7; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">Lihat Detail</a>
            </div>

        <!-- Kalau DATABASE KOSONG (Syarat Uji Proteksi UX LKPD) -->
        @empty
            <div style="text-align: center; width: 100%; padding: 50px;">
                <h3 style="color: #383838;">Mohon maaf, produk belum tersedia di etalase kami.</h3>
            </div>
        @endforelse
        <!-- TUTUP MESIN LOOPING -->

    </div>

</body>
</html>