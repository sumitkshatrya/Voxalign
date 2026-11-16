/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        vox: {
          bg: {
            primary: 'var(--vox-bg-primary)',
            secondary: 'var(--vox-bg-secondary)',
            tertiary: 'var(--vox-bg-tertiary)',
            elevated: 'var(--vox-bg-elevated)',
            card: 'var(--vox-bg-card)',
          },
          teal: {
            DEFAULT: '#52DDBB',
            glow: 'rgba(82, 221, 187, 0.25)',
            light: '#6EE7CB',
            dark: '#3AB799'
          },
          blue: {
            DEFAULT: '#64C8FF',
            glow: 'rgba(100, 200, 255, 0.25)',
            light: '#8AD5FF',
            dark: '#3AA7DE'
          },
          text: {
            primary: 'var(--vox-text-primary)',
            secondary: 'var(--vox-text-secondary)',
            muted: 'var(--vox-text-muted)',
            disabled: 'var(--vox-text-disabled)'
          },
          border: {
            subtle: 'var(--vox-border-subtle)',
            active: 'var(--vox-border-active)',
            focus: 'var(--vox-border-focus)'
          }
        }
      },
      fontFamily: {
        heading: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      backgroundImage: {
        'vox-gradient-primary': 'linear-gradient(135deg, #52DDBB 0%, #64C8FF 100%)',
        'vox-gradient-glow': 'radial-gradient(circle at 50% 0%, rgba(82, 221, 187, 0.15) 0%, rgba(100, 200, 255, 0.05) 50%, transparent 80%)'
      },
      boxShadow: {
        'vox-glow': '0 0 20px rgba(82, 221, 187, 0.15), 0 0 40px rgba(100, 200, 255, 0.1)',
        'vox-card': '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
