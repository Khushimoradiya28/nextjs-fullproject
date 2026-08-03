"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Nav, Sidebar, OverviewTab, LeadsTab, ProfileTab, AllOffersTab } from "./components";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";
function getToken() { if (typeof window === "undefined") return null; return localStorage.getItem("runr_token"); }
function authHeaders() { const t = getToken(); return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) }; }

function addNotification(msg) {
  if (typeof window === "undefined") return;
  const notifs = JSON.parse(localStorage.getItem("bp_notifs") || "[]");
  notifs.unshift({ msg, time: new Date().toISOString(), read: false });
  localStorage.setItem("bp_notifs", JSON.stringify(notifs.slice(0, 20)));
}

export default function BankPartnerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [profile, setProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState("");
  const [offers, setOffers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOffer, setNewOffer] = useState({ interestRate:"", processingFee:"", loanType:"", maxTenure:"", features:"" });

  useEffect(() => { if (!getToken()) { router.push("/bank-partner/login"); return; } fetchProfile(); fetchLeads(); loadNotifications(); }, []);
  useEffect(() => { if (activeTab === "All Offers") fetchOffers(); }, [activeTab]);

  const loadNotifications = () => { setNotifications(JSON.parse(localStorage.getItem("bp_notifs") || "[]")); };
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => { const n = notifications.map(x => ({...x, read:true})); setNotifications(n); localStorage.setItem("bp_notifs", JSON.stringify(n)); };
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const fetchProfile = async () => { try { const r = await fetch(`${API}/bank-partners/profile`, { headers: authHeaders() }); if (!r.ok) return; const d = await r.json(); if (d.success) { setProfile(d.data); setEditForm(d.data); } } catch(e){} };
  const fetchLeads = async (status = "") => { setLeadsLoading(true); try { const u = status ? `${API}/bank-partners/leads?status=${status}` : `${API}/bank-partners/leads`; const r = await fetch(u, { headers: authHeaders() }); if (!r.ok) { setLeadsLoading(false); return; } const d = await r.json(); if (d.success) setLeads(d.leads || d.data || []); } catch(e){} setLeadsLoading(false); };
  const fetchOffers = async () => { try { const r = await fetch(`${API}/bank-partners/profile`, { headers: authHeaders() }); if (!r.ok) return; const d = await r.json(); if (d.success) setOffers(d.data?.offers || (d.data ? [d.data] : [])); } catch(e){} };

  const handleProfileSave = async () => {
    if (!editForm?.bankName?.trim()) { setFormError("Bank name is required"); return; }
    setFormError("");
    try { const r = await fetch(`${API}/bank-partners/profile`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(editForm) }); const d = await r.json(); if (d.success) { setProfile(d.data); addNotification("Profile updated"); loadNotifications(); showToast("Profile saved successfully!"); } } catch(e){}
  };
  const handleLogoUpload = async (e) => { const f = e.target.files[0]; if (!f) return; const fd = new FormData(); fd.append("logo", f); const t = getToken(); try { const r = await fetch(`${API}/bank-partners/profile/logo`, { method: "POST", headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: fd }); const d = await r.json(); if (d.success) { setProfile(d.data); showToast("Logo updated!"); } } catch(e){} };
  const handleLeadUpdate = async (leadId, st, notes) => { try { const r = await fetch(`${API}/bank-partners/leads/${leadId}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status: st, notes }) }); const d = await r.json(); if (d.success) { setLeads(prev => prev.map(l => (l._id || l.id) === leadId ? (d.data || d.lead) : l)); const lead = leads.find(l => (l._id || l.id) === leadId); addNotification("Lead " + (lead?.name || "") + " marked as " + st.replace("_"," ")); loadNotifications(); } } catch(e){} };
  const handleDeleteOffer = async (id) => { if (!confirm("Delete this offer?")) return; try { await fetch(`${API}/bank-partners/offers/${id}`, { method: "DELETE", headers: authHeaders() }); showToast("Offer deleted"); fetchOffers(); } catch(e){} };
  const handleSaveNewOffer = async () => { if (!newOffer.interestRate || !newOffer.loanType) { alert("Interest rate and loan type are required"); return; } const featuresArr = newOffer.features ? newOffer.features.split(",").map(f => f.trim()).filter(Boolean) : []; try { await fetch(`${API}/bank-partners/offers`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ ...newOffer, features: featuresArr }) }); setShowAddForm(false); setNewOffer({ interestRate:"", processingFee:"", loanType:"", maxTenure:"", features:"" }); showToast("Offer added successfully!"); addNotification("New offer added"); loadNotifications(); fetchOffers(); } catch(e){} };
  const handleLogout = () => { localStorage.removeItem("runr_token"); router.push("/bank-partner/login"); };

  const stats = { totalLeads: leads.length, pending: leads.filter(l => l.status === "pending").length, closedWon: leads.filter(l => l.status === "closed_won").length };

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:"#f0f0eb",fontFamily:"inherit"}}>
      {toast && <div style={{position:"fixed",top:"20px",right:"20px",background:"#111",color:"#fff",padding:"12px 20px",borderRadius:"8px",zIndex:9999,display:"flex",alignItems:"center",gap:"8px",fontSize:"13px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>✅ {toast}</div>}
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} showNotifs={showNotifs} setShowNotifs={setShowNotifs} unreadCount={unreadCount} notifications={notifications} markAllRead={markAllRead} />
      <div style={{display:"flex",flex:1}}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
        <main style={{flex:1,padding:"28px 32px"}}>
          {activeTab==="Overview" && <OverviewTab stats={stats} leads={leads} profile={profile} setActiveTab={setActiveTab} />}
          {activeTab==="Leads" && <LeadsTab leads={leads} leadsLoading={leadsLoading} statusFilter={statusFilter} setStatusFilter={setStatusFilter} fetchLeads={fetchLeads} handleLeadUpdate={handleLeadUpdate} />}
          {activeTab==="Profile & Offer" && <ProfileTab editForm={editForm} setEditForm={setEditForm} profile={profile} formError={formError} handleProfileSave={handleProfileSave} handleLogoUpload={handleLogoUpload} />}
          {activeTab==="All Offers" && <AllOffersTab offers={offers} handleDeleteOffer={handleDeleteOffer} showAddForm={showAddForm} setShowAddForm={setShowAddForm} newOffer={newOffer} setNewOffer={setNewOffer} handleSaveNewOffer={handleSaveNewOffer} setEditForm={setEditForm} setActiveTab={setActiveTab} />}
          {activeTab==="Analytics" && <div style={{textAlign:"center",padding:"60px",color:"#999"}}><p>Analytics coming soon</p></div>}
          {activeTab==="Settings" && <div style={{textAlign:"center",padding:"60px",color:"#999"}}><p>Settings coming soon</p></div>}
        </main>
      </div>
    </div>
  );
}
