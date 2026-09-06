/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pulse: {
          bg: '#FAFAF7',
          surface: '#FFFFFF',
          text: '#17212B',
          secondary: '#66727D',
          green: '#16A66A',
          'green-light': '#E8F7F0',
          blue: '#5B9CF6',
          'blue-light': '#EEF5FE',
          purple: '#9B7EDE',
          'purple-light': '#F4F0FF',
          peach: '#FF9B7A',
          'peach-light': '#FFF1ED',
          yellow: '#F5C95B',
          'yellow-light': '#FEF9EC',
          blush: '#F3A6B8',
          border: '#E8E9EE',
          // Dark palette
          dark: {
            bg: '#101412',
            surface: '#171C19',
            card: '#1E2521',
            text: '#F1F5F2',
            secondary: '#8C9891',
            green: '#20B982',
            purple: '#A88CE8',
            peach: '#FF9B7A',
            yellow: '#F5C95B',
            border: '#2A352E'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(23, 33, 43, 0.04), 0 1px 2px -1px rgba(23, 33, 43, 0.04)',
        'card': '0 4px 12px -2px rgba(23, 33, 43, 0.05), 0 2px 6px -2px rgba(23, 33, 43, 0.03)',
        'elevated': '0 12px 24px -4px rgba(23, 33, 43, 0.08), 0 4px 8px -2px rgba(23, 33, 43, 0.03)',
      }
    },
  },
  plugins: [],
}
