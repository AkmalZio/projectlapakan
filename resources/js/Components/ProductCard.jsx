import React from 'react';
import { Link } from '@inertiajs/react';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';

export default function ProductCard({ product }) {
    // Format IDR currency
    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="group lapakan-card rounded-2xl overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-[0_18px_30px_rgba(53,18,25,0.12)]">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={product.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.is_preorder ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 backdrop-blur-sm text-white shadow-sm">
                            <Clock className="w-3 h-3" />
                            PO H-{product.preorder_days || 1}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600/90 backdrop-blur-sm text-white shadow-sm">
                            Ready Stock
                        </span>
                    )}
                </div>

                {product.category && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
                        {product.category.name}
                    </span>
                )}
            </div>

            {/* Content info */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                    <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-crimson-800 transition">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] text-gray-400 font-medium block">Harga Mulai</span>
                        <span className="text-base sm:text-lg font-extrabold text-crimson-800">
                            {formatIDR(product.base_price)}
                        </span>
                    </div>

                    <Link
                        href={route('product.show', product.slug)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-bold shadow-sm group-hover:shadow-md transition active:scale-95"
                    >
                        <span>Detail</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
