import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    { pattern: /^(m|p)(t|b|l|r|x|y)?-\d+$/ },
    { pattern: /^gap-\d+$/ },
    { pattern: /^space-(x|y)-\d+$/ },
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl)$/ },
    { pattern: /^(w|h)-\d+$/ },
  ],
} satisfies Config
