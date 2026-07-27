import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../terms/legal.module.css";

export default function SitemapPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Site Map</h1>
        <div className={styles.content}>
          <h2>Main Pages</h2>
          <ul><li><Link href="/">Home</Link></li><li><Link href="/buy">Buy Properties</Link></li><li><Link href="/rent">Rent Properties</Link></li><li><Link href="/home-loans">Home Loans</Link></li><li><Link href="/blog">Blog</Link></li><li><Link href="/about">About Us</Link></li><li><Link href="/contact">Contact Us</Link></li><li><Link href="/wishlist">My Wishlist</Link></li></ul>
          <h2>Cities</h2>
          <ul><li><Link href="/city/ahmedabad">Ahmedabad</Link></li><li><Link href="/city/surat">Surat</Link></li><li><Link href="/city/vadodara">Vadodara</Link></li><li><Link href="/city/rajkot">Rajkot</Link></li><li><Link href="/city/gandhinagar">Gandhinagar</Link></li><li><Link href="/city/bhavnagar">Bhavnagar</Link></li></ul>
          <h2>Support</h2>
          <ul><li><Link href="/faq">FAQ</Link></li><li><Link href="/terms">Terms & Conditions</Link></li><li><Link href="/privacy">Privacy Policy</Link></li></ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
