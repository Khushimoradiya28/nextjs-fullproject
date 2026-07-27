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
          <svg
            className={styles.logoMark}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Runr Properties logo"
          >
            <defs>
              <linearGradient id="runrBadge" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1E3A5F" /><stop offset="1" stopColor="#2B5278" />
              </linearGradient>
              <linearGradient id="runrRoof" x1="18" y1="16" x2="46" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3FA66B" /><stop offset="1" stopColor="#2F8F58" />
              </linearGradient>
              <linearGradient id="runrWall" x1="22" y1="28" x2="42" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F8FAFC" /><stop offset="1" stopColor="#E8EEF5" />
              </linearGradient>
              <linearGradient id="runrAccent" x1="14" y1="50" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3FA66B" /><stop offset="1" stopColor="#5CC48A" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="56" height="56" rx="17" fill="url(#runrBadge)" />
            <rect x="4.75" y="4.75" width="54.5" height="54.5" rx="16" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
            <path d="M32 13.5 49.5 27.2V46.5c0 .55-.45 1-1 1H15.5c-.55 0-1-.45-1-1V27.2L32 13.5Z" fill="url(#runrWall)" />
            <path d="M32 13.5 49.5 27.2H14.5L32 13.5Z" fill="url(#runrRoof)" />
            <path d="M32 16.2 45.8 26.4H18.2L32 16.2Z" fill="rgba(255,255,255,0.22)" />
            <rect x="20.5" y="31" width="7.5" height="7.5" rx="1.4" fill="#1E3A5F" opacity="0.88" />
            <rect x="36" y="31" width="7.5" height="7.5" rx="1.4" fill="#1E3A5F" opacity="0.88" />
            <rect x="21.3" y="31.8" width="2.2" height="2.2" rx="0.4" fill="#FFFFFF" opacity="0.9" />
            <rect x="36.8" y="31.8" width="2.2" height="2.2" rx="0.4" fill="#FFFFFF" opacity="0.9" />
            <path d="M29.2 38.2h5.6c1.45 0 2.6 1.15 2.6 2.6v5.7H29.2V38.2Z" fill="#1E3A5F" />
            <circle cx="35.1" cy="43.1" r="0.9" fill="#3FA66B" />
            <path d="M17.5 49.2c4.8 2.2 9.7 2.2 14.5 0 4.8-2.2 9.7-2.2 14.5 0" stroke="url(#runrAccent)" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="47.8" cy="18.2" r="7.2" fill="#3FA66B" stroke="#FFFFFF" strokeWidth="1.6" />
            <path d="M45.1 18.2 47.1 20.2 50.6 16.4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.brandText}>
            <strong className={styles.brandName}>RUNR</strong>
            <small className={styles.brandTag}>PROPERTIES</small>
          </span>
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
