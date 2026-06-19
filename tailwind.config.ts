export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg:      '#0a0a0f',
          surface: '#12121a',
          card:    '#1a1a28',
          border:  '#2a2a3d',
          accent:  '#e50914',      // cinema red
          gold:    '#f5c518',      // IMDb-style rating gold
          muted:   '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}