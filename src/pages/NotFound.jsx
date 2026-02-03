import { Navbar, Footer } from '../components/common';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="not-found-page">
      <Navbar />
      <main className="container" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <Link to="/">Back to Home</Link>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
