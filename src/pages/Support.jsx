import { Navbar, Footer } from '../components/common';
import { BuyMeCoffee } from '../components/support/BuyMeCoffee';

export function Support() {
  return (
    <div className="support-page">
      <Navbar />
      <main className="container">
        <BuyMeCoffee />
      </main>
      <Footer />
    </div>
  );
}

export default Support;
