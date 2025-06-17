// Centralized Theme Configuration for Karmastat
// Based on ICMR-NIN 2020 Guidelines and medical design standards

export const karmaTheme = {
  // Core color palette - KARMASTAT brand colors
  colors: {
    // Primary colors - Professional medical blues
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#146C94', // Brand primary
      600: '#19A7CE', // Brand secondary
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
      DEFAULT: '#146C94',
    },

    // Secondary colors
    secondary: {
      50: '#f8f9fa',
      100: '#f1f3f5',
      200: '#e9ecef',
      300: '#dee2e6',
      400: '#ced4da',
      500: '#adb5bd',
      600: '#868e96',
      700: '#495057',
      800: '#343a40',
      900: '#212529',
      DEFAULT: '#19A7CE',
    },

    // Accent colors
    accent: {
      light: '#F8FDCF', // Light accent
      neutral: '#F6F1F1', // Light neutral
      DEFAULT: '#F8FDCF',
    },

    // Semantic colors
    success: {
      light: '#a5d6a7',
      DEFAULT: '#4caf50',
      dark: '#2e7d32',
    },
    warning: {
      light: '#fff59d',
      DEFAULT: '#ffeb3b',
      dark: '#f57f17',
    },
    error: {
      light: '#ef9a9a',
      DEFAULT: '#f44336',
      dark: '#c62828',
    },
    info: {
      light: '#81d4fa',
      DEFAULT: '#03a9f4',
      dark: '#0288d1',
    },

    // Neutral grays
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },

  // Typography system
  typography: {
    fontFamily: {
      primary: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      secondary: ['Space Mono', 'monospace'],
      heading: ['Montserrat', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
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
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },

  // Border radius
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
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #146C94, #19A7CE)',
    secondary: 'linear-gradient(135deg, #19A7CE, #F8FDCF)',
    accent: 'linear-gradient(135deg, #F8FDCF, #F6F1F1)',
    success: 'linear-gradient(135deg, #4caf50, #8bc34a)',
    warning: 'linear-gradient(135deg, #ff9800, #ffeb3b)',
    error: 'linear-gradient(135deg, #f44336, #ff5722)',
    hero: 'linear-gradient(135deg, #146C94 0%, #19A7CE 50%, #F8FDCF 100%)',
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

  // Transitions
  transitions: {
    DEFAULT: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Light theme configuration
export const lightTheme = {
  background: 'oklch(1 0 0)', // White
  foreground: 'oklch(0.141 0.005 285.823)', // Dark gray
  card: 'oklch(1 0 0)', // White
  cardForeground: 'oklch(0.141 0.005 285.823)', // Dark gray
  popover: 'oklch(1 0 0)', // White
  popoverForeground: 'oklch(0.141 0.005 285.823)', // Dark gray
  primary: 'oklch(0.391 0.138 213.445)', // #146C94
  primaryForeground: 'oklch(1 0 0)', // White
  secondary: 'oklch(0.967 0.001 286.375)', // Light gray
  secondaryForeground: 'oklch(0.21 0.006 285.885)', // Dark
  muted: 'oklch(0.967 0.001 286.375)', // Light gray
  mutedForeground: 'oklch(0.552 0.016 285.938)', // Medium gray
  accent: 'oklch(0.967 0.001 286.375)', // Light gray
  accentForeground: 'oklch(0.21 0.006 285.885)', // Dark
  destructive: 'oklch(0.577 0.245 27.325)', // Red
  destructiveForeground: 'oklch(1 0 0)', // White
  border: 'oklch(0.92 0.004 286.32)', // Very light gray
  input: 'oklch(0.92 0.004 286.32)', // Very light gray
  ring: 'oklch(0.391 0.138 213.445)', // Primary blue
  success: 'oklch(0.548 0.166 142.495)', // Green
  warning: 'oklch(0.832 0.199 95.677)', // Yellow
  error: 'oklch(0.577 0.245 27.325)', // Red
  info: 'oklch(0.631 0.206 231.738)', // Blue
};

// Dark theme configuration
export const darkTheme = {
  background: 'oklch(0.141 0.005 285.823)', // Dark gray
  foreground: 'oklch(0.985 0 0)', // Nearly white
  card: 'oklch(0.21 0.006 285.885)', // Medium dark
  cardForeground: 'oklch(0.985 0 0)', // Nearly white
  popover: 'oklch(0.21 0.006 285.885)', // Medium dark
  popoverForeground: 'oklch(0.985 0 0)', // Nearly white
  primary: 'oklch(0.488 0.243 264.376)', // Lighter blue for dark mode
  primaryForeground: 'oklch(0.985 0 0)', // Nearly white
  secondary: 'oklch(0.274 0.006 286.033)', // Dark gray
  secondaryForeground: 'oklch(0.985 0 0)', // Nearly white
  muted: 'oklch(0.274 0.006 286.033)', // Dark gray
  mutedForeground: 'oklch(0.705 0.015 286.067)', // Light gray
  accent: 'oklch(0.32 0.01 286.033)', // Mid gray for hover / accent backgrounds
  accentForeground: 'oklch(0.985 0 0)', // Nearly white
  destructive: 'oklch(0.704 0.191 22.216)', // Red
  destructiveForeground: 'oklch(0.985 0 0)', // Nearly white
  border: 'oklch(0.37 0.02 285.938)', // Visible gray for outlines
  input: 'oklch(0.37 0.02 285.938)', // Visible gray for inputs
  ring: 'oklch(0.552 0.016 285.938)', // Medium gray
  success: 'oklch(0.649 0.169 152.511)', // Green
  warning: 'oklch(0.832 0.199 95.677)', // Yellow
  error: 'oklch(0.704 0.191 22.216)', // Red
  info: 'oklch(0.696 0.17 162.48)', // Blue
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
