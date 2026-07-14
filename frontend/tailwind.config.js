/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          50: '#F1EFFD',
          100: '#E3DFFB',
          500: '#6C5CE7',
          600: '#5B4BD4',
          700: '#4A3BB0',
        },
        accent: {
          orange: '#F5A623',
          green: '#22B07D',
          blue: '#3B82F6',
        },
        surface: '#F6F7FB',
        card: '#FFFFFF',
        ink: {
          900: '#1F2430',
          700: '#4B5163',
          500: '#8B90A0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(31, 36, 48, 0.04), 0 1px 8px rgba(31, 36, 48, 0.06)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
