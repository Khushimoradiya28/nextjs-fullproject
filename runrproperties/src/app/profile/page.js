"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { changePassword, uploadProfilePhoto } from "../services/api";
import MobileInput from "../components/MobileInput";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DashboardSidebar from "../components/DashboardSidebar";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout, update, isOwner } = useAuth();
  const { wishlistCount } = useWishlist();

  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", mobile: "" });

  const [showPassword, setShowPassword] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success"); // 'success' | 'error'
  const [passMsg, setPassMsg] = useState("");
  const [passMsgType, setPassMsgType] = useState("success");

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (user?.role === "bank_partner") {
        router.replace("/bank-partner/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "bank_partner") {
      setEditForm({ name: user.name || "", mobile: user.mobile || "" });
    }
  }, [user]);

  if (loading || !user || user.role === "admin" || user.role === "bank_partner") {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <aside className={styles.sidebar}>
            <div className={styles.skelAvatar} />
            <div className={styles.skelLine} />
            <div className={styles.skelLineShort} />
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className={styles.skelLine} style={{ width: "90%" }} />
              <div className={styles.skelLine} style={{ width: "85%" }} />
              <div className={styles.skelLine} style={{ width: "80%" }} />
            </div>
          </aside>
          <div className={styles.content}>
            <div className={styles.skelSection} />
            <div className={styles.skelSection} style={{ height: "140px" }} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleProfileSave = async () => {
    if (!editForm.name?.trim()) {
      setMsg("Please enter your full name");
      setMsgType("error");
      return;
    }
    setSavingProfile(true);
    setMsg("");
    try {
      const result = await update(editForm);
      if (result.success) {
        setMsg("Profile details updated successfully!");
        setMsgType("success");
        setEditing(false);
        setTimeout(() => setMsg(""), 3500);
      } else {
        setMsg(result.message || "Failed to update profile");
        setMsgType("error");
      }
    } catch {
      setMsg("An error occurred while updating profile");
      setMsgType("error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg("");
    if (!passForm.currentPassword) {
      setPassMsg("Please enter your current password");
      setPassMsgType("error");
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassMsg("New password must be at least 6 characters long");
      setPassMsgType("error");
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg("New password and confirm password do not match");
      setPassMsgType("error");
      return;
    }

    setSavingPass(true);
    try {
      const result = await changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPassMsg(result.message || (result.success ? "Password changed successfully!" : "Failed to update password"));
      setPassMsgType(result.success ? "success" : "error");
      if (result.success) {
        setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          setPassMsg("");
          setShowPassword(false);
        }, 3000);
      }
    } catch {
      setPassMsg("An error occurred while changing password");
      setPassMsgType("error");
    } finally {
      setSavingPass(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadProfilePhoto(file);
      if (res.success && res.data) {
        update(res.data);
        setMsg("Profile picture updated!");
        setMsgType("success");
        setTimeout(() => setMsg(""), 3500);
      } else {
        setMsg(res.message || "Failed to upload photo");
        setMsgType("error");
      }
    } catch {
      setMsg("Photo upload failed. Please try again.");
      setMsgType("error");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const memberSinceFormatted = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "Recently";

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.pageContainer}>
        {/* Breadcrumb Header */}
        <div className={styles.breadcrumbBar}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>My Profile</span>
        </div>

        <main className={styles.main}>
          <DashboardSidebar />

          {/* Right Content */}
          <div className={styles.content}>
            {/* Welcome Greeting Banner */}
            <div className={styles.welcomeBanner}>
              <div className={styles.welcomeMeta}>
                <div className={styles.welcomeTag}>Account Overview</div>
                <h1 className={styles.welcomeTitle}>
                  Hello, {user.name} <span className={styles.wave}>👋</span>
                </h1>
                <p className={styles.welcomeDesc}>
                  Manage your personal details, verify your contact information, and ensure your account security.
                </p>
              </div>

              <div className={styles.statCards}>
                <div className={styles.statPill}>
                  <span className={styles.statLabel}>Status</span>
                  <span className={styles.statValActive}>Active</span>
                </div>
                <div className={styles.statPill}>
                  <span className={styles.statLabel}>Saved</span>
                  <span className={styles.statVal}>{wishlistCount} Homes</span>
                </div>
                <div className={styles.statPill}>
                  <span className={styles.statLabel}>Role</span>
                  <span className={styles.statVal}>{isOwner ? "Owner" : "Buyer"}</span>
                </div>
              </div>
            </div>

            {/* Global Alert Notification */}
            {msg && (
              <div className={`${styles.alertBox} ${msgType === "error" ? styles.alertError : styles.alertSuccess}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.alertIcon}>
                  {msgType === "error" ? (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  ) : (
                    <>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </>
                  )}
                </svg>
                <span>{msg}</span>
              </div>
            )}

            {/* Profile Information Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleBlock}>
                  <div className={styles.sectionIconWrap}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={styles.sectionTitle}>Profile Information</h2>
                    <p className={styles.sectionSubtitle}>Your verified credentials and contact details</p>
                  </div>
                </div>

                {!editing && (
                  <button className={styles.editBtn} onClick={() => setEditing(true)} type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {editing ? (
                <div className={styles.editFormWrap}>
                  <div className={styles.editGrid}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Full Name</label>
                      <input
                        className={styles.fieldInput}
                        value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Mobile Number</label>
                      <MobileInput
                        className={styles.fieldInput}
                        value={editForm.mobile}
                        onChange={(val) => setEditForm((p) => ({ ...p, mobile: val }))}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div className={styles.field}>
                      <div className={styles.labelWithBadge}>
                        <label className={styles.fieldLabel}>Email Address</label>
                        <span className={styles.lockedTag}>Primary (Read-only)</span>
                      </div>
                      <input
                        className={`${styles.fieldInput} ${styles.fieldInputDisabled}`}
                        value={user.email}
                        disabled
                        readOnly
                        title="Email address is linked to your account credentials"
                      />
                    </div>
                    <div className={styles.field}>
                      <div className={styles.labelWithBadge}>
                        <label className={styles.fieldLabel}>Account Role</label>
                        <span className={styles.lockedTag}>Role</span>
                      </div>
                      <input
                        className={`${styles.fieldInput} ${styles.fieldInputDisabled}`}
                        value={isOwner ? "Property Owner" : "Buyer / Tenant"}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  <div className={styles.editActions}>
                    <button
                      className={styles.saveBtn}
                      onClick={handleProfileSave}
                      disabled={savingProfile}
                      type="button"
                    >
                      {savingProfile ? "Saving Details..." : "Save Changes"}
                    </button>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => {
                        setEditing(false);
                        setEditForm({ name: user.name || "", mobile: user.mobile || "" });
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.infoGrid}>
                  <div className={styles.infoTile}>
                    <div className={styles.infoTileIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className={styles.infoTileBody}>
                      <span className={styles.infoLabel}>Full Name</span>
                      <span className={styles.infoValue}>{user.name}</span>
                    </div>
                  </div>

                  <div className={styles.infoTile}>
                    <div className={styles.infoTileIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div className={styles.infoTileBody}>
                      <div className={styles.labelWithBadge}>
                        <span className={styles.infoLabel}>Email Address</span>
                        <span className={styles.verifiedTag}>Verified</span>
                      </div>
                      <span className={styles.infoValue}>{user.email}</span>
                    </div>
                  </div>

                  <div className={styles.infoTile}>
                    <div className={styles.infoTileIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div className={styles.infoTileBody}>
                      <span className={styles.infoLabel}>Phone Number</span>
                      <span className={user.mobile ? styles.infoValue : styles.infoValueEmpty}>
                        {user.mobile || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.infoTile}>
                    <div className={styles.infoTileIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <div className={styles.infoTileBody}>
                      <span className={styles.infoLabel}>Account Role</span>
                      <span className={styles.infoValue}>
                        {isOwner ? "Property Owner" : "Buyer / Tenant"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.infoTile}>
                    <div className={styles.infoTileIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className={styles.infoTileBody}>
                      <span className={styles.infoLabel}>Member Since</span>
                      <span className={styles.infoValue}>{memberSinceFormatted}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Security & Password Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleBlock}>
                  <div className={styles.sectionIconWrap}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={styles.sectionTitle}>Account Security</h2>
                    <p className={styles.sectionSubtitle}>Manage your login password and security settings</p>
                  </div>
                </div>

                <button
                  className={`${styles.editBtn} ${showPassword ? styles.editBtnActive : ""}`}
                  onClick={() => {
                    setShowPassword(!showPassword);
                    setPassMsg("");
                  }}
                  type="button"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                  <span>{showPassword ? "Cancel" : "Change Password"}</span>
                </button>
              </div>

              {passMsg && (
                <div className={`${styles.alertBox} ${passMsgType === "error" ? styles.alertError : styles.alertSuccess}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.alertIcon}>
                    {passMsgType === "error" ? (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </>
                    ) : (
                      <>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </>
                    )}
                  </svg>
                  <span>{passMsg}</span>
                </div>
              )}

              {showPassword ? (
                <form className={styles.editFormWrap} onSubmit={handlePasswordChange}>
                  <div className={styles.passwordGrid}>
                    <div className={styles.field}>
                      <div className={styles.labelWithBadge}>
                        <label className={styles.fieldLabel}>Current Password</label>
                        <Link href="/forgot-password" className={styles.forgotPassLink} title="Reset password via registered email">
                          Forgot password?
                        </Link>
                      </div>
                      <input
                        type="password"
                        className={styles.fieldInput}
                        value={passForm.currentPassword}
                        onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>New Password</label>
                      <input
                        type="password"
                        className={styles.fieldInput}
                        value={passForm.newPassword}
                        onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
                        placeholder="Min 6 characters"
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Confirm New Password</label>
                      <input
                        type="password"
                        className={styles.fieldInput}
                        value={passForm.confirmPassword}
                        onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.editActions}>
                    <button type="submit" className={styles.saveBtn} disabled={savingPass}>
                      {savingPass ? "Updating Password..." : "Update Password"}
                    </button>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => {
                        setShowPassword(false);
                        setPassMsg("");
                        setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.securitySummary}>
                  <div className={styles.securityIconCircle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className={styles.securityText}>
                    <h4>Your Password is Protected</h4>
                    <p>
                      We recommend changing your password periodically. Forgot your current password?{" "}
                      <Link href="/forgot-password" className={styles.inlineForgotLink}>
                        Reset via Email
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Owner Quick Cards if isOwner */}
            {isOwner && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleBlock}>
                    <div className={styles.sectionIconWrap}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={styles.sectionTitle}>Property Management</h2>
                      <p className={styles.sectionSubtitle}>Quick shortcuts to manage your listings and enquiries</p>
                    </div>
                  </div>
                </div>

                <div className={styles.ownerGrid}>
                  <Link href="/dashboard/add-property" className={styles.ownerCard}>
                    <div className={styles.ownerCardIcon} style={{ background: "rgba(0, 123, 189, 0.1)", color: "#007bbd" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <div className={styles.ownerCardBody}>
                      <h3>Post New Property</h3>
                      <p>List residential or commercial property in 2 minutes</p>
                    </div>
                    <span className={styles.ownerCardArrow}>→</span>
                  </Link>

                  <Link href="/dashboard/my-properties" className={styles.ownerCard}>
                    <div className={styles.ownerCardIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div className={styles.ownerCardBody}>
                      <h3>My Active Listings</h3>
                      <p>View, edit price, or update property status</p>
                    </div>
                    <span className={styles.ownerCardArrow}>→</span>
                  </Link>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
