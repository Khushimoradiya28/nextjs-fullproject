"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { getMediaUrl } from "../services/api";
import styles from "./DashboardSidebar.module.css";

export default function DashboardSidebar({ activeOverride, onPhotoUploaded }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isOwner, logout, uploadProfilePhoto } = useAuth();
  const { wishlist } = useWishlist() || { wishlist: [] };
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadProfilePhoto) return;
    setUploading(true);
    try {
      const res = await uploadProfilePhoto(file);
      if (res?.success && onPhotoUploaded) {
        onPhotoUploaded(res.url);
      }
    } catch (err) {
      console.error("Failed to upload avatar", err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const currentPath = activeOverride || pathname;
  const isLinkActive = (href) => {
    if (href === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(href);
  };

  const userPhotoUrl = getMediaUrl(user.profilePhoto);

  return (
    <aside className={styles.sidebar}>
      {/* Avatar Section */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarWrap}>
          {userPhotoUrl ? (
            <img
              src={userPhotoUrl}
              alt={user.name || "User"}
              className={styles.avatarImg}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              className={styles.avatarPlaceholder}
              style={{ background: user.avatarColor || "#007bbd" }}
            >
              <span className={styles.avatarInitial}>
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
          {uploadProfilePhoto && (
            <label className={styles.avatarUploadBtn} title="Upload new photo">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={styles.avatarFileInput}
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
              {uploading ? (
                <div className={styles.uploadSpinner} />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </label>
          )}
        </div>
        <p className={styles.avatarHint}>
          {uploading ? "Uploading..." : user.profilePhoto ? "Change avatar" : "Upload avatar"}
        </p>
      </div>

      {/* User Meta */}
      <div className={styles.sidebarUserMeta}>
        <h3 className={styles.sidebarName}>{user.name}</h3>
        <p className={styles.sidebarEmail}>{user.email}</p>
        <div className={styles.sidebarRoleBadge}>
          {user.role === "admin"
            ? "Super Admin"
            : user.role === "bank_partner"
            ? "Bank Partner"
            : isOwner
            ? "Property Owner"
            : "Buyer / Tenant"}
        </div>
      </div>

      <div className={styles.sidebarDivider} />

      {/* Navigation Links */}
      <nav className={styles.sidebarNav}>
        <Link
          href="/dashboard"
          className={`${styles.sidebarLink} ${isLinkActive("/dashboard") ? styles.sidebarLinkActive : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.sidebarSvg}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link
          href="/profile"
          className={`${styles.sidebarLink} ${isLinkActive("/profile") ? styles.sidebarLinkActive : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.sidebarSvg}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Personal Profile</span>
        </Link>

        <Link
          href="/wishlist"
          className={`${styles.sidebarLink} ${isLinkActive("/wishlist") ? styles.sidebarLinkActive : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.sidebarSvg}>
            <path d="M12 21s-6.5-4.3-8.2-7.2A5.2 5.2 0 0 1 7.5 5.8c1.5 0 2.6.7 3.5 1.8.9-1.1 2-1.8 3.5-1.8a5.2 5.2 0 0 1 5.3 7.2C18.5 16.7 12 21 12 21z" />
          </svg>
          <span>My Wishlist</span>
          {wishlist && wishlist.length > 0 && (
            <span className={styles.sidebarBadge}>{wishlist.length}</span>
          )}
        </Link>

        <Link
          href="/dashboard/my-enquiries"
          className={`${styles.sidebarLink} ${isLinkActive("/dashboard/my-enquiries") ? styles.sidebarLinkActive : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.sidebarSvg}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span>My Enquiries</span>
        </Link>

        {isOwner && (
          <>
            <div className={styles.sidebarSectionLabel}>Owner Portal</div>
            <Link
              href="/dashboard/my-properties"
              className={`${styles.sidebarLink} ${isLinkActive("/dashboard/my-properties") ? styles.sidebarLinkActive : ""}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.sidebarSvg}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>My Properties</span>
            </Link>

            <Link
              href="/dashboard/add-property"
              className={`${styles.sidebarLink} ${isLinkActive("/dashboard/add-property") ? styles.sidebarLinkActive : ""}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.sidebarSvg}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Property</span>
            </Link>

            <Link
              href="/dashboard/enquiries"
              className={`${styles.sidebarLink} ${isLinkActive("/dashboard/enquiries") ? styles.sidebarLinkActive : ""}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.sidebarSvg}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Received Enquiries</span>
            </Link>
          </>
        )}

        <div className={styles.sidebarDivider} />

        <button className={`${styles.sidebarLink} ${styles.logoutLink}`} onClick={handleLogout} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.sidebarSvg}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log Out</span>
        </button>
      </nav>
    </aside>
  );
}
