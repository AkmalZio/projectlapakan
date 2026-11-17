<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stop deletes from cascading into order history.
 *
 * - orders.user_id: nullable + null on delete, so a buyer who deletes their account
 *   leaves the store's order history (recipient data is snapshotted on the order).
 * - orders.store_id, order_items.product_id, products.category_id: restrict, so a store,
 *   an ordered product or a used category can never silently take orders/products with it.
 * - reviews: one review per product per order.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['store_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('store_id')->references('id')->on('stores')->restrictOnDelete();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->restrictOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->unique(['order_id', 'product_id']);
        });
    }

    public function down(): void
    {
        // MySQL backs the order_id foreign key with the unique index, so the key is dropped first.
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique(['order_id', 'product_id']);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['store_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('store_id')->references('id')->on('stores')->cascadeOnDelete();
        });
    }
};
