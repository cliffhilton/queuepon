import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Queuepon brand
        blue: {
          DEFAULT: '#588aad',
          dark:    '#3d6e92',
          deeper:  '#2a5070',
          light:   '#7aadc8',
          pale:    '#e8f2f8',
          xpale:   '#f2f7fb',
        },
        tan: {
          DEFAULT: '#716557',
          light:   '#9e8e83',
          pale:    '#f5f0ec',
          dark:    '#4a3f36',
        },
        cream: {
          DEFAULT: '#fdfaf7',
          dark:    '#ede5db',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        xl:  '16px',
        '2xl': '22px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(88,138,173,0.12)',
        'card-lg': '0 16px 56px rgba(88,138,173,0.18)',
      },
    },
  },
  plugins: [],
}

export default config
