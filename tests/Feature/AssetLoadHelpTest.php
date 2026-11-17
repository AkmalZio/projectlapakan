<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetLoadHelpTest extends TestCase
{
    use RefreshDatabase;

    public function test_local_pages_include_help_for_a_blank_screen(): void
    {
        $this->withoutVite();
        $this->app->detectEnvironment(fn (): string => 'local');

        $this->get('/')
            ->assertOk()
            ->assertSee('Tampilan LAPAKan gagal dimuat')
            ->assertSee('npm run build');
    }

    public function test_production_pages_do_not_include_the_developer_help(): void
    {
        $this->withoutVite();
        $this->app->detectEnvironment(fn (): string => 'production');

        $this->get('/')
            ->assertOk()
            ->assertDontSee('Tampilan LAPAKan gagal dimuat');
    }
}
