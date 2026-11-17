<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Display timezone
    |--------------------------------------------------------------------------
    |
    | app.timezone stays UTC for storage. Dates the server formats for the UI
    | (such as the order list) are converted to this zone so they match WIB.
    |
    */

    'display_timezone' => env('LAPAKAN_DISPLAY_TIMEZONE', 'Asia/Jakarta'),

    /*
    |--------------------------------------------------------------------------
    | Platform contact details
    |--------------------------------------------------------------------------
    |
    | Shown in the storefront footer and used as the fallback WhatsApp contact.
    | Leave a value empty to hide it.
    |
    */

    'contact' => [
        'whatsapp' => env('LAPAKAN_WHATSAPP', '6281298765432'),
        'whatsapp_display' => env('LAPAKAN_WHATSAPP_DISPLAY', '+62 812-9876-5432'),
        'address' => env('LAPAKAN_ADDRESS', 'Gg. Olahraga No.20, Ciriung, Kec. Cibinong, Kabupaten Bogor, Jawa Barat 16918'),
        'opening_hours' => env('LAPAKAN_OPENING_HOURS', 'Buka Setiap Hari: 08:00 - 20:00 WIB'),
        'instagram_url' => env('LAPAKAN_INSTAGRAM_URL', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Manual transfer destinations
    |--------------------------------------------------------------------------
    |
    | Accounts the buyer transfers to before uploading a transfer proof.
    | The keys are the payment_method values accepted at checkout.
    |
    */

    'payment_accounts' => [
        'bca' => [
            'name' => 'Bank Central Asia (BCA)',
            'type' => 'Transfer Bank',
            'account' => env('LAPAKAN_BCA_ACCOUNT', '8830-1928-4412'),
            'holder' => env('LAPAKAN_ACCOUNT_HOLDER', 'PT LAPAKAN MANIS NUSANTARA'),
        ],
        'mandiri' => [
            'name' => 'Bank Mandiri',
            'type' => 'Transfer Bank',
            'account' => env('LAPAKAN_MANDIRI_ACCOUNT', '137-00-9988-1234'),
            'holder' => env('LAPAKAN_ACCOUNT_HOLDER', 'PT LAPAKAN MANIS NUSANTARA'),
        ],
        'bri' => [
            'name' => 'Bank Rakyat Indonesia (BRI)',
            'type' => 'Transfer Bank',
            'account' => env('LAPAKAN_BRI_ACCOUNT', '0206-01-002233-509'),
            'holder' => env('LAPAKAN_ACCOUNT_HOLDER', 'PT LAPAKAN MANIS NUSANTARA'),
        ],
        'qris' => [
            'name' => 'QRIS (GoPay, OVO, ShopeePay, DANA)',
            'type' => 'QRIS',
            'account' => env('LAPAKAN_QRIS_NMID', 'NMID: ID10200392810'),
            'holder' => env('LAPAKAN_QRIS_HOLDER', 'LAPAKAN BAKERY QRIS'),
        ],
    ],

];
