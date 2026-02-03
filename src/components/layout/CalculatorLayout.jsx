import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../common';

export function CalculatorLayout({
  title,
  subtitle,
  navLinks = [],
  themeClass = '',
  children
}) {
  return (
    <div className={`calculator-page ${themeClass}`}>
      <CalculatorHeader
        title={title}
        subtitle={subtitle}
        navLinks={navLinks}
        themeClass={themeClass}
      />
      <main className="container" style={{ padding: '2rem' }}>
        {children}
      </main>
      <SimpleFooter />
      <ThemeToggle variant="floating" />
    </div>
  );
}

export default CalculatorLayout;
