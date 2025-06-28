# KARMASTAT Cursor Rules Documentation

This document provides an overview of all available Cursor rules in the KARMASTAT project. Each rule is configured as "Agent Requested" type, allowing AI agents to selectively include relevant context based on the task at hand.

## Root Level Rules (`.cursor/rules/`)

### architecture.mdc
Core KARMASTAT architecture patterns, tech stack, and fundamental development standards for statistical calculator applications. This rule covers Next.js 15 App Router implementation, TypeScript strict mode requirements, Tailwind CSS styling standards, project structure organization, code quality standards including error handling patterns, mathematical safety protocols for statistical calculations, performance optimization using React 19 features, import conventions for maintainable codebases, and critical safety patterns for division by zero protection and bounds validation in statistical computations.

### performance.mdc
Performance optimization guidelines for KARMASTAT statistical calculators, covering bundle size management, animation efficiency, and calculation optimization. This rule addresses Core Web Vitals targets including First Contentful Paint and Largest Contentful Paint metrics, bundle optimization strategies with lazy loading for large datasets and conditional mobile component loading, animation performance using CSS transforms and hardware acceleration, calculation efficiency with debounced real-time calculations and Web Worker implementation for complex statistical operations, memory management practices for event listeners and chart instances, and critical monitoring for infinite loops in statistical functions and bundle size growth tracking.

### accessibility.mdc
Accessibility standards for KARMASTAT statistical calculators ensuring WCAG 2.1 AA compliance and inclusive design for all users. This rule encompasses touch target requirements with minimum 44px sizing for mobile devices, color contrast standards ensuring proper ratios for primary orange and secondary blue theme colors, keyboard navigation patterns for all interactive elements, screen reader support with proper ARIA attributes and live regions for calculation results, form accessibility with associated labels and descriptive text for statistical parameters, motion and animation respect for prefers-reduced-motion preferences, focus management with clear indicators and focus trapping in modals, accessible error announcements for validation failures, and statistical context provision through field popovers explaining complex statistical terms.

### enhanced-calculator-patterns.mdc
Comprehensive enhanced calculator implementation patterns for KARMASTAT statistical tools, covering modern UX design, enhanced form systems, and sophisticated results display. This rule establishes standards for enhanced page structure with ToolPageWrapper, auto-calculation with realistic default values, enhanced form implementation with specialized field components (PowerField, AlphaField, PercentageField), card-based organization with themed styling, sophisticated results display with double outline effects and proper text alignment, enhanced tab implementation for multi-option calculators, comprehensive field-level error handling and validation, mobile-first design standards with touch-friendly interactions, performance optimization with debounced calculations, and accessibility compliance with proper ARIA attributes and focus management.

## Component Rules (`components/.cursor/rules/`)

### design-system.mdc
KARMASTAT design system standards for component development, theme usage, and UI consistency across statistical calculator interfaces. This rule establishes the centralized theme system extracted from legacy karmastat_comparative_fixed.html with orange primary and blue secondary colors, layout constraints including maximum two text fields per line and grid system limitations to prevent visual clutter, component patterns using ToolPageWrapper and StatisticalSummary for consistent calculator layouts, typography standards with Inter for body text and Space Mono for technical data, animation guidelines with subtle effects and AnimatedGradient usage, single-column layouts with no scroll-to-top behaviors, and enhanced visualization standards for result displays.

### mobile-patterns.mdc
Mobile-specific component patterns for KARMASTAT, covering touch optimization, haptics integration, gestures, and mobile-first design for statistical calculators. This rule addresses touch optimization standards with minimum target sizes and safe area support for iOS devices, mobile device detection using custom hooks for conditional rendering, haptic feedback integration for button interactions and calculation success/error states, touch gesture patterns with swipe gestures for navigation and threshold configuration, mobile layout components including BottomNav and QuickCalcFAB, responsive breakpoints with mobile-first approach, native mobile navigation patterns, microinteractions for enhanced user experience, and PWA features for app-like functionality.

### enhanced-form-patterns.mdc
Enhanced form implementation patterns for KARMASTAT statistical calculators with improved UX, larger typography, specialized input variants, and comprehensive validation. This rule covers the enhanced form system built around EnhancedInput and StatisticalFormField components, specialized input variants (percentage, sample-size, number, probability, time, currency) with contextual icons and validation, larger font sizes and improved typography hierarchy for accessibility, contextual placeholders and realistic default values tailored to each calculator type, strict layout constraints with maximum 2 fields per row, comprehensive field-level error highlighting and validation feedback, card-based organization with themed styling, PDF upload integration with parameter extraction, and mobile-first accessibility compliance with proper touch targets and ARIA attributes.

### enhanced-results-patterns.mdc
Enhanced results display patterns for KARMASTAT calculators with sophisticated visual design, double outline effects, and comprehensive interpretations. This rule establishes standards for enhanced results components (EnhancedResultsDisplay, ModernResultsDisplay, StatisticalSummary), larger typography hierarchy with proper result categorization, sophisticated card layouts with double outline effects using ring shadows and themed coloring, proper interpretation card structure using Card components instead of Alert for better alignment, consolidated results table information with enhanced typography, comprehensive validation results integration with field-level error communication, standardized PDF export functionality, advanced visualization integration with charts and insights, mobile optimization with touch-friendly design, and consistent theme integration with proper light/dark mode support.

### form-patterns.mdc
Form implementation patterns for KARMASTAT statistical calculators using react-hook-form and Zod validation with consistent UX patterns. This rule covers standard form setup with zodResolver integration, form layout standards enforcing maximum two fields per row with mobile-first grid systems, validation patterns for statistical parameters including cross-field validation and refinement logic, error handling with user-friendly messages and calculation safety, form component structure with proper button states and loading indicators, input type optimization with appropriate numeric keyboards and decimal precision, auto-focus management for improved user experience, and integration with the centralized validation system.

## Library Rules (`lib/.cursor/rules/`)

### validation-patterns.mdc
Enhanced Zod validation schema patterns for KARMASTAT statistical calculation libraries, ensuring type safety, proper statistical parameter validation, and improved UX with field-level error handling. This rule establishes enhanced statistical parameter validation schemas with realistic defaults and better error messages, cross-field validation with realistic constraints for clinical trials and diagnostic tests, enhanced sample size validation with safety bounds, comprehensive field-level error handling for enhanced UX with ValidationResult types and FieldError interfaces, enhanced form integration with React Hook Form including real-time validation, realistic default values by calculator type with context-aware configurations, bulletproof number input validation with safeToFixed helper functions, warning systems for non-critical issues, and enhanced schema composition for reusability across different calculator types.

### mathematical-safety.mdc
Mathematical safety patterns for KARMASTAT statistical calculations, preventing division by zero, infinite loops, and numerical instability. This rule addresses division by zero protection using safe division utilities and denominator checking, convergence safety in iterative algorithms with maximum iteration limits and tolerance checking, bounds validation for all statistical parameters with appropriate error messages, numerical stability using proven algorithms for correlation calculations and two-pass methods, error boundaries for wrapping dangerous calculations with graceful failure handling, memory management for large statistical datasets with chunked processing, statistical constants safety to prevent magic numbers, and critical monitoring points for known mathematical vulnerabilities in the codebase.

## Calculator Rules (`app/(calc)/.cursor/rules/`)

### calculator-patterns.mdc
Calculator implementation patterns for KARMASTAT statistical tools, covering page structure, results display, and calculator-specific UX patterns. This rule provides page structure templates using ToolPageWrapper and StatisticalSummary components, results display standards with ModernResultsDisplay and proper metric categorization, calculator categories including sample size calculators and regression analysis tools, navigation patterns with proper breadcrumb implementation, error handling specific to calculation failures with Alert components, calculator-specific features including PDF export and parameter tooltips with statistical explanations, performance considerations for debounced calculations and memoized results, real-time validation with immediate parameter feedback, and mobile optimization with touch-friendly controls and haptic feedback integration.

---

## Usage Guidelines

All rules are configured as **Agent Requested** type, meaning they will only be included when the AI agent determines they are relevant to the current task. To manually include a specific rule, reference it using `@ruleName` in your prompt.

### Rule Selection Criteria

- **Architecture**: Include when working with project structure, tech stack, or fundamental patterns
- **Performance**: Include when optimizing speed, bundle size, or animation performance
- **Accessibility**: Include when implementing UI components or ensuring WCAG compliance
- **Enhanced Calculator Patterns**: Include when developing or modernizing statistical calculators with enhanced UX
- **Design System**: Include when working with components, theming, or visual consistency
- **Mobile Patterns**: Include when developing mobile-specific features or responsive design
- **Enhanced Form Patterns**: Include when implementing enhanced forms with improved UX and validation
- **Enhanced Results Patterns**: Include when working on results display with sophisticated visual design
- **Form Patterns**: Include when implementing basic forms, validation, or user input handling
- **Validation Patterns**: Include when working with enhanced data validation, schemas, or type safety
- **Mathematical Safety**: Include when implementing statistical calculations or mathematical operations
- **Calculator Patterns**: Include when developing new calculators or modifying existing ones

### Enhanced UX Standards

The enhanced rules (enhanced-calculator-patterns, enhanced-form-patterns, enhanced-results-patterns, validation-patterns) represent the modern UX standards for KARMASTAT, including:

- **Larger Typography**: Minimum text-base for labels, h-12 for inputs, enhanced readability
- **Specialized Form Components**: PowerField, AlphaField, PercentageField with contextual validation
- **Field-Level Error Handling**: Real-time validation with visual error highlighting
- **Realistic Default Values**: Context-appropriate defaults that auto-calculate on page load
- **Sophisticated Visual Design**: Double outline effects, themed card styling, proper light/dark mode
- **Mobile-First Accessibility**: Touch-friendly targets, proper spacing, comprehensive ARIA support
- **Enhanced Results Display**: Categorized results with interpretations and export functionality

### Context Optimization

Each rule is designed to be self-contained while referencing relevant files using `@filename` notation. Rules can be combined when multiple aspects are relevant to the current development task, ensuring comprehensive guidance without overwhelming context.

### Implementation Priority

When modernizing existing calculators or creating new ones, prioritize the enhanced rules to ensure consistent, high-quality UX across the application:

1. **enhanced-calculator-patterns**: Overall structure and implementation approach
2. **enhanced-form-patterns**: Form design and validation standards
3. **enhanced-results-patterns**: Results display and interpretation standards
4. **validation-patterns**: Enhanced validation and error handling
5. **accessibility**: WCAG compliance and inclusive design
6. **mobile-patterns**: Touch optimization and mobile-specific features
