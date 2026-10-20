<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->string('status')->default('pending'); // pending, confirmed, baking, delivering, completed, cancelled
            $table->string('payment_status')->default('unpaid'); // unpaid, paid, refunded
            $table->string('payment_method')->nullable();
            $table->string('delivery_type')->default('delivery'); // delivery, pickup
            $table->date('delivery_date')->nullable();
            $table->string('delivery_time_slot')->nullable();
            $table->string('recipient_name');
            $table->string('recipient_phone');
            $table->text('delivery_address')->nullable();
            $table->text('delivery_notes')->nullable();
            $table->text('greeting_card_message')->nullable();
            $table->integer('candles_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
