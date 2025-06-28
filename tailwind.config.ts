import type { Config } from "tailwindcss"
import { karmaTheme } from "./lib/theme"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Use our centralized theme colors
        ...karmaTheme.colors,

        // CSS variable-based colors for light/dark mode
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },

        // Chart colors for data visualization
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        // Sidebar colors
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      spacing: karmaTheme.spacing,
      borderRadius: {
        ...karmaTheme.borderRadius,
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        ...karmaTheme.shadows,
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glow-sm': '0 0 10px rgba(249, 115, 22, 0.25)',
        'glow': '0 0 20px rgba(249, 115, 22, 0.35)',
        'glow-lg': '0 0 40px rgba(249, 115, 22, 0.25)',
        'glow-secondary': '0 0 20px rgba(234, 179, 8, 0.35)',
      },
      zIndex: karmaTheme.zIndex,
      transitionDuration: {
        DEFAULT: "400ms",
        fast: "200ms",
        slow: "600ms",
        slower: "800ms",
        '2000': '2000ms',
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        apple: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        elastic: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        // Entrance animations - Apple-like smoothness
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-15px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(15px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        // Gradient animations - Slower and smoother
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        meshMove: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "33%": { transform: "scale(1.03) rotate(60deg)" },
          "66%": { transform: "scale(0.97) rotate(120deg)" },
        },
        rainbowShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "25%": { backgroundPosition: "100% 50%" },
          "50%": { backgroundPosition: "100% 100%" },
          "75%": { backgroundPosition: "0% 100%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400% 0%" },
          "100%": { backgroundPosition: "400% 0%" },
        },

        // Background gradient animation for AnimatedGradient component
        backgroundGradient: {
          "0%": { transform: `translate(calc(var(--tx-1) * 100%), calc(var(--ty-1) * 100%))` },
          "25%": { transform: `translate(calc(var(--tx-2) * 100%), calc(var(--ty-2) * 100%))` },
          "50%": { transform: `translate(calc(var(--tx-3) * 100%), calc(var(--ty-3) * 100%))` },
          "75%": { transform: `translate(calc(var(--tx-4) * 100%), calc(var(--ty-4) * 100%))` },
          "100%": { transform: `translate(calc(var(--tx-1) * 100%), calc(var(--ty-1) * 100%))` },
        },

        // Floating animations - Gentler movements
        floatGentle: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(2deg)" },
        },
        floatFast: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        floatParticles: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-15px) rotate(45deg)" },
          "66%": { transform: "translateY(-8px) rotate(90deg)" },
        },

        // Interactive animations - Refined
        bounce: {
          "0%, 100%": { transform: "translateY(-10%)", animationTimingFunction: "cubic-bezier(0.8,0,1,1)" },
          "50%": { transform: "none", animationTimingFunction: "cubic-bezier(0,0,0.2,1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-1px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(1px)" },
        },

        // Loading animations - Slower
        dots: {
          "0%, 20%": { content: "''" },
          "40%": { content: "'.'" },
          "60%": { content: "'..'" },
          "80%, 100%": { content: "'...'" },
        },
        loading: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },

        // Component animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },

        // Special effects - Refined
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".6" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        scale: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        // Entrance animations - Much slower and calmer
        fadeIn: "fadeIn 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        fadeInUp: "fadeInUp 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        fadeInDown: "fadeInDown 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        slideInLeft: "slideInLeft 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        slideInRight: "slideInRight 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        slideInUp: "slideInUp 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",

        // Gradient animations - Much slower for calmness
        gradientShift: "gradientShift 25s ease-in-out infinite",
        gradientFast: "gradientShift 8s ease-in-out infinite",
        meshMove: "meshMove 60s ease-in-out infinite",
        rainbowShift: "rainbowShift 30s ease-in-out infinite",
        shimmer: "shimmer 8s ease-in-out infinite",

        // Background gradient animation for AnimatedGradient component
        "background-gradient": "backgroundGradient var(--background-gradient-speed, 20s) ease-in-out infinite",

        // Floating animations - Removed
        floatGentle: "none",
        floatSlow: "none",
        floatFast: "none",
        floatParticles: "floatParticles 80s ease-in-out infinite",
        floatParticlesReverse: "floatParticles 100s ease-in-out infinite reverse",

        // Interactive animations - Slower timing
        bounce: "bounce 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
        shake: "shake 2s ease-in-out infinite",

        // Loading animations - Much slower
        loading: "loading 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
        dots: "dots 4s infinite",

        // Component animations - Slower
        "accordion-down": "accordion-down 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "accordion-up": "accordion-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "collapsible-down": "collapsible-down 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "collapsible-up": "collapsible-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",

        // Delayed animations - Much slower
        'fadeIn-delay-100': 'fadeIn 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
        'fadeIn-delay-200': 'fadeIn 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both',
        'fadeIn-delay-300': 'fadeIn 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s both',
        'slideInUp-delay-100': 'slideInUp 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
        'slideInUp-delay-200': 'slideInUp 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both',
        'slideInUp-delay-300': 'slideInUp 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s both',

        // Special effects - Much slower
        pulse: "pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ping: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        spin: "spin 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
        scale: "scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": karmaTheme.gradients.hero,
        "primary-gradient": karmaTheme.gradients.primary,
        "secondary-gradient": karmaTheme.gradients.secondary,
        "accent-gradient": karmaTheme.gradients.accent,
        "sunset-gradient": karmaTheme.gradients.sunset,
        "warm-gradient": karmaTheme.gradients.warm,
        "mesh-gradient": `radial-gradient(circle at 25% 25%, ${karmaTheme.colors.primary.DEFAULT} 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${karmaTheme.colors.secondary.DEFAULT} 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${karmaTheme.colors.primary[400]} 0%, transparent 50%)`,
        "rainbow-gradient": "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))",
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      rotate: {
        '1': '1deg',
        '2': '2deg',
        '3': '3deg',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
