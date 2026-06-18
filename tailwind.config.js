/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],

    // NativeWind reads the device Appearance API on native; on web this maps to
    // the prefers-color-scheme media query defined in globals.css.
    darkMode: 'media',

    presets: [require('nativewind/preset')],

    theme: {
        extend: {
            // ─── Brand / primary ─────────────────────────────────────────────────────
            // Golden yellow. Swap the values here if the brand color changes.
            colors: {
                primary: {
                    // DEFAULT and foreground follow the theme (CSS variables).
                    // yellow-400 in both modes — bright enough for dark, rich enough for light.
                    DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
                    foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
                    // Fixed scale for when you need a specific shade explicitly.
                    50:  '#FEFCE8',
                    100: '#FEF9C3',
                    200: '#FEF08A',
                    300: '#FDE047',
                    400: '#FACC15',
                    500: '#EAB308',
                    600: '#CA8A04',
                    700: '#A16207',
                    800: '#854D0E',
                    900: '#713F12',
                    950: '#422006',
                },

                // ─── Semantic surface tokens (resolved via CSS variables) ─────────────
                // Light/dark values are defined in app/globals.css.
                // Usage:  bg-background  text-foreground  border-border  etc.
                background: 'rgb(var(--background) / <alpha-value>)',
                foreground: 'rgb(var(--foreground) / <alpha-value>)',

                card: {
                    DEFAULT: 'rgb(var(--card) / <alpha-value>)',
                    foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
                },

                muted: {
                    DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
                    foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
                },

                secondary: {
                    DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
                    foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
                },

                accent: {
                    DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
                    foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
                },

                destructive: {
                    DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
                    foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
                },

                success: {
                    DEFAULT: 'rgb(var(--success) / <alpha-value>)',
                    foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
                },

                border: 'rgb(var(--border) / <alpha-value>)',
                input: 'rgb(var(--input) / <alpha-value>)',
                ring: 'rgb(var(--ring) / <alpha-value>)',
            },

            // ─── Typography ──────────────────────────────────────────────────────────
            // To add a custom font: load it via expo-font, then replace 'System' with
            // the font family name in the arrays below.
            fontFamily: {
                sans: ['System', 'ui-sans-serif', 'sans-serif'],
                heading: ['System', 'ui-sans-serif', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
            },

            // ─── Border radius ───────────────────────────────────────────────────────
            // rounded-sm  → 6 px  (tags, badges)
            // rounded-md  → 8 px  (inputs)
            // rounded-lg  → 12 px (cards)
            // rounded-xl  → 16 px (buttons, sheets)
            // rounded-2xl → 20 px (bottom sheets)
            // rounded-full → pill (avatars, chips)
            borderRadius: {
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
                full: '9999px',
            },

            // ─── Spacing extras ──────────────────────────────────────────────────────
            // Standard Tailwind spacing scale (4 = 16 px) already covers most needs.
            // Add project-specific tokens here if needed.
        },
    },

    plugins: [],
};
