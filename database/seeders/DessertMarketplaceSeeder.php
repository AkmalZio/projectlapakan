<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DessertMarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Users
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@lapakan.com'],
            [
                'name' => 'Super Admin LAPAKan',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'phone' => '081200000001',
            ]
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@lapakan.com'],
            [
                'name' => 'Admin LAPAKan',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '081234567890',
            ]
        );

        $merchant = User::firstOrCreate(
            ['email' => 'baker@lapakan.com'],
            [
                'name' => 'LAPAKan Artisan Bakery',
                'password' => Hash::make('password'),
                'role' => 'merchant',
                'phone' => '081298765432',
            ]
        );

        // 2. Create Main Bakery Store
        $store = Store::firstOrCreate(
            ['slug' => 'lapakan-artisan-bakery'],
            [
                'user_id' => $merchant->id,
                'name' => 'LAPAKan Sweet Patisserie',
                'description' => 'Toko kue & dessert artisan spesialis fresh-baked cakes, pastries, dan custom birthday cakes dengan bahan premium impor.',
                'address' => 'Jl. Boulevard Raya Blok M No. 18, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'phone' => '081298765432',
                'instagram' => '@lapakan.id',
                'is_open' => true,
                'rating_avg' => 4.95,
            ]
        );

        // 3. Create Categories
        $categoriesData = [
            [
                'name' => 'All Category',
                'slug' => 'all-category',
                'icon' => 'Sparkles',
                'description' => 'Semua aneka kue dan sajian manis pilihan.',
                'order_index' => 1,
            ],
            [
                'name' => 'Bento Cake',
                'slug' => 'bento-cake',
                'icon' => 'Cake',
                'description' => 'Kue mini estetik ala Korea dengan lilin & sendok kayu gratis.',
                'order_index' => 2,
            ],
            [
                'name' => 'Whole & Celebration Cake',
                'slug' => 'celebration-cake',
                'icon' => 'PartyPopper',
                'description' => 'Kue perayaan ulang tahun, anniversary, dan pesta berukuran besar.',
                'order_index' => 3,
            ],
            [
                'name' => 'Cheesecake & Slice Cake',
                'slug' => 'cheesecake-slice',
                'icon' => 'PieChart',
                'description' => 'Potongan kue lembut dan aneka varian cheesecake lumer.',
                'order_index' => 4,
            ],
            [
                'name' => 'Pastries & Breads',
                'slug' => 'pastries-breads',
                'icon' => 'Croissant',
                'description' => 'Garlic bread, croissant, dan kudapan savory renyah.',
                'order_index' => 5,
            ],
            [
                'name' => 'Cookies & Brownies',
                'slug' => 'cookies-brownies',
                'icon' => 'Cookie',
                'description' => 'Aneka cookies renyah dan brownies fudgy.',
                'order_index' => 6,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 4. Products - sesuai Figma + tambahan
        $productsData = [

            /* ═══════════════════════════════════════
             *  CELEBRATION CAKES
             * ═══════════════════════════════════════ */
            [
                'name' => 'Chocolate Drip Cake',
                'slug' => 'chocolate-drip-cake',
                'category_slug' => 'celebration-cake',
                'description' => 'Kue cokelat istimewa 3 layer dilapisi dark chocolate ganache 70% dengan lelehan cokelat khas. Topping buah strawberry segar, macarons, dan choco shards renyah. Cocok untuk perayaan ulang tahun dan momen istimewa bersama keluarga.',
                'base_price' => 280000,
                'image' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 5,
                'is_preorder' => true,
                'preorder_days' => 1,
                'stock' => 12,
                'weight_grams' => 1200,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => true,
                'variants' => [
                    ['type' => 'size', 'name' => 'Diameter 16 cm (6-8 Porsi)', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Diameter 20 cm (10-14 Porsi)', 'additional_price' => 110000],
                    ['type' => 'size', 'name' => 'Diameter 24 cm (16-20 Porsi)', 'additional_price' => 220000],
                ],
            ],
            [
                'name' => 'Signature Red Velvet Cake',
                'slug' => 'signature-red-velvet-cake',
                'category_slug' => 'celebration-cake',
                'description' => 'Red velvet sponge cake klasik dengan butiran crumble renyah gurih dan cream cheese frosting impor yang lembut dan seimbang. Warna merah cerah yang cantik & instagramable.',
                'base_price' => 260000,
                'image' => 'https://images.unsplash.com/photo-1616031037011-087000171abe?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1616031037011-087000171abe?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 5,
                'is_preorder' => true,
                'preorder_days' => 1,
                'stock' => 10,
                'weight_grams' => 1100,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => true,
                'variants' => [
                    ['type' => 'size', 'name' => 'Diameter 16 cm', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Diameter 20 cm', 'additional_price' => 120000],
                ],
            ],
            [
                'name' => 'Triple Berry Chiffon Cake',
                'slug' => 'triple-berry-chiffon-cake',
                'category_slug' => 'celebration-cake',
                'description' => 'Chiffon cake lembut super-moist dengan isian mixed berry (strawberry, blueberry, raspberry), lapisan chantilly cream murni dan topping buah segar yang berlimpah. Ringan dan tidak terlalu manis, cocok untuk semua usia.',
                'base_price' => 320000,
                'image' => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 3,
                'is_preorder' => true,
                'preorder_days' => 2,
                'stock' => 8,
                'weight_grams' => 1400,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => true,
                'variants' => [
                    ['type' => 'size', 'name' => 'Diameter 18 cm (8-10 Porsi)', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Diameter 22 cm (12-15 Porsi)', 'additional_price' => 130000],
                ],
            ],
            [
                'name' => 'Matcha White Chocolate Layer Cake',
                'slug' => 'matcha-white-choco-layer-cake',
                'category_slug' => 'celebration-cake',
                'description' => 'Tiga layer sponge cake matcha Uji grade-1 premium dipadukan krim putih mewah white chocolate mousse. Topping bubuk matcha dan shards cokelat putih, elegan dan ikonik.',
                'base_price' => 305000,
                'image' => 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 4,
                'is_preorder' => true,
                'preorder_days' => 2,
                'stock' => 8,
                'weight_grams' => 1300,
                'is_featured' => false,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => true,
                'variants' => [
                    ['type' => 'size', 'name' => 'Diameter 16 cm', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Diameter 20 cm', 'additional_price' => 115000],
                ],
            ],

            /* ═══════════════════════════════════════
             *  BENTO CAKES
             * ═══════════════════════════════════════ */
            [
                'name' => 'Korean Minimalist Bento Cake',
                'slug' => 'korean-minimalist-bento-cake',
                'category_slug' => 'bento-cake',
                'description' => 'Bento cake mini diameter 10cm gaya aesthetic Korea. Bisa request tulisan ucapan custom di atas kue. Dilengkapi lilin aesthetic dan sendok kayu ramah lingkungan. Tersedia berbagai pilihan base rasa.',
                'base_price' => 75000,
                'image' => 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 4,
                'is_preorder' => true,
                'preorder_days' => 1,
                'stock' => 18,
                'weight_grams' => 300,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'flavor', 'name' => 'Vanilla Raspberry', 'additional_price' => 0],
                    ['type' => 'flavor', 'name' => 'Belgian Dark Choco', 'additional_price' => 5000],
                    ['type' => 'flavor', 'name' => 'Matcha Cream Cheese', 'additional_price' => 10000],
                    ['type' => 'flavor', 'name' => 'Taro Milk Tea', 'additional_price' => 10000],
                ],
            ],
            [
                'name' => 'Floral Bento Cake',
                'slug' => 'floral-bento-cake',
                'category_slug' => 'bento-cake',
                'description' => 'Bento cake cantik dengan dekorasi bunga-bunga edible yang dibuat tangan oleh pastry artist kami. Cocok untuk hadiah ulang tahun, wisuda, atau anniversary. Tersedia warna pastel custom sesuai request.',
                'base_price' => 95000,
                'image' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 3,
                'is_preorder' => true,
                'preorder_days' => 1,
                'stock' => 15,
                'weight_grams' => 320,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'flavor', 'name' => 'Strawberry Cream', 'additional_price' => 0],
                    ['type' => 'flavor', 'name' => 'Lychee Rose', 'additional_price' => 10000],
                    ['type' => 'flavor', 'name' => 'Blueberry Cream Cheese', 'additional_price' => 10000],
                ],
            ],
            [
                'name' => 'Birthday Number Bento Cake',
                'slug' => 'birthday-number-bento-cake',
                'category_slug' => 'bento-cake',
                'description' => 'Bento cake lucu dengan angka usia yang bisa dikustom. Pilihan angka 1-99, tersedia berbagai warna sprinkle dan lilin sesuai tema perayaan.',
                'base_price' => 85000,
                'image' => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 3,
                'is_preorder' => true,
                'preorder_days' => 1,
                'stock' => 20,
                'weight_grams' => 310,
                'is_featured' => false,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'flavor', 'name' => 'Choco Hazelnut', 'additional_price' => 0],
                    ['type' => 'flavor', 'name' => 'Vanilla Oreo', 'additional_price' => 5000],
                ],
            ],

            /* ═══════════════════════════════════════
             *  CHEESECAKES & SLICE CAKES
             * ═══════════════════════════════════════ */
            [
                'name' => 'Basque Burnt Cheesecake',
                'slug' => 'basque-burnt-cheesecake',
                'category_slug' => 'cheesecake-slice',
                'description' => 'Cheesecake panggang khas Basque Spanyol dengan permukaan terkaramelisasi aromatik dan bagian tengah yang lembut lumer (custard-like center). Menggunakan cream cheese Philadelphia asli dan fresh cream premium.',
                'base_price' => 210000,
                'image' => 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 4,
                'is_preorder' => false,
                'preorder_days' => 0,
                'stock' => 15,
                'weight_grams' => 800,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => true,
                'variants' => [
                    ['type' => 'size', 'name' => 'Whole Cake 18 cm', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Slice (1 Potong)', 'additional_price' => -160000],
                ],
            ],
            [
                'name' => 'Strawberry Cheesecake',
                'slug' => 'strawberry-cheesecake',
                'category_slug' => 'cheesecake-slice',
                'description' => 'New York style cheesecake yang creamy dipadukan dengan selai strawberry murni bertekstur asam manis segar dan remah crust mentega graham cracker gurih. Cantik dan menggugah selera.',
                'base_price' => 240000,
                'image' => 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 5,
                'is_preorder' => true,
                'preorder_days' => 1,
                'stock' => 10,
                'weight_grams' => 900,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => true,
                'includes_knife' => true,
                'variants' => [
                    ['type' => 'size', 'name' => 'Whole Cake 18 cm', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Slice Cake (1 Potong)', 'additional_price' => -190000],
                ],
            ],
            [
                'name' => 'Chocolate Slice Cake',
                'slug' => 'chocolate-slice-cake',
                'category_slug' => 'cheesecake-slice',
                'description' => 'Satu potong kenikmatan chocolate fudge cake berlapis cream ganache lembut yang lumer di mulut. Praktis untuk teman ngopi atau camilan sore hari.',
                'base_price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 3,
                'is_preorder' => false,
                'preorder_days' => 0,
                'stock' => 25,
                'weight_grams' => 150,
                'is_featured' => true,
                'allows_custom_message' => false,
                'includes_candles' => false,
                'includes_knife' => false,
                'variants' => [],
            ],
            [
                'name' => 'Caramel Salted Tart',
                'slug' => 'caramel-salted-tart',
                'category_slug' => 'cheesecake-slice',
                'description' => 'Tart keju with caramel cokelat hitam dan taburan sea salt Maldon. Perpaduan manis-asin yang adiktif dengan shortcrust pastry yang renyah homemade.',
                'base_price' => 52000,
                'image' => 'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 4,
                'is_preorder' => false,
                'preorder_days' => 0,
                'stock' => 20,
                'weight_grams' => 130,
                'is_featured' => false,
                'allows_custom_message' => false,
                'includes_candles' => false,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'pack', 'name' => '1 Pcs', 'additional_price' => 0],
                    ['type' => 'pack', 'name' => 'Box Isi 4 Pcs', 'additional_price' => 145000],
                ],
            ],

            /* ═══════════════════════════════════════
             *  PASTRIES & BREADS
             * ═══════════════════════════════════════ */
            [
                'name' => 'Korean Garlic Cheese Bread',
                'slug' => 'korean-garlic-cheese-bread',
                'category_slug' => 'pastries-breads',
                'description' => 'Roti bun bertekstur empuk diisi cream cheese manis gurih, dicelup ke dalam racikan butter garlic daun peterseli dan dipanggang hingga wangi renyah. Viral dan selalu habis setiap harinya!',
                'base_price' => 38000,
                'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 2,
                'is_preorder' => false,
                'preorder_days' => 0,
                'stock' => 30,
                'weight_grams' => 120,
                'is_featured' => true,
                'allows_custom_message' => false,
                'includes_candles' => false,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'pack', 'name' => '1 Pcs Satuan', 'additional_price' => 0],
                    ['type' => 'pack', 'name' => 'Box Isi 3 Pcs', 'additional_price' => 70000],
                    ['type' => 'pack', 'name' => 'Box Isi 6 Pcs', 'additional_price' => 155000],
                ],
            ],
            [
                'name' => 'Butter Croissant',
                'slug' => 'butter-croissant',
                'category_slug' => 'pastries-breads',
                'description' => 'Croissant laminated homemade dengan 27 lapisan menggunakan butter AOP Président impor. Tekstur flaky dan renyah di luar, lembut dan buttery di dalam. Dibuat fresh setiap pagi.',
                'base_price' => 28000,
                'image' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 1,
                'is_preorder' => false,
                'preorder_days' => 0,
                'stock' => 40,
                'weight_grams' => 85,
                'is_featured' => false,
                'allows_custom_message' => false,
                'includes_candles' => false,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'flavor', 'name' => 'Plain Butter', 'additional_price' => 0],
                    ['type' => 'flavor', 'name' => 'Almond Croissant', 'additional_price' => 8000],
                    ['type' => 'flavor', 'name' => 'Chocolate Croissant', 'additional_price' => 7000],
                ],
            ],
            [
                'name' => 'Cinnamon Roll',
                'slug' => 'cinnamon-roll',
                'category_slug' => 'pastries-breads',
                'description' => 'Cinnamon roll lembut dengan spiral kayu manis Sri Lanka pilihan, glazed dengan cream cheese frosting yang melimpah. Best seller! Warm & comfort food pilihan pelanggan setia kami.',
                'base_price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 2,
                'is_preorder' => false,
                'preorder_days' => 0,
                'stock' => 25,
                'weight_grams' => 160,
                'is_featured' => false,
                'allows_custom_message' => false,
                'includes_candles' => false,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'pack', 'name' => '1 Pcs', 'additional_price' => 0],
                    ['type' => 'pack', 'name' => 'Box Isi 4 Pcs', 'additional_price' => 110000],
                ],
            ],

            /* ═══════════════════════════════════════
             *  COOKIES & BROWNIES
             * ═══════════════════════════════════════ */
            [
                'name' => 'Fudgy Shiny Crust Brownies',
                'slug' => 'fudgy-shiny-crust-brownies',
                'category_slug' => 'cookies-brownies',
                'description' => 'Brownies panggang dengan kerak renyah mengkilap (shiny crust) dan bagian dalam padat lumer (fudgy), bertabur choco chip, almond, dan sea salt Maldon. Menggunakan dark chocolate Valrhona 66%.',
                'base_price' => 85000,
                'image' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 10,
                'is_preorder' => false,
                'preorder_days' => 0,
                'stock' => 20,
                'weight_grams' => 400,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => false,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'size', 'name' => 'Ukuran 20x10 cm', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Ukuran 20x20 cm (Besar)', 'additional_price' => 75000],
                ],
            ],
            [
                'name' => 'New York Chunky Cookies',
                'slug' => 'new-york-chunky-cookies',
                'category_slug' => 'cookies-brownies',
                'description' => 'Cookies gaya New York bakery — tebal, chewy di dalam dan crispy di luar. Loaded dengan dark & milk chocolate chunks impor berkualitas premium. Baked fresh dan dikirim di hari yang sama.',
                'base_price' => 22000,
                'image' => 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 7,
                'is_preorder' => false,
                'preorder_days' => 0,
                'stock' => 50,
                'weight_grams' => 100,
                'is_featured' => false,
                'allows_custom_message' => false,
                'includes_candles' => false,
                'includes_knife' => false,
                'variants' => [
                    ['type' => 'flavor', 'name' => 'Double Chocolate', 'additional_price' => 0],
                    ['type' => 'flavor', 'name' => 'Choco Hazelnut', 'additional_price' => 3000],
                    ['type' => 'flavor', 'name' => 'Matcha White Choco', 'additional_price' => 3000],
                    ['type' => 'flavor', 'name' => 'Salted Caramel', 'additional_price' => 3000],
                ],
            ],
            [
                'name' => 'Dessert Box Premium',
                'slug' => 'dessert-box-premium',
                'category_slug' => 'cookies-brownies',
                'description' => 'Kotak dessert premium berisi kombinasi terbaik: 2 slice cheesecake, 3 cookies, 2 mini brownie, 1 mini tart. Dikemas dalam box eksklusif, sempurna untuk hampers dan oleh-oleh.',
                'base_price' => 185000,
                'image' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop',
                ],
                'shelf_life_days' => 5,
                'is_preorder' => true,
                'preorder_days' => 1,
                'stock' => 15,
                'weight_grams' => 600,
                'is_featured' => true,
                'allows_custom_message' => true,
                'includes_candles' => false,
                'includes_knife' => false,
                'variants' => [],
            ],
        ];

        foreach ($productsData as $data) {
            $catSlug = $data['category_slug'];
            $variants = $data['variants'];
            unset($data['category_slug'], $data['variants']);

            $categoryId = $categories[$catSlug]->id ?? $categories['all-category']->id;
            $data['store_id'] = $store->id;
            $data['category_id'] = $categoryId;

            $product = Product::updateOrCreate(['slug' => $data['slug']], $data);

            ProductVariant::where('product_id', $product->id)->delete();
            foreach ($variants as $v) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'type' => $v['type'],
                    'name' => $v['name'],
                    'additional_price' => $v['additional_price'],
                    'stock' => 20,
                ]);
            }
        }

        $this->command->info('✅ Seeded: 1 Store, 6 Categories, '.count($productsData).' Products + Variants');
    }
}
