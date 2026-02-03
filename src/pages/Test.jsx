import { Navbar, Footer } from '../components/common';

export function Test() {
  return (
    <div className="test-page">
      <Navbar />
      <main className="container" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#0F766E' }}>KARMASTAT is Working!</h1>
        <p>If you see this, React is rendering correctly.</p>
        <a href="/calculator/descriptive">Go to Descriptive Calculator</a>
      </main>
      <Footer />
    </div>
  );
}

export default Test;
