import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
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
      <div className={styles.glowLine}></div>

      <div className={styles.footerContainer}>
        {/* Brand Section */}
        <div className={styles.brandSection}>
          <Link href="/" className={styles.logo}>
            <img
              className={styles.logoMark}
              src="/logo/footer-logo-white.png"
              alt="Runr Properties logo"
              style={{ height: "36px", width: "auto" }}
            />
          </Link>
          <p className={styles.tagline}>
            Your trusted partner in finding the perfect property.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linkCol}>
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link href="/buy">Buy Properties</Link>
            </li>
            <li>
              <Link href="/rent">Rent Properties</Link>
            </li>
            <li>
              <Link href="/home-loans">Home Loans</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Popular Cities */}
        <div className={styles.linkCol}>
          <h3>Popular Cities</h3>
          <ul>
            <li>
              <Link href="/city/ahmedabad">Ahmedabad</Link>
            </li>
            <li>
              <Link href="/city/surat">Surat</Link>
            </li>
            <li>
              <Link href="/city/vadodara">Vadodara</Link>
            </li>
            <li>
              <Link href="/city/rajkot">Rajkot</Link>
            </li>
            <li>
              <Link href="/city/gandhinagar">Gandhinagar</Link>
            </li>
            <li>
              <Link href="/city/bhavnagar">Bhavnagar</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className={styles.linkCol}>
          <h3>Support</h3>
          <ul>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/terms">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/sitemap">Site Map</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.contactCol}>
          <h3>Contact Us</h3>
          <ul>
            <li>
              <HiOutlinePhone className={styles.icon} />
              <a href="tel:+919876543210">+91 98765 43210</a>
            </li>
            <li>
              <HiOutlineMail className={styles.icon} />
              <a href="mailto:hello@runrproperties.com">
                hello@runrproperties.com
              </a>
            </li>
            <li>
              <HiOutlineLocationMarker className={styles.icon} />
              <span>409, Business Hub, Ahmedabad, Gujarat</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>
          © {new Date().getFullYear()} Runr Properties. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
