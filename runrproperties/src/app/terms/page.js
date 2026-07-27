import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./legal.module.css";

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Terms & Conditions</h1>
        <div className={styles.content}>
          <p><strong>Last Updated:</strong> July 2025</p>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Runr Properties, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.</p>
          <h2>2. Use of Platform</h2>
          <p>Runr Properties provides a platform for property listings. We do not own, sell, or manage any properties listed on our platform. All listings are provided by third-party sellers, agents, or builders.</p>
          <h2>3. User Responsibilities</h2>
          <p>Users must provide accurate information when creating accounts or making inquiries. Any misuse of the platform may result in account suspension.</p>
          <h2>4. Disclaimer</h2>
          <p>While we verify listings to the best of our ability, Runr Properties does not guarantee the accuracy of all information provided by property listers.</p>
          <h2>5. Contact</h2>
          <p>For any questions regarding these terms, please contact us at hello@runrproperties.com</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
