<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title') - {{ config('app.name', 'LAPAKan') }}</title>
        <style>
            *, *::before, *::after { box-sizing: border-box; }
            body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px 16px;
                background: #efe5d1; color: #2d1a1f; font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
            .card { width: 100%; max-width: 480px; background: #f9f4ea; border: 1px solid #d7c7a2; border-radius: 28px;
                box-shadow: 0 18px 30px rgba(59, 20, 26, 0.08); overflow: hidden; text-align: center; }
            .brand { background: #7d0f2e; color: #fff; padding: 18px; font-size: 22px; font-weight: 900; letter-spacing: -0.02em; }
            .brand span { color: #f7d5df; }
            .body { padding: 32px 28px 36px; }
            .code { font-size: 56px; font-weight: 900; color: #7d0f2e; line-height: 1; margin: 0; }
            h1 { font-size: 22px; margin: 12px 0 8px; }
            p { font-size: 14px; line-height: 1.6; color: #67595d; margin: 0 0 24px; }
            .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
            a { display: inline-block; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; }
            .primary { background: #7d0f2e; color: #fff; }
            .primary:hover { background: #99183d; }
            .secondary { border: 1px solid #d7c7a2; color: #7d0f2e; background: #fff; }
        </style>
    </head>
    <body>
        <main class="card">
            <div class="brand">LAPAK<span>an</span></div>
            <div class="body">
                <p class="code">@yield('code')</p>
                <h1>@yield('title')</h1>
                <p>@yield('message')</p>
                <div class="actions">
                    <a class="primary" href="{{ url('/') }}">Kembali ke Beranda</a>
                    <a class="secondary" href="{{ url()->previous() }}">Halaman Sebelumnya</a>
                </div>
            </div>
        </main>
    </body>
</html>
