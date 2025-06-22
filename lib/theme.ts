// Centralized Theme Configuration for Karmastat
// Based on legacy karmastat_comparative_fixed.html and ICMR-NIN 2020 Guidelines

export const karmaTheme = {
  // Core color palette - KARMASTAT Academic Orange-Blue theme
  colors: {
    // Primary colors - Academic orange spectrum
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#FFB570', // primary-light from legacy
      500: '#FF8C42', // Brand primary - vibrant orange (legacy)
      600: '#E67A2F', // primary-dark from legacy
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      DEFAULT: '#FF8C42',
    },

    // Secondary colors - Academic blue spectrum
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#2C5282', // Brand secondary - academic blue (legacy)
      600: '#1e40af',
      700: '#1d4ed8',
      800: '#1e3a8a',
      900: '#1e3a8a',
      DEFAULT: '#2C5282',
    },

    // Accent color - From legacy
    accent: {
      light: '#F8FDCF', // accent from legacy
      neutral: '#fdf4e6',
      DEFAULT: '#F6AD55', // accent from legacy
    },

    // Additional legacy colors
    success: {
      light: '#a5d6a7',
      DEFAULT: '#38A169', // success from legacy
      dark: '#2e7d32',
    },
    warning: {
      light: '#fff59d',
      DEFAULT: '#D69E2E', // warning from legacy
      dark: '#f57f17',
    },
    error: {
      light: '#ef9a9a',
      DEFAULT: '#E53E3E', // danger from legacy
      dark: '#c62828',
    },
    info: {
      light: '#81d4fa',
      DEFAULT: '#3182CE', // info from legacy
      dark: '#0288d1',
    },

    // Neutral grays - From legacy
    gray: {
      50: '#F7FAFC', // bg-secondary from legacy light theme
      100: '#f5f5f5',
      200: '#E2E8F0', // border-color from legacy
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#718096', // text-muted from legacy
      600: '#4A5568', // text-secondary from legacy
      700: '#2D3748', // text-primary from legacy
      800: '#424242',
      900: '#212121',
    },

    // Dark theme colors - From legacy
    dark: {
      bgPrimary: '#1A202C',
      bgSecondary: '#2D3748',
      bgCard: '#2D3748',
      textPrimary: '#F7FAFC',
      textSecondary: '#E2E8F0',
      textMuted: '#A0AEC0',
      borderColor: '#4A5568',
    },
  },

  // Typography system - From legacy
  typography: {
    fontFamily: {
      primary: ['Segoe UI', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'], // font-main from legacy
      secondary: ['Courier New', 'Monaco', 'Menlo', 'monospace'], // font-mono from legacy
      heading: ['Montserrat', 'sans-serif'],
    },
    fontSize: {
      // Base sizes
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px

      // Display sizes
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
      '5xl': ['3rem', { lineHeight: '1' }],         // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
      '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
      '8xl': ['6rem', { lineHeight: '1' }],         // 96px
      '9xl': ['8rem', { lineHeight: '1' }],         // 128px

      // Semantic sizes
      caption: ['0.75rem', { lineHeight: '1rem' }],      // Small labels, captions
      body: ['0.875rem', { lineHeight: '1.25rem' }],     // Body text
      'body-lg': ['1rem', { lineHeight: '1.5rem' }],     // Large body text
      lead: ['1.125rem', { lineHeight: '1.75rem' }],     // Lead paragraphs
      h6: ['0.875rem', { lineHeight: '1.25rem' }],  // Small heading
      h5: ['1rem', { lineHeight: '1.5rem' }],       // Small heading
      h4: ['1.125rem', { lineHeight: '1.75rem' }],  // Medium heading
      h3: ['1.25rem', { lineHeight: '1.75rem' }],   // Large heading
      h2: ['1.5rem', { lineHeight: '2rem' }],       // Section heading
      h1: ['2.25rem', { lineHeight: '2.5rem' }],    // Page heading
      hero: ['3rem', { lineHeight: '1' }],          // Hero text
      display: ['4.5rem', { lineHeight: '1' }],     // Display text
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Spacing system
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem', // radius from legacy
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },

  // Shadows - From legacy
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 4px 12px rgba(0, 0, 0, 0.1)', // shadow from legacy
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    hover: '0 8px 20px rgba(0, 0, 0, 0.15)', // shadow-hover from legacy
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },

  // Border radius - From legacy
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
    radius: '12px', // radius from legacy
  },

  // Gradients - From legacy academic design
  gradients: {
    primary: 'linear-gradient(135deg, #FF8C42, #F6AD55, #FFB570)', // gradient-primary from legacy
    secondary: 'linear-gradient(135deg, #2C5282, #3182CE, #4299E1)', // gradient-secondary from legacy
    bg: 'linear-gradient(135deg, #FFF5F0, #FEEBC8, #FED7AA)', // gradient-bg from legacy
    card: 'linear-gradient(145deg, #FFFFFF, #F7FAFC)', // gradient-card from legacy
    magic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // gradient-magic from legacy
    analytical: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // gradient-analytical from legacy
    formula: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // gradient-formula from legacy
    accent: 'linear-gradient(135deg, #F8FDCF, #F6AD55)', // Accent gradient
    success: 'linear-gradient(135deg, #38A169, #68D391)',
    warning: 'linear-gradient(135deg, #D69E2E, #F6E05E)',
    error: 'linear-gradient(135deg, #E53E3E, #FC8181)',
    hero: 'linear-gradient(135deg, #FF8C42 0%, #2C5282 50%, #F8FDCF 100%)', // Orange to blue to cream
    sunset: 'linear-gradient(135deg, #FFB570 0%, #FF8C42 25%, #2C5282 75%, #3182CE 100%)', // Full spectrum
    warm: 'linear-gradient(135deg, #FFF5F0, #F8FDCF)', // Soft warm gradient
  },

  // Transitions - From legacy
  transitions: {
    DEFAULT: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // transition from legacy
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Breakpoints
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
  },

  // Mobile-specific extensions
  mobile: {
    touchTargets: {
      minimum: '44px',
      comfortable: '48px',
      large: '56px',
      extraLarge: '64px',
    },
    safeAreas: {
      top: 'env(safe-area-inset-top)',
      bottom: 'env(safe-area-inset-bottom)',
      left: 'env(safe-area-inset-left)',
      right: 'env(safe-area-inset-right)',
    },
    haptics: {
      light: 'light',
      medium: 'medium',
      heavy: 'heavy',
      success: 'success',
      warning: 'warning',
      error: 'error',
    },
    navigation: {
      bottomBarHeight: '4rem', // 64px
      fabSize: '3.5rem', // 56px
      tabBarHeight: '5rem', // 80px (with safe area)
    },
    gestures: {
      swipeThreshold: 50, // pixels
      longPressDelay: 500, // milliseconds
      doubleTapDelay: 300, // milliseconds
    },
    animations: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
      spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
};

// Light theme configuration - Academic orange-blue palette (from legacy)
export const lightTheme = {
  background: '#FFFFFF', // bg-primary from legacy
  foreground: '#2D3748', // text-primary from legacy
  card: '#FFFFFF', // bg-card from legacy
  cardForeground: '#2D3748', // text-primary from legacy
  popover: '#FFFFFF', // bg-primary from legacy
  popoverForeground: '#2D3748', // text-primary from legacy
  primary: '#FF8C42', // primary from legacy
  primaryForeground: '#FFFFFF', // white text on orange
  secondary: '#2C5282', // secondary from legacy
  secondaryForeground: '#FFFFFF', // white text on blue
  muted: '#F7FAFC', // bg-secondary from legacy
  mutedForeground: '#718096', // text-muted from legacy
  accent: '#F6AD55', // accent from legacy
  accentForeground: '#2D3748', // text-primary from legacy
  destructive: '#E53E3E', // danger from legacy
  destructiveForeground: '#FFFFFF', // white text
  border: '#E2E8F0', // border-color from legacy
  input: '#E2E8F0', // border-color from legacy
  ring: '#FF8C42', // primary focus ring
  success: '#38A169', // success from legacy
  warning: '#D69E2E', // warning from legacy
  error: '#E53E3E', // danger from legacy
  info: '#3182CE', // info from legacy
};

// Dark theme configuration - From legacy dark theme
export const darkTheme = {
  background: '#1A202C', // bg-primary from legacy dark
  foreground: '#F7FAFC', // text-primary from legacy dark
  card: '#2D3748', // bg-card from legacy dark
  cardForeground: '#F7FAFC', // text-primary from legacy dark
  popover: '#2D3748', // bg-secondary from legacy dark
  popoverForeground: '#F7FAFC', // text-primary from legacy dark
  primary: '#FF8C42', // primary from legacy (same in dark)
  primaryForeground: '#1A202C', // dark text on orange
  secondary: '#2C5282', // secondary from legacy (same in dark)
  secondaryForeground: '#F7FAFC', // light text on blue
  muted: '#2D3748', // bg-secondary from legacy dark
  mutedForeground: '#A0AEC0', // text-muted from legacy dark
  accent: '#F6AD55', // accent from legacy (same in dark)
  accentForeground: '#1A202C', // dark text on accent
  destructive: '#E53E3E', // danger from legacy
  destructiveForeground: '#F7FAFC', // light text
  border: '#4A5568', // border-color from legacy dark
  input: '#4A5568', // border-color from legacy dark
  ring: '#FF8C42', // primary focus ring
  success: '#38A169', // success from legacy
  warning: '#D69E2E', // warning from legacy
  error: '#E53E3E', // danger from legacy
  info: '#3182CE', // info from legacy
};

// Medical color tokens for specific use cases
export const medicalColors = {
  clinical: '#3949ab',
  research: '#00897b',
  emergency: '#d32f2f',
  pediatric: '#7cb342',
  geriatric: '#8d6e63',
  cardiology: '#d81b60',
  neurology: '#5e35b1',
  orthopedic: '#f57c00',
  pulmonary: '#00acc1',
  gastroenterology: '#fdd835',
};

// Animation configurations
export const animations = {
  fadeIn: 'fadeIn 1s ease-out',
  fadeInUp: 'fadeInUp 1s ease-out',
  fadeInDown: 'fadeInDown 1s ease-out',
  slideInLeft: 'slideInLeft 0.5s ease-out',
  slideInRight: 'slideInRight 0.5s ease-out',
  bounce: 'bounce 2s infinite',
  pulse: 'pulse 2s infinite',
};

// Component-specific theme tokens
export const componentThemes = {
  button: {
    primary: {
      background: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
      hover: 'hsl(var(--primary) / 0.9)',
    },
    secondary: {
      background: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
      hover: 'hsl(var(--secondary) / 0.8)',
    },
  },
  card: {
    background: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
    border: 'hsl(var(--border))',
  },
  input: {
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    border: 'hsl(var(--border))',
    placeholder: 'hsl(var(--muted-foreground))',
  },
};

// Accessibility settings (WCAG 2.1 AA compliance)
export const accessibility = {
  minContrastRatio: 4.5,
  minLargeTextContrastRatio: 3,
  focusOutlineWidth: '3px',
  focusOutlineColor: 'hsl(var(--ring))',
  focusOutlineStyle: 'solid',
  motionReduced: {
    transition: 'none',
    animation: 'none',
  },
};

export default karmaTheme;
