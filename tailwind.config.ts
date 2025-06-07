import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Golden Ratio Typography Scale (φ = 1.618)
      fontSize: {
        'xs': ['10px', { lineHeight: '16px', fontWeight: '400' }],      // 16 ÷ 1.618²
        'sm': ['13px', { lineHeight: '20px', fontWeight: '400' }],      // 16 ÷ 1.618
        'base': ['16px', { lineHeight: '26px', fontWeight: '400' }],    // base
        'lg': ['26px', { lineHeight: '42px', fontWeight: '400' }],      // 16 × 1.618
        'xl': ['42px', { lineHeight: '68px', fontWeight: '400' }],      // 16 × 1.618²
        '2xl': ['68px', { lineHeight: '110px', fontWeight: '400' }],    // 16 × 1.618³
      },
      // Golden Ratio Spacing Scale
      spacing: {
        'xs': '4px',     // 16 ÷ 4
        'sm': '8px',     // 16 ÷ 2
        'base': '16px',  // base
        'lg': '26px',    // 16 × 1.618
        'xl': '42px',    // 16 × 1.618²
        '2xl': '68px',   // 16 × 1.618³
        '3xl': '110px',  // 16 × 1.618⁴
      },
      // Font families
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      // Font weights - all regular
      fontWeight: {
        normal: '400',
        regular: '400',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;