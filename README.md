# LAPAKan

Marketplace kue & dessert: penjual membuka toko dan mengunggah produk, pembeli checkout dengan transfer manual, penjual memverifikasi pembayaran dan memproses pesanan dari Seller Center.

Stack: Laravel 13 (PHP 8.3), Inertia v2 + React, Tailwind, MySQL (Laragon) atau SQLite.

## Setup pertama kali

```bash
composer setup
```

Perintah itu menjalankan: `composer install`, salin `.env.example` ke `.env`, `key:generate`, `migrate`, `db:seed` (akun demo + katalog), `npm install`, dan `npm run build`.

Memakai MySQL Laragon? Ubah dulu di `.env` sebelum `composer setup`:

```dotenv
DB_CONNECTION=mysql
DB_DATABASE=lapakan
DB_USERNAME=root
DB_PASSWORD=
```

Lalu buat database `lapakan` di HeidiSQL/phpMyAdmin.

## Menjalankan

Pilih **salah satu**:

| Cara | Perintah | Catatan |
| --- | --- | --- |
| Pakai hasil build | `npm run build` lalu `php artisan serve` (atau buka lewat domain Laragon) | Ulangi `npm run build` setiap kali ada perubahan file JS/CSS. |
| Mode development | `composer run dev` | Jalankan server, queue, dan Vite sekaligus. **Biarkan terminalnya tetap terbuka.** |

Setelah `git pull`, jalankan juga:

```bash
composer install
npm install
php artisan migrate
php artisan config:clear
```

## Akun demo

| Email | Password | Role |
| --- | --- | --- |
| admin@lapakan.com | password | admin |
| baker@lapakan.com | password | merchant (penjual) |
| pembeli@lapakan.com | password | customer (pembeli) |

Akun demo dipakai bersama. **Jangan ganti password/email-nya** lewat halaman Profil, dan jangan klik "Mulai Jualan" dengan akun pembeli demo. Pakai akun daftar sendiri untuk mencoba fitur itu.

## Gagal login / data user berubah

Pulihkan akun demo tanpa menghapus data lain:

```bash
php artisan lapakan:reset-users
```

Kosongkan **semua** user (beserta toko, produk, pesanan, ulasan, favorit, dan file upload), lalu isi ulang data demo:

```bash
php artisan lapakan:reset-users --fresh
```

Masih ditolak setelah reset? Login dikunci 1 menit setelah 5 kali salah password. Tunggu sebentar lalu coba lagi.

## Layar putih

Hampir selalu karena file `public/hot` tertinggal: dulu `npm run dev` pernah dijalankan lalu dihentikan, sehingga browser terus mencari Vite dev server yang sudah mati. Di environment local, halaman akan menampilkan petunjuk ini setelah 5 detik.

Solusinya pilih salah satu:

- Jalankan lagi `npm run dev` (atau `composer run dev`) dan biarkan tetap terbuka.
- Atau hapus `public/hot`, lalu `npm run build`.

Kalau muncul error `ViteManifestNotFoundException`, jalankan `npm install` lalu `npm run build`.

## Fitur yang butuh proses tambahan

Pesanan yang belum dibayar dibatalkan otomatis setelah 24 jam, tapi hanya jika scheduler berjalan:

```bash
php artisan schedule:work
```

## Tes

```bash
php artisan test --compact
```
