<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    /**
     * Slug of the pseudo category that the catalog uses as "show everything".
     * Products must never be filed under it.
     */
    public const CATALOG_ALL_SLUG = 'all-category';

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'image',
        'description',
        'order_index',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'order_index' => 'integer',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
