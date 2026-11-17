import { useEffect, useState } from 'react';

/** Neutral cake placeholder (inline SVG) shown when a photo is missing or its URL is broken. */
export const PLACEHOLDER_IMAGE =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
            '<rect width="120" height="120" fill="#f3ecdc"/>' +
            '<g fill="none" stroke="#c9b48f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M30 88h60V62a6 6 0 0 0-6-6H36a6 6 0 0 0-6 6z"/>' +
            '<path d="M30 72c5 0 5 4 10 4s5-4 10-4 5 4 10 4 5-4 10-4 5 4 10 4 5-4 10-4"/>' +
            '<path d="M60 56V44"/><path d="M60 38c3-3 3-6 0-9-3 3-3 6 0 9z"/>' +
            '</g></svg>',
    );

/**
 * An <img> that swaps to a placeholder when `src` is empty or fails to load,
 * so a dead image URL never shows the browser's broken-image icon or alt text.
 */
export default function ImageWithFallback({ src, alt = '', fallback = PLACEHOLDER_IMAGE, ...props }) {
    const [currentSrc, setCurrentSrc] = useState(src || fallback);

    useEffect(() => {
        setCurrentSrc(src || fallback);
    }, [src, fallback]);

    return (
        <img
            {...props}
            src={currentSrc}
            alt={alt}
            onError={() => {
                if (currentSrc !== fallback) {
                    setCurrentSrc(fallback);
                }
            }}
        />
    );
}
