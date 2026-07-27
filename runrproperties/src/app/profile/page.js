"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/api";
import MobileInput from "../components/MobileInput";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout, update, isOwner } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", mobile: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) setEditForm({ name: user.name, mobile: user.mobile || "" });
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <aside className={styles.sidebar}>
            <div className={styles.skelAvatar} />
            <div className={styles.skelLine} />
            <div className={styles.skelLineShort} />
          </aside>
          <div className={styles.content}>
            <div className={styles.skelSection} />
            <div className={styles.skelSection} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleProfileSave = async () => {
    const result = await update(editForm);
    if (result.success) { setMsg("Profile updated"); setEditing(false); setTimeout(() => setMsg(""), 3000); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg("");
    if (passForm.newPassword.length < 6) { setPassMsg("Min 6 characters"); return; }
    if (passForm.newPassword !== passForm.confirmPassword) { setPassMsg("Passwords don't match"); return; }
    const result = await changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
    setPassMsg(result.message);
    if (result.success) { setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setTimeout(() => setPassMsg(""), 3000); }
  };

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
          <h3 className={styles.sidebarName}>{user.name}</h3>
          <span className={styles.sidebarRole}>{isOwner ? "Property Owner" : "Buyer"}</span>

          <nav className={styles.sidebarNav}>
            <Link href="/dashboard" className={styles.sidebarLink}>
              <span className={styles.sidebarIcon}>📊</span> Dashboard
            </Link>
            <Link href="/profile" className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}>
              <span className={styles.sidebarIcon}>👤</span> Profile
            </Link>
            <Link href="/wishlist" className={styles.sidebarLink}>
              <span className={styles.sidebarIcon}>❤️</span> Wishlist
            </Link>
            <Link href="/dashboard/my-enquiries" className={styles.sidebarLink}>
              <span className={styles.sidebarIcon}>📋</span> My Enquiries
            </Link>
            {isOwner && (
              <>
                <Link href="/dashboard/my-properties" className={styles.sidebarLink}>
                  <span className={styles.sidebarIcon}>🏠</span> My Properties
                </Link>
                <Link href="/dashboard/add-property" className={styles.sidebarLink}>
                  <span className={styles.sidebarIcon}>➕</span> Add Property
                </Link>
                <Link href="/dashboard/enquiries" className={styles.sidebarLink}>
                  <span className={styles.sidebarIcon}>📩</span> Enquiries
                </Link>
              </>
            )}
            <button className={`${styles.sidebarLink} ${styles.logoutLink}`} onClick={handleLogout}>
              <span className={styles.sidebarIcon}>🚪</span> Logout
            </button>
          </nav>
        </aside>

        {/* Right Content */}
        <div className={styles.content}>
          {msg && <div className={styles.successMsg}>{msg}</div>}

          {/* Profile Info */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Profile Information</h2>
              {!editing && <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit</button>}
            </div>

            {editing ? (
              <div className={styles.editGrid}>
                <div className={styles.field}><label className={styles.fieldLabel}>Full Name</label><input className={styles.fieldInput} value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} /></div>
                <div className={styles.field}><label className={styles.fieldLabel}>Mobile</label><MobileInput className={styles.fieldInput} value={editForm.mobile} onChange={(val) => setEditForm((p) => ({ ...p, mobile: val }))} placeholder="10-digit mobile number" /></div>
                <div className={styles.editActions}><button className={styles.saveBtn} onClick={handleProfileSave}>Save</button><button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button></div>
              </div>
            ) : (
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Name</span><span className={styles.infoValue}>{user.name}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Email</span><span className={styles.infoValue}>{user.email}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Mobile</span><span className={styles.infoValue}>{user.mobile || "Not added"}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Role</span><span className={styles.infoValue}>{isOwner ? "Property Owner" : "Buyer"}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Member Since</span><span className={styles.infoValue}>{new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span></div>
              </div>
            )}
          </section>

          {/* Security */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Security</h2>
              <button className={styles.editBtn} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Close" : "Change Password"}</button>
            </div>
            {showPassword && (
              <form className={styles.editGrid} onSubmit={handlePasswordChange}>
                {passMsg && <div className={styles.infoMsg}>{passMsg}</div>}
                <div className={styles.field}><label className={styles.fieldLabel}>Current Password</label><input type="password" className={styles.fieldInput} value={passForm.currentPassword} onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))} /></div>
                <div className={styles.field}><label className={styles.fieldLabel}>New Password</label><input type="password" className={styles.fieldInput} value={passForm.newPassword} onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))} /></div>
                <div className={styles.field}><label className={styles.fieldLabel}>Confirm</label><input type="password" className={styles.fieldInput} value={passForm.confirmPassword} onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))} /></div>
                <button type="submit" className={styles.saveBtn}>Update Password</button>
              </form>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
