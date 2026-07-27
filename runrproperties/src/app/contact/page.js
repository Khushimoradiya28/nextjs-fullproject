"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileInput from "../components/MobileInput";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.heroLabel}>Contact Us</span>
          <h1 className={styles.heroTitle}>Get in Touch</h1>
          <p className={styles.heroText}>Have a question or need help finding the right property? We are here for you.</p>
        </section>

        <div className={styles.contentGrid}>
          {/* Contact Form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Send us a Message</h2>
            <p className={styles.formSubtitle}>Fill the form and our team will respond within 24 hours</p>
            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="contact-name">Full Name</label>
                <input id="contact-name" name="name" className={styles.formInput} value={formData.name} onChange={handleChange} placeholder="Your name" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" type="email" className={styles.formInput} value={formData.email} onChange={handleChange} placeholder="you@email.com" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="contact-phone">Phone</label>
                <MobileInput id="contact-phone" name="phone" className={styles.formInput} value={formData.phone} onChange={(val) => setFormData((p) => ({ ...p, phone: val }))} placeholder="10-digit mobile number" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" name="subject" className={styles.formInput} value={formData.subject} onChange={handleChange} placeholder="How can we help?" required />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.formLabel} htmlFor="contact-message">Message</label>
                <textarea id="contact-message" name="message" className={styles.formTextarea} value={formData.message} onChange={handleChange} placeholder="Tell us more..." required />
              </div>
              <button type="submit" className={styles.submitBtn}><span>Send Message</span></button>
            </form>
          </div>

          {/* Contact Info */}
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📍</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>Office Address</h3>
                <p className={styles.infoValue}>409, Business Hub, S.G. Highway,<br />Ahmedabad, Gujarat 380054</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📞</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>Phone</h3>
                <p className={styles.infoValue}><a href="tel:+919876543210">+91 98765 43210</a></p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✉️</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>Email</h3>
                <p className={styles.infoValue}><a href="mailto:hello@runrproperties.com">hello@runrproperties.com</a></p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⏰</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>Working Hours</h3>
                <p className={styles.infoValue}>Mon - Sat: 10:00 AM - 7:00 PM<br />Sunday: Closed</p>
              </div>
            </div>

            {/* <div className={styles.mapCard}>
              <div className={styles.mapPlaceholder}>
                <span>📍</span>
                <p>Map will be integrated here</p>
              </div>
            </div> */}
          </div>
        </div>
      </main>

      <Footer />

      {showSuccess && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,31,61,0.5)",backdropFilter:"blur(4px)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div style={{background:"#fff",borderRadius:"20px",padding:"36px 32px",maxWidth:"420px",width:"100%",textAlign:"center",boxShadow:"0 24px 64px rgba(30,58,95,0.2)"}}>
            <div style={{fontSize:"3rem",marginBottom:"16px"}}>✓</div>
            <h3 style={{margin:"0 0 12px",fontSize:"1.2rem",color:"#10203b"}}>Thank You!</h3>
            <p style={{margin:"0 0 24px",color:"#5a6f85",fontSize:"0.92rem",lineHeight:"1.6"}}>Your information has been sent successfully. Our team will contact you shortly.</p>
            <button onClick={() => setShowSuccess(false)} style={{padding:"12px 28px",borderRadius:"12px",border:"none",background:"linear-gradient(135deg,#3fa66b,#2f8f58)",color:"#fff",fontWeight:700,fontSize:"0.9rem",cursor:"pointer"}}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
