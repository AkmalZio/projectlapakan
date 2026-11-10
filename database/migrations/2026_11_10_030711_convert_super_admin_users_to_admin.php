<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The super_admin role was removed, so its users keep access as admin.
     */
    public function up(): void
    {
        DB::table('users')->where('role', 'super_admin')->update(['role' => 'admin']);
    }

    public function down(): void
    {
        //
    }
};
