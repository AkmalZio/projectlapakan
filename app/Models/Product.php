<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'category_id',
        'name',
        'slug',
        'description',
        'base_price',
        'image',
        'gallery',
        'shelf_life_days',
        'is_preorder',
        'preorder_days',
        'stock',
        'weight_grams',
        'is_featured',
        'is_active',
        'allows_custom_message',
        'includes_candles',
        'includes_knife',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'gallery' => 'array',
            'shelf_life_days' => 'integer',
            'is_preorder' => 'boolean',
            'preorder_days' => 'integer',
            'stock' => 'integer',
            'weight_grams' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'allows_custom_message' => 'boolean',
            'includes_candles' => 'boolean',
            'includes_knife' => 'boolean',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
