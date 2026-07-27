"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./faq.module.css";

const faqs = [
  { q: "How do I search for properties on Runr Properties?", a: "Use the search bar on the homepage or navigate to Buy/Rent pages. Apply filters like city, property type, BHK, and budget to find matching properties." },
  { q: "Are all listings on Runr Properties verified?", a: "Yes, our team verifies every listing before publishing. We ensure accurate photos, correct pricing, and legitimate ownership details." },
  { q: "How do I save properties to my wishlist?", a: "Click the heart icon on any property card to add it to your wishlist. Access your saved properties anytime from the wishlist icon in the navbar." },
  { q: "How can I contact a property owner or agent?", a: "Each property listing has contact details. You can also use the Request Callback feature or call our helpline for assistance." },
  { q: "Is there any charge for using Runr Properties?", a: "Browsing and searching properties is completely free. No hidden charges for buyers or tenants." },
  { q: "How do I list my property on Runr Properties?", a: "Contact us through the Contact page or call our team. We will guide you through the listing process and help you reach verified buyers." },
  { q: "What cities does Runr Properties cover?", a: "We currently operate in Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, and Bhavnagar across Gujarat." },
  { q: "How does the EMI Calculator work?", a: "Visit the Home Loans page, adjust the loan amount, interest rate, and tenure sliders. The calculator instantly shows your estimated monthly EMI." },
];

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.heroLabel}>Support</span>
          <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
          <p className={styles.heroText}>Find answers to common questions about using Runr Properties</p>
        </section>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{faq.q}</span>
                <svg className={styles.faqIcon} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {openFaq === i && <p className={styles.faqAnswer}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
