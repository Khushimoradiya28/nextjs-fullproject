"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileInput from "../components/MobileInput";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

      <main className={styles.main}>
        {/* Standard Website Page Header */}
        <section className={styles.pageHeader}>
          <span className={styles.sectionTag}>CONTACT US</span>
          <h1 className={styles.pageTitle}>Get in Touch</h1>
          <p className={styles.pageSubtitle}>
            Have a question or need help finding the right property? We are here for you.
          </p>
        </section>

        {/* Main Single Section Card matching Website Theme */}
        <div className={styles.contactWrapper}>
          <div className={styles.innerGrid}>
            {/* Left: Contact Form */}
            <div className={styles.formSection}>
              <div className={styles.formHeaderBox}>
                <h2 className={styles.formHeading}>Send us a Message</h2>
                <p className={styles.formSubheading}>Fill the form and our team will respond within 24 hours.</p>
              </div>

              <form className={styles.formGrid} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="contact-name">Full Name <span className={styles.star}>*</span></label>
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

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="contact-email">Email <span className={styles.star}>*</span></label>
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

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="contact-phone">Phone</label>
                  <MobileInput
                    id="contact-phone"
                    name="phone"
                    className={styles.formInput}
                    value={formData.phone}
                    onChange={(val) => setFormData((p) => ({ ...p, phone: val }))}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="contact-subject">Subject <span className={styles.star}>*</span></label>
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

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel} htmlFor="contact-message">
                    Message <span className={styles.optionalText}>(Optional)</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className={styles.formTextarea}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more..."
                  />
                </div>

                {errorMessage && (
                  <div className={styles.errorAlert}>
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className={styles.buttonRow}>
                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Contact Information */}
            <div className={styles.infoSection}>
              <div className={styles.infoBox}>
                <h3 className={styles.infoSectionTitle}>Office Details</h3>
                <p className={styles.infoSectionDesc}>Feel free to contact or visit our office.</p>

                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrap}>📍</div>
                    <div className={styles.infoText}>
                      <span className={styles.infoItemLabel}>Office Address</span>
                      <p className={styles.infoItemVal}>409, Business Hub, S.G. Highway,<br />Ahmedabad, Gujarat 380054</p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrap}>📞</div>
                    <div className={styles.infoText}>
                      <span className={styles.infoItemLabel}>Phone</span>
                      <p className={styles.infoItemVal}>
                        <a href="tel:+919876543210">+91 98765 43210</a>
                      </p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrap}>✉️</div>
                    <div className={styles.infoText}>
                      <span className={styles.infoItemLabel}>Email</span>
                      <p className={styles.infoItemVal}>
                        <a href="mailto:hello@runrproperties.com">hello@runrproperties.com</a>
                      </p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrap}>⏰</div>
                    <div className={styles.infoText}>
                      <span className={styles.infoItemLabel}>Working Hours</span>
                      <p className={styles.infoItemVal}>Mon - Sat: 10:00 AM - 7:00 PM<br />Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Success Modal */}
      {showSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalCheck}>✓</div>
            <h3 className={styles.modalTitle}>Thank You!</h3>
            <p className={styles.modalText}>Your information has been sent successfully. Our team will contact you shortly.</p>
            <button onClick={() => setShowSuccess(false)} className={styles.modalCloseBtn}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
