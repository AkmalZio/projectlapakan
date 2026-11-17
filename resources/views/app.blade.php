<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'LAPAKan') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700,800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        @if (app()->isLocal())
            {{-- Local-only safety net: explain a blank page instead of leaving the screen white when the JS bundle never loads. --}}
            <template id="asset-load-help">
                <div style="max-width:560px;margin:64px auto;padding:24px;border:1px solid #f1c4cf;border-radius:16px;background:#fff7f9;font-family:system-ui,sans-serif;color:#3d1725;line-height:1.6">
                    <h1 style="margin:0 0 8px;font-size:20px">Tampilan LAPAKan gagal dimuat</h1>
                    @if (file_exists(public_path('hot')))
                        <p style="margin:0 0 12px">File <code>public/hot</code> ada, jadi aplikasi mengambil tampilan dari Vite dev server ({{ trim((string) @file_get_contents(public_path('hot'))) }}), tetapi server itu tidak merespons.</p>
                        <p style="margin:0">Pilih salah satu:</p>
                        <ol style="margin:4px 0 0;padding-left:20px">
                            <li>Jalankan <code>npm run dev</code> (atau <code>composer run dev</code>) dan biarkan tetap terbuka, lalu muat ulang halaman.</li>
                            <li>Atau hapus file <code>public/hot</code>, jalankan <code>npm run build</code>, lalu muat ulang halaman.</li>
                        </ol>
                    @else
                        <p style="margin:0">Jalankan <code>npm install</code> lalu <code>npm run build</code>, kemudian muat ulang halaman. Jika masih kosong, buka DevTools (F12) &rarr; tab Console untuk melihat errornya.</p>
                    @endif
                </div>
            </template>
            <script>
                setTimeout(function () {
                    var app = document.getElementById('app');
                    var help = document.getElementById('asset-load-help');
                    if (app && help && app.childElementCount === 0) {
                        app.appendChild(help.content.cloneNode(true));
                    }
                }, 5000);
            </script>
        @endif
    </body>
</html>
