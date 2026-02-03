import { Navbar, Footer } from '../components/common';
import { StudyDetector, CalculatorGrid, QuickAccess } from '../components/home';

export function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <main className="container" style={{ padding: '3rem 2rem' }}>
        <StudyDetector />
        <CalculatorGrid />
        <QuickAccess />
      </main>

      <Footer />
    </div>
  );
}

export default Home;
