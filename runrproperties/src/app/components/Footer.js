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
            <svg
              className={styles.logoMark}
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Runr Properties logo"
            >
              <defs>
                <linearGradient
                  id="runrBadgeFooter"
                  x1="8"
                  y1="6"
                  x2="56"
                  y2="58"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#1E3A5F" />
                  <stop offset="1" stopColor="#2B5278" />
                </linearGradient>
                <linearGradient
                  id="runrRoofFooter"
                  x1="18"
                  y1="16"
                  x2="46"
                  y2="30"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3FA66B" />
                  <stop offset="1" stopColor="#2F8F58" />
                </linearGradient>
                <linearGradient
                  id="runrWallFooter"
                  x1="22"
                  y1="28"
                  x2="42"
                  y2="48"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#F8FAFC" />
                  <stop offset="1" stopColor="#E8EEF5" />
                </linearGradient>
                <linearGradient
                  id="runrAccentFooter"
                  x1="14"
                  y1="50"
                  x2="50"
                  y2="50"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3FA66B" />
                  <stop offset="1" stopColor="#5CC48A" />
                </linearGradient>
              </defs>

              <rect
                x="4"
                y="4"
                width="56"
                height="56"
                rx="17"
                fill="url(#runrBadgeFooter)"
              />
              <rect
                x="4.75"
                y="4.75"
                width="54.5"
                height="54.5"
                rx="16"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1.5"
              />

              <path
                d="M32 13.5 49.5 27.2V46.5c0 .55-.45 1-1 1H15.5c-.55 0-1-.45-1-1V27.2L32 13.5Z"
                fill="url(#runrWallFooter)"
              />
              <path
                d="M32 13.5 49.5 27.2H14.5L32 13.5Z"
                fill="url(#runrRoofFooter)"
              />
              <path
                d="M32 16.2 45.8 26.4H18.2L32 16.2Z"
                fill="rgba(255,255,255,0.22)"
              />

              <rect
                x="20.5"
                y="31"
                width="7.5"
                height="7.5"
                rx="1.4"
                fill="#1E3A5F"
                opacity="0.88"
              />
              <rect
                x="36"
                y="31"
                width="7.5"
                height="7.5"
                rx="1.4"
                fill="#1E3A5F"
                opacity="0.88"
              />
              <rect
                x="21.3"
                y="31.8"
                width="2.2"
                height="2.2"
                rx="0.4"
                fill="#FFFFFF"
                opacity="0.9"
              />
              <rect
                x="36.8"
                y="31.8"
                width="2.2"
                height="2.2"
                rx="0.4"
                fill="#FFFFFF"
                opacity="0.9"
              />

              <path
                d="M29.2 38.2h5.6c1.45 0 2.6 1.15 2.6 2.6v5.7H29.2V38.2Z"
                fill="#1E3A5F"
              />
              <circle cx="35.1" cy="43.1" r="0.9" fill="#3FA66B" />

              <path
                d="M17.5 49.2c4.8 2.2 9.7 2.2 14.5 0 4.8-2.2 9.7-2.2 14.5 0"
                stroke="url(#runrAccentFooter)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              <circle
                cx="47.8"
                cy="18.2"
                r="7.2"
                fill="#3FA66B"
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              <path
                d="M45.1 18.2 47.1 20.2 50.6 16.4"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h2>RUNR</h2>
              <span>PROPERTIES</span>
            </div>
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
