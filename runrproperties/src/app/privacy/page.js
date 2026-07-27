import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../terms/legal.module.css";

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <div className={styles.content}>
          <p><strong>Last Updated:</strong> July 2025</p>
          <h2>1. Information We Collect</h2>
          <p>We collect personal information like name, email, phone number when you create an account, submit inquiries, or use our services.</p>
          <h2>2. How We Use Your Information</h2>
          <p>Your information is used to provide property recommendations, process inquiries, send relevant updates, and improve our platform experience.</p>
          <h2>3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.</p>
          <h2>4. Third-Party Sharing</h2>
          <p>We do not sell your personal data. Information may be shared with property owners/agents only when you express interest in a listing.</p>
          <h2>5. Your Rights</h2>
          <p>You can request access, correction, or deletion of your personal data at any time by contacting us at hello@runrproperties.com</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
