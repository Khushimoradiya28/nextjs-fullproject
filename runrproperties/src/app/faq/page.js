"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiHelpCircle } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./faq.module.css";

const fallbackFaqs = [
  { q: "How do I search for properties on runr properties?", a: "Use the search bar on the homepage or navigate to Buy/Rent pages. Apply filters like city, property type, BHK, and budget to find matching properties." },
  { q: "Are all listings on runr properties verified?", a: "Yes, our team verifies every listing before publishing. We ensure accurate photos, correct pricing, and legitimate ownership details." },
  { q: "How do I save properties to my wishlist?", a: "Click the heart icon on any property card to add it to your wishlist. Access your saved properties anytime from the wishlist icon in the navbar." },
  { q: "How can I contact a property owner or agent?", a: "Each property listing has contact details. You can also use the Request Callback feature or call our helpline for assistance." },
  { q: "Is there any charge for using runr properties?", a: "Browsing and searching properties is completely free. No hidden charges for buyers or tenants." },
  { q: "How do I list my property on runr properties?", a: "Contact us through the Contact page or call our team. We will guide you through the listing process and help you reach verified buyers." },
  { q: "What cities does runr properties cover?", a: "We currently operate in Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, and Bhavnagar across Gujarat." },
  { q: "How does the EMI Calculator work?", a: "Visit the Home Loans page, adjust the loan amount, interest rate, and tenure sliders. The calculator instantly shows your estimated monthly EMI." },
];

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [dynamicFaqs, setDynamicFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFaqs = () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${API_BASE}/faqs/public`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Not ok");
        return r.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const formatted = data.data.map((item) => ({
            q: item.question,
            a: item.answer,
            id: item._id,
          }));
          setDynamicFaqs(formatted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();

    const handleFocus = () => {
      fetchFaqs();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const displayList = dynamicFaqs.length > 0 ? dynamicFaqs : (loading ? [] : fallbackFaqs);

  return (
    <div className={styles.page}>
      <Header />

      {/* Breadcrumb Bar */}
      <div className={styles.breadcrumbBar}>
        <Link href="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>FAQs</span>
      </div>

      <main className={styles.main}>
        {/* Standard Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <FiHelpCircle size={14} />
            <span>Support & Help Center</span>
          </div>
          <h1 className={styles.heroTitle}>
            Frequently Asked <span className={styles.highlight}>Questions</span>
          </h1>
          <p className={styles.heroText}>
            Find instant answers to common questions about buying, renting, home loans, and managing properties on RunR.
          </p>
        </section>

        <div className={styles.faqList}>
          {displayList.map((faq, i) => {
            const itemId = faq.id || i;
            const isOpen = openFaq === itemId;
            return (
              <div
                key={itemId}
                className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ""}`}
                onMouseEnter={() => setOpenFaq(itemId)}
                onMouseLeave={() => setOpenFaq(null)}
              >
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(isOpen ? null : itemId)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <svg className={styles.faqIcon} viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isOpen && <p className={styles.faqAnswer}>{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
