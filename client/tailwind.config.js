/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Aksen kuning hangat (gaya Coterie)
        primary: {
          50: '#fffaeb',
          100: '#fef1c4',
          200: '#fce48d',
          300: '#f9d55b',
          400: '#f4c63d',
          500: '#e6b120',
          600: '#c28f12',
          700: '#946b10',
          800: '#765412',
          900: '#614414',
        },
        success: {
          50: '#f1f8ee',
          100: '#ddefd5',
          200: '#bfe0b0',
          300: '#94c97f',
          400: '#6aae55',
          500: '#4d913b',
          600: '#3c742e',
          700: '#315c27',
        },
        warning: {
          50: '#fff6ed',
          100: '#ffead4',
          200: '#fed1a8',
          300: '#fcb071',
          400: '#f88a3c',
          500: '#ec6c1a',
          600: '#c95410',
          700: '#a04211',
        },
        danger: {
          50: '#fdf3f1',
          100: '#fbe4df',
          200: '#f7cbc2',
          300: '#f0a596',
          400: '#e57460',
          500: '#d4513b',
          600: '#b33e2c',
          700: '#923427',
        },
        // Netral hangat: krem sampai tinta
        dark: {
          50: '#faf8f3',
          100: '#f3efe6',
          200: '#e8e2d5',
          300: '#d7cfbe',
          400: '#a8a091',
          500: '#7d766a',
          600: '#5c564c',
          700: '#413d36',
          800: '#2a2824',
          900: '#181715',
        },
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(60, 45, 10, 0.05)',
        'card': '0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 12px 32px -14px rgba(77, 61, 20, 0.16)',
        'elevated': '0 28px 64px -24px rgba(60, 45, 10, 0.32)',
        'inset-soft': 'inset 0 1px 0 rgba(255,255,255,0.7)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
