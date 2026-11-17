<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The seeded Unsplash photo photo-1535141192574 was removed upstream (404).
 * Point every product and category that still uses it to a working photo.
 */
return new class extends Migration
{
    private const DEAD_PHOTO = 'photo-1535141192574-5d4897c13136';

    private const REPLACEMENT_PHOTO = 'photo-1621303837174-89787a7d4729';

    public function up(): void
    {
        $this->replace(self::DEAD_PHOTO, self::REPLACEMENT_PHOTO);
    }

    public function down(): void
    {
        // The old photo no longer exists, so there is nothing meaningful to restore.
    }

    private function replace(string $from, string $to): void
    {
        foreach (['products', 'categories'] as $table) {
            DB::table($table)
                ->where('image', 'like', '%'.$from.'%')
                ->update(['image' => DB::raw('REPLACE(image, '.DB::getPdo()->quote($from).', '.DB::getPdo()->quote($to).')')]);
        }

        DB::table('products')
            ->where('gallery', 'like', '%'.$from.'%')
            ->update(['gallery' => DB::raw('REPLACE(gallery, '.DB::getPdo()->quote($from).', '.DB::getPdo()->quote($to).')')]);
    }
};
