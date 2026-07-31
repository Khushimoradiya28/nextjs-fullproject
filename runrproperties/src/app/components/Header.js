"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";

const navItems = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Home Loans", href: "/home-loans" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isOwner } = useAuth();
  const pathname = usePathname();

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && menuOpen) closeMenu();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen, closeMenu]);

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        <Link href="/" className={styles.brand} aria-label="Runr Properties home">
          <img
            className={styles.logoMark}
            src="/logo/runr-logo-new.svg"
            alt="Runr Properties logo"
            style={{ height: "40px", width: "auto" }}
          />
          {/* <span className={styles.brandText}>
            <strong className={styles.brandName}>RUNR</strong>
            <small className={styles.brandTag}>PROPERTIES</small>
          </span> */}
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/wishlist" className={styles.iconButton} aria-label="Wishlist" title="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 21s-6.5-4.3-8.2-7.2A5.2 5.2 0 0 1 7.5 5.8c1.5 0 2.6.7 3.5 1.8.9-1.1 2-1.8 3.5-1.8a5.2 5.2 0 0 1 5.3 7.2C18.5 16.7 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {wishlistCount > 0 && <span className={styles.wishlistBadge}>{wishlistCount}</span>}
          </Link>

          <Link href="/profile" className={styles.iconButton} aria-label="Profile" title="Profile">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>

          {isAuthenticated ? (
            <Link href="/profile" className={styles.ctaButton}>
              <span>{user?.name}</span>
            </Link>
          ) : (
            <Link href="/login" className={styles.ctaButton}>
              <span>Login / Signup</span>
            </Link>
          )}

          <button
            className={styles.hamburger}
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.overlayVisible : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        className={`${styles.mobileDrawer} ${menuOpen ? styles.drawerOpen : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.brandText}>
            <strong className={styles.brandName}>RUNR</strong>
            <small className={styles.brandTag}>PROPERTIES</small>
          </span>
          <button className={styles.closeButton} onClick={closeMenu} aria-label="Close menu">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.mobileNav}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={`${styles.mobileNavLink} ${pathname === item.href ? styles.mobileNavLinkActive : ""}`} onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.mobileActions}>
          {isAuthenticated ? (
            <Link href="/profile" className={styles.mobileCtaButton} onClick={closeMenu}>
              <span>My Profile</span>
            </Link>
          ) : (
            <Link href="/login" className={styles.mobileCtaButton} onClick={closeMenu}>
              <span>Login / Signup</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
