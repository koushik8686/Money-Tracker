/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#000000',
        tomato: {
          DEFAULT: '#ff4b3e',
          100: '#3f0400',
          200: '#7e0800',
          300: '#be0d00',
          400: '#fd1100',
          500: '#ff4b3e',
          600: '#ff6e64',
          700: '#ff928b',
          800: '#ffb7b1',
          900: '#ffdbd8'
        },
        'antiflash-white': '#efecef',
        gunmetal: {
          DEFAULT: '#253237',
          100: '#070a0b',
          200: '#0e1416',
          300: '#151d21',
          400: '#1c272c',
          500: '#253237',
          600: '#476068',
          700: '#698e9a',
          800: '#9ab6bf',
          900: '#ccdadf'
        }
      }
    }
  },
  plugins: []
};