// Theme configuration for Karmastat
// Based on ICMR-NIN 2020 Guidelines and medical design standards

export const karmaTheme = {
  // Primary colors - Medical blues
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
    DEFAULT: '#146C94', // Primary blue
  },
  
  // Secondary colors - Cool grays
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
    DEFAULT: '#19A7CE', // Secondary blue
  },
  
  // Accent colors
  accent: {
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
    DEFAULT: '#F8FDCF', // Light accent
  },
  
  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
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
    DEFAULT: '#F6F1F1', // Light neutral
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #146C94, #19A7CE)',
    secondary: 'linear-gradient(135deg, #19A7CE, #F8FDCF)',
    accent: 'linear-gradient(135deg, #F8FDCF, #F6F1F1)',
    success: 'linear-gradient(135deg, #4caf50, #8bc34a)',
    warning: 'linear-gradient(135deg, #ff9800, #ffeb3b)',
    error: 'linear-gradient(135deg, #f44336, #ff5722)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, -apple-system, sans-serif',
      secondary: 'Space Mono, monospace',
      heading: 'Montserrat, sans-serif',
    },
    fontSizes: {
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
    fontWeights: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
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
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    auto: 'auto',
  },
  
  // Transitions
  transitions: {
    DEFAULT: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Light/Dark mode configurations
export const lightTheme = {
  background: '#ffffff',
  foreground: '#212529',
  card: '#ffffff',
  cardForeground: '#212529',
  border: '#e0e0e0',
  input: '#f5f5f5',
  primary: karmaTheme.primary.DEFAULT,
  primaryForeground: '#ffffff',
  secondary: karmaTheme.secondary.DEFAULT,
  secondaryForeground: '#ffffff',
  accent: karmaTheme.accent.DEFAULT,
  accentForeground: '#212529',
  muted: '#f5f5f5',
  mutedForeground: '#757575',
  success: karmaTheme.accent.success.DEFAULT,
  warning: karmaTheme.accent.warning.DEFAULT,
  error: karmaTheme.accent.error.DEFAULT,
  info: karmaTheme.accent.info.DEFAULT,
};

export const darkTheme = {
  background: '#1a202c',
  foreground: '#f8f9fa',
  card: '#2d3748',
  cardForeground: '#f8f9fa',
  border: '#4a5568',
  input: '#2d3748',
  primary: '#1976d2', // Slightly lighter for dark mode
  primaryForeground: '#ffffff',
  secondary: '#38b2ac',
  secondaryForeground: '#ffffff',
  accent: '#d6bcfa',
  accentForeground: '#1a202c',
  muted: '#2d3748',
  mutedForeground: '#a0aec0',
  success: '#48bb78',
  warning: '#ecc94b',
  error: '#f56565',
  info: '#4299e1',
};

// WCAG 2.1 AA compliance settings
export const accessibilitySettings = {
  minContrastRatio: 4.5, // For normal text
  minLargeTextContrastRatio: 3, // For large text (18pt+)
  focusOutlineWidth: '3px',
  focusOutlineColor: karmaTheme.primary[500],
  focusOutlineStyle: 'solid',
  motionReduced: {
    transition: 'none',
    animation: 'none',
  },
};

// Medical-specific color tokens
export const medicalColorTokens = {
  clinical: '#3949ab', // Clinical blue
  research: '#00897b', // Research teal
  emergency: '#d32f2f', // Emergency red
  pediatric: '#7cb342', // Pediatric green
  geriatric: '#8d6e63', // Geriatric brown
  cardiology: '#d81b60', // Cardiology pink
  neurology: '#5e35b1', // Neurology purple
  orthopedic: '#f57c00', // Orthopedic orange
  pulmonary: '#00acc1', // Pulmonary cyan
  gastro: '#fdd835', // Gastroenterology yellow
};