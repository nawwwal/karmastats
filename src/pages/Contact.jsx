import { Navbar, Footer } from '../components/common';
import { ContactSection } from '../components/contact/ContactSection';

export function Contact() {
  return (
    <div className="contact-page">
      <Navbar />
      <main className="container">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default Contact;
