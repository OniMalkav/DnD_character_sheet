import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['PT Sans', 'sans-serif'],
        headline: ['PT Sans', 'sans-serif'],
        code: ['Source Code Pro', 'monospace'],
      },
      colors: {
        background: 'color-mix(in srgb, var(--background), transparent calc(100% - (<alpha-value> * 100%)))',
        foreground: 'color-mix(in srgb, var(--foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        card: {
          DEFAULT: 'color-mix(in srgb, var(--card), transparent calc(100% - (<alpha-value> * 100%)))',
          foreground: 'color-mix(in srgb, var(--card-foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        popover: {
          DEFAULT: 'color-mix(in srgb, var(--popover), transparent calc(100% - (<alpha-value> * 100%)))',
          foreground: 'color-mix(in srgb, var(--popover-foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        primary: {
          DEFAULT: 'color-mix(in srgb, var(--primary), transparent calc(100% - (<alpha-value> * 100%)))',
          foreground: 'color-mix(in srgb, var(--primary-foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        secondary: {
          DEFAULT: 'color-mix(in srgb, var(--secondary), transparent calc(100% - (<alpha-value> * 100%)))',
          foreground: 'color-mix(in srgb, var(--secondary-foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        muted: {
          DEFAULT: 'color-mix(in srgb, var(--muted), transparent calc(100% - (<alpha-value> * 100%)))',
          foreground: 'color-mix(in srgb, var(--muted-foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        accent: {
          DEFAULT: 'color-mix(in srgb, var(--accent), transparent calc(100% - (<alpha-value> * 100%)))',
          foreground: 'color-mix(in srgb, var(--accent-foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        destructive: {
          DEFAULT: 'color-mix(in srgb, var(--destructive), transparent calc(100% - (<alpha-value> * 100%)))',
          foreground: 'color-mix(in srgb, var(--destructive-foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        success: {
          DEFAULT: 'color-mix(in srgb, var(--success), transparent calc(100% - (<alpha-value> * 100%)))',
          foreground: 'color-mix(in srgb, var(--success-foreground), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        border: 'color-mix(in srgb, var(--border), transparent calc(100% - (<alpha-value> * 100%)))',
        input: 'color-mix(in srgb, var(--input), transparent calc(100% - (<alpha-value> * 100%)))',
        ring: 'color-mix(in srgb, var(--ring), transparent calc(100% - (<alpha-value> * 100%)))',
        chart: {
          '1': 'color-mix(in srgb, var(--chart-1), transparent calc(100% - (<alpha-value> * 100%)))',
          '2': 'color-mix(in srgb, var(--chart-2), transparent calc(100% - (<alpha-value> * 100%)))',
          '3': 'color-mix(in srgb, var(--chart-3), transparent calc(100% - (<alpha-value> * 100%)))',
          '4': 'color-mix(in srgb, var(--chart-4), transparent calc(100% - (<alpha-value> * 100%)))',
          '5': 'color-mix(in srgb, var(--chart-5), transparent calc(100% - (<alpha-value> * 100%)))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        shake: { 
          '0%, 100%': { transform: 'translateX(0)' }, 
          '20%': { transform: 'translateX(-4px) rotate(-1deg)' }, 
          '40%': { transform: 'translateX(4px) rotate(1deg)' }, 
          '60%': { transform: 'translateX(-4px) rotate(-1deg)' }, 
          '80%': { transform: 'translateX(4px) rotate(1deg)' }, 
        },
        'pop-in': { 
          '0%': { transform: 'scale(0)', opacity: '0' }, 
          '70%': { transform: 'scale(1.2)', opacity: '1' }, 
          '100%': { transform: 'scale(1)', opacity: '1' }, 
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'pop': 'pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
