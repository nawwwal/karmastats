# UI/UX Standardization Documentation

## Overview

This document outlines the UI/UX standardization implemented for the Karmastat project, focusing on creating a consistent, accessible, and professional medical-focused design system.

## Theme System

### Color Palette

The Karmastat color system is based on a professional medical color scheme:

- **Primary Colors**: Medical blues (#146C94, #19A7CE)
- **Secondary Colors**: Cool grays (#F8F9FA, #E9ECEF)
- **Accent Colors**: 
  - Success: #4CAF50
  - Error: #F44336
  - Warning: #FFEB3B
  - Info: #03A9F4

### Typography

- **Primary Font**: Inter - Clean, professional sans-serif for body text
- **Secondary Font**: Space Mono - Monospace font for code, data, and technical information
- **Heading Font**: Montserrat - Bold, distinctive font for headings

Font sizes follow a consistent scale from xs (0.75rem) to 6xl (3.75rem).

### Spacing System

A consistent spacing system using multiples of 0.25rem, from 0 (0) to 64 (16rem).

### Shadows

Standardized shadow system from sm to 2xl, plus inner and none options.

### Border Radius

Consistent border radius system from none to full, with default set to 0.25rem.

## Component Library

All components have been standardized to use the central theme, ensuring consistency across the application. Key components include:

- **Button**: Multiple variants (default, outline, secondary, ghost, link)
- **Card**: Consistent card design for content grouping
- **Form Elements**: Standardized inputs, selects, textareas
- **Navigation**: Sidebar, main navigation, breadcrumbs
- **Tabs**: For content organization
- **Tables**: For data display

## Navigation Structure

### Sidebar Navigation

The sidebar provides the main navigation structure:

1. **Home**: Main landing page
2. **Calculators**:
   - Sample Size
   - Regression Analysis
   - Disease Modeling
3. **Studies**:
   - Family Health Study
4. **References**:
   - ICMR Guidelines
   - WHO Standards
5. **About Us**

### Breadcrumb Navigation

Breadcrumbs provide contextual navigation, showing the user's current location in the application hierarchy.

### Mobile Responsiveness

The navigation system is fully responsive:
- Desktop: Full sidebar visible
- Mobile: Collapsible sidebar accessible via hamburger menu

## Accessibility Considerations

The design system follows WCAG 2.1 AA compliance:

- **Color Contrast**: All text meets minimum contrast ratios
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA attributes and semantic HTML
- **Reduced Motion**: Respects user preferences for reduced motion
- **Focus Indicators**: Clear focus states for keyboard navigation

## Implementation Timeline

1. **Phase 1 (Completed)**: 
   - Theme configuration
   - Basic component styling
   - Navigation structure

2. **Phase 2 (In Progress)**:
   - Family Health Study module
   - Responsive design improvements
   - Accessibility enhancements

3. **Phase 3 (Planned)**:
   - User preferences system
   - Favorites functionality
   - Advanced search capabilities

## Testing Checklist

- [ ] Component visual consistency across all pages
- [ ] Dark/light mode toggle functionality
- [ ] Responsive design on mobile, tablet, and desktop
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader testing with NVDA and VoiceOver
- [ ] Color contrast verification
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance testing for animations and transitions

## Usage Guidelines

### Adding New Components

When adding new components:
1. Use the existing theme variables
2. Follow the established component patterns
3. Ensure accessibility compliance
4. Test in both light and dark modes

### Page Layout Structure

Standard page layout should follow this structure:
1. Page title and description
2. Main content area
3. Action buttons at the bottom

### Form Design Guidelines

Forms should:
1. Group related fields
2. Provide clear labels
3. Show validation errors inline
4. Include help text where needed
5. Have consistent button placement