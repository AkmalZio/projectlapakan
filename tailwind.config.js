import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                crimson: {
                    50: '#FDF2F7',
                    100: '#FCE7F0',
                    200: '#F7C6D9',
                    300: '#EE94B8',
                    400: '#DE568D',
                    500: '#BE185D',
                    600: '#9E1B48',
                    700: '#8B0032',
                    800: '#730D2C',
                    900: '#580A22',
                    950: '#340312',
                },
                cream: {
                    50: '#FCFAF6',
                    100: '#F7F4EB',
                    200: '#EFE9DA',
                    300: '#E3DBC7',
                    400: '#CEC2A6',
                },
            },
        },
    },

    plugins: [forms],
};
