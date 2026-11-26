<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * Order statuses in the order a seller moves through them.
     *
     * @var list<string>
     */
    public const STATUSES = ['pending', 'confirmed', 'baking', 'delivering', 'completed', 'cancelled'];

    /**
     * Statuses after which the order can no longer be changed.
     *
     * @var list<string>
     */
    public const FINAL_STATUSES = ['completed', 'cancelled'];

    /**
     * Statuses a seller may set while the payment has not been confirmed yet.
     *
     * @var list<string>
     */
    public const STATUSES_ALLOWED_BEFORE_PAYMENT = ['pending', 'cancelled'];

    /**
     * Payment statuses. New checkout orders are marked paid after the buyer confirms payment;
     * unpaid and pending_verification remain for orders from the previous manual payment flow.
     *
     * @var list<string>
     */
    public const PAYMENT_STATUSES = ['unpaid', 'pending_verification', 'paid', 'refunded'];

    /**
     * Hours allowed for legacy unpaid orders before automatic cancellation.
     */
    public const PAYMENT_WINDOW_HOURS = 24;

    protected $fillable = [
        'order_number',
        'user_id',
        'store_id',
        'total_amount',
        'shipping_cost',
        'status',
        'payment_status',
        'payment_method',
        'payment_proof',
        'payment_proof_uploaded_at',
        'payment_rejection_reason',
        'payment_due_at',
        'paid_at',
        'delivery_type',
        'delivery_courier',
        'delivery_date',
        'delivery_time_slot',
        'recipient_name',
        'recipient_phone',
        'delivery_address',
        'delivery_notes',
        'greeting_card_message',
        'candles_count',
    ];

    /**
     * The proof is stored on the private disk; its path is never sent to the browser.
     *
     * @var list<string>
     */
    protected $hidden = ['payment_proof'];

    /**
     * @var list<string>
     */
    protected $appends = ['has_payment_proof'];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'delivery_date' => 'date:Y-m-d',
            'candles_count' => 'integer',
            'payment_proof_uploaded_at' => 'datetime',
            'payment_due_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * @return Attribute<bool, never>
     */
    protected function hasPaymentProof(): Attribute
    {
        return Attribute::get(fn (): bool => filled($this->payment_proof));
    }

    public function hasFinalStatus(): bool
    {
        return in_array($this->status, self::FINAL_STATUSES, true);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Cancel the order: return the purchased stock and refund money that was (claimed to be) transferred.
     * An unpaid order stays unpaid. Call inside a transaction with the order locked and its items loaded.
     */
    public function cancel(): void
    {
        foreach ($this->items as $item) {
            if ($item->product_variant_id) {
                ProductVariant::whereKey($item->product_variant_id)->increment('stock', $item->quantity);
            } else {
                Product::whereKey($item->product_id)->increment('stock', $item->quantity);
            }
        }

        $this->update([
            'status' => 'cancelled',
            'payment_status' => in_array($this->payment_status, ['paid', 'pending_verification'], true)
                ? 'refunded'
                : $this->payment_status,
        ]);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
