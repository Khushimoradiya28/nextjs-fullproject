"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Helper to check if a navigation item is active
  const isNavActive = useCallback(
    (href) => {
      if (!pathname) return false;
      if (href === "/") return pathname === "/";
      if (pathname === href) return true;
      if (pathname.startsWith(`${href}/`)) return true;
      return false;
    },
    [pathname]
  );

  // Handle Scroll Effect for Header (state only updates when boundary is crossed)
  useEffect(() => {
    const handleScroll = () => {
      const isPast = window.scrollY > 20;
      setScrolled((prev) => (prev !== isPast ? isPast : prev));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Lock Body Scroll when Mobile Menu is Open
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

  // Close Menu/Dropdown on Escape Key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (menuOpen) closeMenu();
        if (dropdownOpen) closeDropdown();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen, dropdownOpen, closeMenu, closeDropdown]);

  // User avatar initials
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  // Transparent header on homepage before scroll
  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`${styles.headerWrapper} ${isTransparent ? styles.transparentHeader : styles.scrolled}`}
        role="banner"
      >
      <div className={styles.container}>
        {/* Brand / Logo */}
        <Link href="/" className={styles.brand} aria-label="runr properties home">
          <img
            className={styles.logoMark}
            src={isTransparent ? "/logo/footer-logo-white.png" : "/logo/runr-logo-new.svg"}
            alt="runr properties logo"
          />
        </Link>

        {/* Central Floating Navigation Pill */}
        <nav className={styles.navPill} aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = isNavActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className={styles.actions}>
          {/* Wishlist Button */}
          {user?.role !== "bank_partner" && (
            <Link
              href="/wishlist"
              className={`${styles.iconButton} ${pathname === "/wishlist" ? styles.iconButtonActive : ""}`}
              aria-label="Wishlist"
              title="Saved Properties"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 21s-6.5-4.3-8.2-7.2A5.2 5.2 0 0 1 7.5 5.8c1.5 0 2.6.7 3.5 1.8.9-1.1 2-1.8 3.5-1.8a5.2 5.2 0 0 1 5.3 7.2C18.5 16.7 12 21 12 21z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className={styles.wishlistBadge}>{wishlistCount}</span>
              )}
            </Link>
          )}

          {/* Authenticated User Menu Dropdown */}
          {isAuthenticated ? (
            <div className={styles.userMenuWrapper} ref={dropdownRef}>
              <button
                type="button"
                onClick={toggleDropdown}
                className={`${styles.userPillButton} ${dropdownOpen ? styles.userPillActive : ""} ${
                  pathname?.startsWith("/profile") || pathname?.startsWith("/dashboard")
                    ? styles.userPillRouteActive
                    : ""
                }`}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="User account menu"
              >
                <div className={styles.userAvatar}>
                  {userInitial}
                </div>
                <span className={styles.userName}>{user?.name || "Account"}</span>
                <svg
                  className={`${styles.chevronIcon} ${dropdownOpen ? styles.chevronRotated : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <div className={styles.dropdownMenu} role="menu">
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>{userInitial}</div>
                    <div className={styles.dropdownUserInfo}>
                      <span className={styles.dropdownUserName}>{user?.name}</span>
                      <span
                        className={styles.dropdownUserEmail}
                        title={user?.email || "Logged In"}
                      >
                        {user?.email || "Logged In"}
                      </span>
                      {user?.role && (
                        <span className={styles.dropdownRoleBadge}>
                          {user.role === "bank_partner"
                            ? "Bank Partner"
                            : user.role === "owner"
                            ? "Property Owner"
                            : "Buyer / Tenant"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.dropdownDivider} />

                  <div className={styles.dropdownLinks}>
                    {user?.role === "admin" ? (
                      <Link
                        href="/admin/dashboard"
                        className={`${styles.dropdownItem} ${
                          pathname?.startsWith("/admin") ? styles.dropdownItemActive : ""
                        }`}
                        onClick={closeDropdown}
                        role="menuitem"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : user?.role === "bank_partner" ? (
                      <Link
                        href="/bank-partner/dashboard"
                        className={`${styles.dropdownItem} ${
                          pathname?.startsWith("/bank-partner") ? styles.dropdownItemActive : ""
                        }`}
                        onClick={closeDropdown}
                        role="menuitem"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        <span>Partner Dashboard</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/profile"
                          className={`${styles.dropdownItem} ${
                            pathname === "/profile" ? styles.dropdownItemActive : ""
                          }`}
                          onClick={closeDropdown}
                          role="menuitem"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>My Profile</span>
                        </Link>

                        <Link
                          href="/wishlist"
                          className={`${styles.dropdownItem} ${
                            pathname === "/wishlist" ? styles.dropdownItemActive : ""
                          }`}
                          onClick={closeDropdown}
                          role="menuitem"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 21s-6.5-4.3-8.2-7.2A5.2 5.2 0 0 1 7.5 5.8c1.5 0 2.6.7 3.5 1.8.9-1.1 2-1.8 3.5-1.8a5.2 5.2 0 0 1 5.3 7.2C18.5 16.7 12 21 12 21z" />
                          </svg>
                          <span>Wishlist</span>
                          {wishlistCount > 0 && (
                            <span className={styles.dropdownBadge}>{wishlistCount}</span>
                          )}
                        </Link>

                        {isOwner && (
                          <>
                            <Link
                              href="/dashboard"
                              className={`${styles.dropdownItem} ${
                                pathname === "/dashboard" ? styles.dropdownItemActive : ""
                              }`}
                              onClick={closeDropdown}
                              role="menuitem"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                              </svg>
                              <span>My Dashboard</span>
                            </Link>
                            <Link
                              href="/dashboard/my-properties"
                              className={`${styles.dropdownItem} ${
                                pathname === "/dashboard/my-properties" ? styles.dropdownItemActive : ""
                              }`}
                              onClick={closeDropdown}
                              role="menuitem"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                              </svg>
                              <span>My Properties</span>
                            </Link>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className={styles.dropdownDivider} />

                  <button
                    type="button"
                    className={styles.logoutButton}
                    onClick={() => {
                      closeDropdown();
                      logout();
                    }}
                    role="menuitem"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={`${styles.loginButton} ${
                pathname === "/login" || pathname === "/signup" ? styles.loginButtonActive : ""
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.loginIcon}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Login / Signup</span>
            </Link>
          )}

          {/* Hamburger Menu Toggle Button */}
          <button
            className={styles.hamburger}
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.overlayVisible : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <nav
        className={`${styles.mobileDrawer} ${menuOpen ? styles.drawerOpen : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerHeader}>
          <div className={styles.mobileBrand}>
            <img
              src="/logo/runr-logo-new.svg"
              alt="runr properties"
              style={{ height: "34px", width: "auto" }}
            />
          </div>
          <button className={styles.closeButton} onClick={closeMenu} aria-label="Close menu">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Mobile User Profile Card */}
        {isAuthenticated ? (
          <div className={styles.mobileUserCard}>
            <div className={styles.mobileAvatar}>{userInitial}</div>
            <div className={styles.mobileUserInfo}>
              <span className={styles.mobileUserName}>{user?.name}</span>
              <span className={styles.mobileUserRole}>
                {user?.role === "bank_partner"
                  ? "Bank Partner"
                  : user?.role === "owner"
                  ? "Property Owner"
                  : "Buyer / Tenant"}
              </span>
            </div>
          </div>
        ) : null}

        <div className={styles.mobileNav}>
          <div className={styles.mobileNavSectionTitle}>Navigation</div>
          {navItems.map((item) => {
            const isActive = isNavActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ""}`}
                onClick={closeMenu}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{item.label}</span>
                {isActive && <span className={styles.activeTag}>Current</span>}
              </Link>
            );
          })}

          {isAuthenticated && (
            <>
              <div className={styles.mobileNavSectionTitle} style={{ marginTop: "12px" }}>Account</div>
              <Link
                href="/profile"
                className={`${styles.mobileNavLink} ${pathname === "/profile" ? styles.mobileNavLinkActive : ""}`}
                onClick={closeMenu}
              >
                <span>My Profile</span>
                {pathname === "/profile" && <span className={styles.activeTag}>Current</span>}
              </Link>
              <Link
                href="/wishlist"
                className={`${styles.mobileNavLink} ${pathname === "/wishlist" ? styles.mobileNavLinkActive : ""}`}
                onClick={closeMenu}
              >
                <span>Wishlist</span>
                {wishlistCount > 0 && <span className={styles.activeTag}>{wishlistCount}</span>}
              </Link>
              {isOwner && (
                <Link
                  href="/dashboard"
                  className={`${styles.mobileNavLink} ${pathname?.startsWith("/dashboard") ? styles.mobileNavLinkActive : ""}`}
                  onClick={closeMenu}
                >
                  <span>My Dashboard</span>
                </Link>
              )}
            </>
          )}
        </div>

        <div className={styles.mobileActions}>
          {isAuthenticated ? (
            <button
              type="button"
              className={styles.mobileLogoutButton}
              onClick={() => {
                closeMenu();
                logout();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log Out</span>
            </button>
          ) : (
            <Link href="/login" className={styles.mobileLoginButton} onClick={closeMenu}>
              <span>Login / Signup</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
    {!isHome && <div className={styles.headerSpacer} />}
  </>
  );
}