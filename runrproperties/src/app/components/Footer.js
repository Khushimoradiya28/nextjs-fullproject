"use client";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaPaperPlane,
  FaBuilding,
} from "react-icons/fa";
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Background Motion Layer */}
      <div className={styles.animatedBgContainer}>
        <div className={`${styles.cloud} ${styles.cloud1}`}></div>
        <div className={`${styles.cloud} ${styles.cloud2}`}></div>
        <div className={styles.architecturalGrid}></div>
        <div className={styles.skylineWrapper}>
          <div className={styles.movingSkyline}></div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* Top Hero Banner */}
        <div className={styles.heroBanner}>
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <FaBuilding /> <span>Gujarat's #1 Real Estate Network</span>
            </div>
            <h2 className={styles.animatedHeading}>Find Your Dream Property Faster</h2>
            <p className={styles.animatedText}>
              Get exclusive alerts for new apartments, villas, & commercial hubs.
            </p>
          </div>
          <form className={styles.heroForm} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address..." required />
            <button type="submit">
              <span>Get Alerts</span>
              <FaPaperPlane />
            </button>
          </form>
        </div>

        {/* Main Links Grid */}
        <div className={styles.footerContainer}>
          {/* Brand Col */}
          <div className={styles.brandSection}>
            <Link href="/" className={styles.logo}>
              <img
                className={styles.logoMark}
                src="/logo/footer-logo-white.png"
                alt="Runr Properties logo"
                style={{ height: "38px", width: "auto" }}
              />
            </Link>
            <p className={styles.tagline}>
              Your trusted partner in finding verified residential & commercial properties across Gujarat.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linkCol}>
            <h3 className={styles.animatedTitle}>Quick Links</h3>
            <ul>
              <li><Link href="/buy">Buy Properties</Link></li>
              <li><Link href="/rent">Rent Properties</Link></li>
              <li><Link href="/home-loans">Home Loans</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div className={styles.linkCol}>
            <h3 className={styles.animatedTitle}>Popular Cities</h3>
            <ul>
              <li><Link href="/city/ahmedabad">Ahmedabad</Link></li>
              <li><Link href="/city/surat">Surat</Link></li>
              <li><Link href="/city/vadodara">Vadodara</Link></li>
              <li><Link href="/city/rajkot">Rajkot</Link></li>
              <li><Link href="/city/gandhinagar">Gandhinagar</Link></li>
              <li><Link href="/city/bhavnagar">Bhavnagar</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className={styles.linkCol}>
            <h3 className={styles.animatedTitle}>Support</h3>
            <ul>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/sitemap">Site Map</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className={styles.contactCol}>
            <h3 className={styles.animatedTitle}>Get In Touch</h3>
            <ul>
              <li>
                <span className={styles.contactIcon}><HiOutlinePhone /></span>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li>
                <span className={styles.contactIcon}><HiOutlineMail /></span>
                <a href="mailto:hello@runrproperties.com">hello@runrproperties.com</a>
              </li>
              <li>
                <span className={styles.contactIcon}><HiOutlineLocationMarker /></span>
                <span>409, Business Hub, Ahmedabad, Gujarat</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} Runr Properties. All Rights Reserved.</p>
          <div className={styles.legalLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms">Terms of Service</Link>
            <span>•</span>
            <Link href="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}