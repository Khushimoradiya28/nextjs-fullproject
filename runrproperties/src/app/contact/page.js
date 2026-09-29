"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileInput from "../components/MobileInput";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedType, setCopiedType] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleCopy = (text, type) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowSuccess(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Contact submission error:", err);
      setErrorMessage("Could not connect to the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Standard Minimal Breadcrumb Bar */}
      <div className={styles.breadcrumbBar}>
        <Link href="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Contact</span>
      </div>

      <main className={styles.main}>
        {/* Standard Website Hero Section */}
        <section className={styles.hero}>
          <span className={styles.heroBadge}>Customer Support</span>
          <h1 className={styles.heroTitle}>
            Get in <span className={styles.highlight}>Touch With Us</span>
          </h1>
          <p className={styles.heroText}>
            Have a question, need assistance with buying or selling, or want expert consultation? We are here for you.
          </p>
        </section>

        {/* Contact Form & Office Info Card */}
        <div className={styles.contactWrapper}>
          <div className={styles.innerGrid}>
            {/* Left: Contact Form */}
            <div className={styles.formSection}>
              <div className={styles.formHeaderBox}>
                <div className={styles.formBadge}>Direct Inquiry</div>
                <h2 className={styles.formHeading}>Send us a Message</h2>
                <p className={styles.formSubheading}>Fill the form below and our team will respond within 24 hours.</p>
              </div>

              <form className={styles.formGrid} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contact-name">
                      Full Name <span className={styles.star}>*</span>
                    </label>
                    <div className={styles.inputWithIcon}>
                      <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        id="contact-name"
                        name="name"
                        className={styles.formInput}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contact-email">
                      Email <span className={styles.star}>*</span>
                    </label>
                    <div className={styles.inputWithIcon}>
                      <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        className={styles.formInput}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contact-phone">
                      Phone
                    </label>
                    <div className={styles.inputWithIcon}>
                      <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <MobileInput
                        id="contact-phone"
                        name="phone"
                        className={styles.formInput}
                        value={formData.phone}
                        onChange={(val) => setFormData((p) => ({ ...p, phone: val }))}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contact-subject">
                      Subject <span className={styles.star}>*</span>
                    </label>
                    <div className={styles.inputWithIcon}>
                      <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <input
                        id="contact-subject"
                        name="subject"
                        className={styles.formInput}
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth} ${styles.textareaGroup}`}>
                  <label className={styles.formLabel} htmlFor="contact-message">
                    Message <span className={styles.optionalText}>(Optional)</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className={styles.formTextarea}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your property requirements..."
                  />
                </div>

                {errorMessage && (
                  <div className={styles.errorAlert}>
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className={styles.buttonRow}>
                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <span>Send Message</span>
                        <svg className={styles.btnArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Premium Modern Office Details Card */}
            <div className={styles.infoSection}>
              {/* Header Box with Status */}
              <div className={styles.infoHeader}>
                <div className={styles.statusPill}>
                  <span className={styles.statusPulse} />
                  <span>Open & Responding</span>
                </div>
                <h3 className={styles.infoSectionTitle}>Office Details</h3>
                <p className={styles.infoSectionDesc}>Feel free to contact or visit our experience center.</p>
              </div>

              {/* Info Tiles */}
              <div className={styles.infoTilesList}>
                {/* Tile 1: Address */}
                <div className={styles.infoTile}>
                  <div className={`${styles.tileIconBox} ${styles.iconSky}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className={styles.tileBody}>
                    <div className={styles.tileHeaderRow}>
                      <span className={styles.tileLabel}>Office Address</span>
                      <a
                        href="https://maps.google.com/?q=S+G+Highway+Ahmedabad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.tileActionLink}
                      >
                        <span>Map ↗</span>
                      </a>
                    </div>
                    <p className={styles.tileValue}>
                      409, Business Hub, S.G. Highway, Ahmedabad, Gujarat 380054
                    </p>
                  </div>
                </div>

                {/* Tile 2: Phone */}
                <div className={styles.infoTile}>
                  <div className={`${styles.tileIconBox} ${styles.iconEmerald}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className={styles.tileBody}>
                    <div className={styles.tileHeaderRow}>
                      <span className={styles.tileLabel}>Phone Helpline</span>
                      <button
                        type="button"
                        onClick={() => handleCopy("+919876543210", "phone")}
                        className={styles.copyPill}
                      >
                        {copiedType === "phone" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <a href="tel:+919876543210" className={styles.tileValueLink}>
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                {/* Tile 3: Email */}
                <div className={styles.infoTile}>
                  <div className={`${styles.tileIconBox} ${styles.iconIndigo}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className={styles.tileBody}>
                    <div className={styles.tileHeaderRow}>
                      <span className={styles.tileLabel}>Email Support</span>
                      <button
                        type="button"
                        onClick={() => handleCopy("hello@runrproperties.com", "email")}
                        className={styles.copyPill}
                      >
                        {copiedType === "email" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <a href="mailto:hello@runrproperties.com" className={styles.tileValueLink}>
                      hello@runrproperties.com
                    </a>
                  </div>
                </div>

                {/* Tile 4: Hours */}
                <div className={styles.infoTile}>
                  <div className={`${styles.tileIconBox} ${styles.iconAmber}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className={styles.tileBody}>
                    <span className={styles.tileLabel}>Working Hours</span>
                    <p className={styles.tileValue}>
                      Mon - Sat: 10:00 AM - 7:00 PM • <span className={styles.closedTag}>Sunday Closed</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Box: WhatsApp Button */}
              <div className={styles.cardActionBox}>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappActionBtn}
                >
                  <svg className={styles.whatsappIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.539 1.948.814 3.031.815h.001c3.181 0 5.768-2.586 5.768-5.766.001-3.181-2.586-5.767-5.768-5.767zm3.364 8.167c-.144.405-.837.774-1.17.824-.312.046-.71.07-2.072-.497-1.745-.724-2.871-2.489-2.958-2.605-.088-.117-.706-.94-.706-1.792s.445-1.272.604-1.447c.159-.175.347-.219.463-.219.116 0 .232.001.333.006.107.005.25.04.39.377.145.348.492 1.202.535 1.29.043.088.072.19.014.305-.058.117-.087.19-.174.292-.087.102-.183.228-.261.306-.087.087-.179.182-.077.357.101.175.452.747.969 1.208.666.594 1.229.778 1.403.865.174.088.275.073.377-.044.101-.116.435-.508.55-.682.116-.174.232-.145.39-.087.159.058 1.014.478 1.188.565.174.087.29.131.333.204.043.073.043.42-.101.825z" />
                  </svg>
                  <span>Chat with Us on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map Section */}
        <section className={styles.mapSection}>
          <div className={styles.mapHeader}>
            <div className={styles.mapTitleBox}>
              <h3 className={styles.mapTitle}>Find Us on Google Maps</h3>
              <p className={styles.mapSubtitle}>409, Business Hub, S.G. Highway, Ahmedabad</p>
            </div>
            <a
              href="https://maps.google.com/?q=S+G+Highway+Ahmedabad"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.directionsBtn}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={styles.directionsIcon}>
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              <span>Get Directions</span>
              <span className={styles.directionsArrow}>↗</span>
            </a>
          </div>

          <div className={styles.mapContainer}>
            <iframe
              title="Runr Properties Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117498.42318712173!2d72.48398188289062!3d23.033866299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sSarkhej%20-%20Gandhinagar%20Hwy%2C%20Ahmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={styles.mapIframe}
            />
          </div>
        </section>
      </main>

      <Footer />

      {/* Success Modal */}
      {showSuccess && (
        <div className={styles.modalOverlay} onClick={() => setShowSuccess(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalCheck}>✓</div>
            <h3 className={styles.modalTitle}>Thank You!</h3>
            <p className={styles.modalText}>
              Your message has been sent successfully. Our team will contact you shortly.
            </p>
            <button onClick={() => setShowSuccess(false)} className={styles.modalCloseBtn}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
