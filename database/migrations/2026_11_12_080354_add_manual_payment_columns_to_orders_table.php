<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Columns for the manual bank-transfer flow: the buyer uploads a transfer proof,
 * the seller verifies it (paid) or rejects it with a reason.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_proof')->nullable()->after('payment_method');
            $table->timestamp('payment_proof_uploaded_at')->nullable()->after('payment_proof');
            $table->string('payment_rejection_reason')->nullable()->after('payment_proof_uploaded_at');
            $table->timestamp('payment_due_at')->nullable()->after('payment_rejection_reason');
            $table->timestamp('paid_at')->nullable()->after('payment_due_at');
            $table->index(['payment_status', 'payment_due_at']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['payment_status', 'payment_due_at']);
            $table->dropColumn(['payment_proof', 'payment_proof_uploaded_at', 'payment_rejection_reason', 'payment_due_at', 'paid_at']);
        });
    }
};
