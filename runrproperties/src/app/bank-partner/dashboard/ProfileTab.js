"use client";
import { useState, useEffect } from "react";
import { getMediaUrl } from "../../services/api";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function ProfileTab({ editForm, setEditForm, profile, userInfo, formError, handleProfileSave }) {
  const [localUser, setLocalUser] = useState(userInfo || null);

  useEffect(() => {
    if (!userInfo) {
      const token = typeof window !== "undefined" ? localStorage.getItem("runr_token") : null;
      if (!token) return;
      fetch(`${API}/auth/me`, { headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.success) setLocalUser(d.user || d.data); })
        .catch(() => {});
    }
  }, [userInfo]);

  const user = userInfo || localUser;
  if (!editForm) return null;

  return (
    <div style={{maxWidth:"740px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px"}}>
        <div>
          <h1 style={{fontSize:"22px",fontWeight:"700",color:"#0E2248",margin:0}}>Bank Profile</h1>
          <p style={{fontSize:"13px",color:"#6b7b8f",margin:"4px 0 0"}}>Manage your bank partner account details</p>
        </div>
        {profile?.status && (
          <span style={{fontSize:"12px",fontWeight:"600",padding:"6px 14px",borderRadius:"20px",background:profile.status==="approved"?"#f0fdf4":profile.status==="pending"?"#fffbeb":"#fef2f2",color:profile.status==="approved"?"#16a34a":profile.status==="pending"?"#92400e":"#dc2626",border:`1px solid ${profile.status==="approved"?"#bbf7d0":profile.status==="pending"?"#fef3c7":"#fecaca"}`}}>
            {profile.status==="approved"?"✓ Approved":profile.status==="pending"?"⏳ Pending Review":"✕ Rejected"}
          </span>
        )}
      </div>

      {formError && <div style={{padding:"10px 16px",borderRadius:"8px",background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:"13px",marginBottom:"16px"}}>{formError}</div>}

      {/* Profile Card */}
      <div style={{background:"#fff",borderRadius:"16px",border:"1px solid #e8e8e3",boxShadow:"0 2px 12px rgba(0,0,0,0.04)",overflow:"hidden"}}>

        {/* Top Banner with Logo */}
        <div style={{background:"linear-gradient(135deg, #f0f7fd 0%, #e8f4fd 100%)",padding:"28px 32px",display:"flex",alignItems:"center",gap:"24px",borderBottom:"1px solid #e8e8e3"}}>
          <div style={{width:"100px",height:"100px",borderRadius:"14px",border:"2px solid #fff",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#fff",flexShrink:0,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
            {profile?.logo
              ? <img src={getMediaUrl(profile.logo)} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:"8px"}} onError={(e) => { e.currentTarget.style.display = "none"; }} />
              : <div style={{fontSize:"28px",fontWeight:"700",color:"#1a6fd4"}}>{(editForm.bankName||"BP").slice(0,2).toUpperCase()}</div>
            }
          </div>
          <div>
            <div style={{fontSize:"20px",fontWeight:"700",color:"#0E2248",marginBottom:"2px"}}>{editForm.bankName || "Your Bank"}</div>
            <div style={{fontSize:"13px",color:"#6b7b8f"}}>{editForm.tagline || "Banking partner on Runr Properties"}</div>
          </div>
        </div>

        {/* Details Section */}
        <div style={{padding:"28px 32px"}}>

          {/* Account Info - Read Only */}
          <div style={{marginBottom:"28px"}}>
            <div style={{fontSize:"11px",fontWeight:"700",color:"#1a6fd4",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:"14px"}}>Account Information</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px",background:"#f9fafb",borderRadius:"10px",padding:"18px 20px",border:"1px solid #f0f0ea"}}>
              <div>
                <div style={{fontSize:"11px",color:"#888",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Contact Person</div>
                <div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{user?.name || "—"}</div>
              </div>
              <div>
                <div style={{fontSize:"11px",color:"#888",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Email</div>
                <div style={{fontSize:"14px",fontWeight:"500",color:"#333"}}>{user?.email || "—"}</div>
              </div>
              <div>
                <div style={{fontSize:"11px",color:"#888",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Mobile</div>
                <div style={{fontSize:"14px",fontWeight:"500",color:"#333"}}>{user?.mobile || "—"}</div>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div style={{fontSize:"11px",fontWeight:"700",color:"#1a6fd4",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:"14px"}}>Bank Details</div>

          <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
            <div>
              <label style={{fontSize:"12px",fontWeight:"600",color:"#475569",display:"block",marginBottom:"6px"}}>Bank Name *</label>
              <input value={editForm.bankName||""} onChange={(e)=>setEditForm({...editForm,bankName:e.target.value})} style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e2e8f0",borderRadius:"10px",fontSize:"14px",color:"#111",background:"#fff",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="#1a6fd4"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
            </div>
            <div>
              <label style={{fontSize:"12px",fontWeight:"600",color:"#475569",display:"block",marginBottom:"6px"}}>Tagline</label>
              <input value={editForm.tagline||""} maxLength={40} onChange={(e)=>setEditForm({...editForm,tagline:e.target.value})} placeholder="e.g. Your trusted home loan partner" style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e2e8f0",borderRadius:"10px",fontSize:"14px",color:"#111",background:"#fff",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="#1a6fd4"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
              <div style={{fontSize:"11px",color:"#aaa",textAlign:"right",marginTop:"4px"}}>{(editForm.tagline||"").length}/40</div>
            </div>
            <div>
              <label style={{fontSize:"12px",fontWeight:"600",color:"#475569",display:"block",marginBottom:"6px"}}>Description</label>
              <textarea value={editForm.description||""} onChange={(e)=>setEditForm({...editForm,description:e.target.value})} placeholder="Brief description about your bank's home loan offerings..." rows={4} style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e2e8f0",borderRadius:"10px",fontSize:"14px",color:"#111",background:"#fff",outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="#1a6fd4"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
            </div>
          </div>

          <div style={{marginTop:"24px"}}>
            <button onClick={handleProfileSave} style={{background:"#1a6fd4",color:"#fff",border:"none",padding:"12px 32px",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer",transition:"background 0.2s"}} onMouseEnter={e=>e.target.style.background="#155ab6"} onMouseLeave={e=>e.target.style.background="#1a6fd4"}>Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}
