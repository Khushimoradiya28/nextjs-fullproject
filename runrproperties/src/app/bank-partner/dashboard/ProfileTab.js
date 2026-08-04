"use client";
export default function ProfileTab({ editForm, setEditForm, profile, formError, handleProfileSave, handleLogoUpload }) {
  if (!editForm) return null;
  return (
    <div style={{maxWidth:"700px"}}>
      <h1 style={{fontSize:"20px",fontWeight:"600",color:"#111",marginBottom:"24px"}}>Bank Profile</h1>
      {formError && <div style={{padding:"10px 16px",borderRadius:"8px",background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:"13px",marginBottom:"16px"}}>{formError}</div>}

      {/* Logo Upload Card - Bigger */}
      <div style={{background:"#fff",border:"1px solid #e5e5e0",borderRadius:"12px",padding:"28px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"28px"}}>
        <div style={{width:"120px",height:"120px",borderRadius:"14px",border:"1px solid #e5e5e0",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8f8f5",flexShrink:0}}>
          {profile?.logo
            ? <img src={profile.logo} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:"8px"}} />
            : <div style={{fontSize:"32px",fontWeight:"700",color:"#1a6fd4"}}>{profile?.bankName?.slice(0,2).toUpperCase() || "BP"}</div>
          }
        </div>
        <div>
          <div style={{fontSize:"17px",fontWeight:"600",color:"#111",marginBottom:"4px"}}>{profile?.bankName || "Your Bank"}</div>
          <div style={{fontSize:"13px",color:"#888",marginBottom:"14px"}}>Recommended: 400×160px, PNG with transparent background</div>
          <label style={{fontSize:"13px",color:"#1a6fd4",border:"1.5px solid #1a6fd4",padding:"8px 20px",borderRadius:"8px",cursor:"pointer",background:"#fff",display:"inline-block",fontWeight:"500"}}>
            Change Logo
            <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style={{display:"none"}} onChange={handleLogoUpload} />
          </label>
        </div>
      </div>

      {/* Contact & Bank Details Card */}
      <div style={{background:"#fff",border:"1px solid #e5e5e0",borderRadius:"12px",padding:"28px"}}>
        <div style={{borderLeft:"4px solid #1a6fd4",paddingLeft:"14px",marginBottom:"24px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"600",color:"#111",margin:0}}>Bank Details</h3>
          <p style={{fontSize:"13px",color:"#888",margin:"3px 0 0"}}>This information appears on your public profile</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px"}}>
          <div>
            <label style={{fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Bank Name *</label>
            <input value={editForm.bankName||""} onChange={(e)=>setEditForm({...editForm,bankName:e.target.value})} style={{width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#111",background:"#fff",outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor="#1a6fd4"} onBlur={e=>e.target.style.borderColor="#e0e0da"} />
          </div>
          <div>
            <label style={{fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Contact Person</label>
            <input value={editForm.name||profile?.name||""} readOnly style={{width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#666",background:"#f9f9f7",outline:"none",boxSizing:"border-box",cursor:"default"}} />
          </div>
          <div>
            <label style={{fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Email</label>
            <input value={editForm.email||profile?.email||""} readOnly style={{width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#666",background:"#f9f9f7",outline:"none",boxSizing:"border-box",cursor:"default"}} />
          </div>
          <div>
            <label style={{fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Mobile</label>
            <input value={editForm.mobile||profile?.mobile||""} readOnly style={{width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#666",background:"#f9f9f7",outline:"none",boxSizing:"border-box",cursor:"default"}} />
          </div>
        </div>

        <div style={{height:"1px",background:"#f0f0ea",margin:"24px 0"}} />

        <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
          <div>
            <label style={{fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Tagline</label>
            <input value={editForm.tagline||""} maxLength={40} onChange={(e)=>setEditForm({...editForm,tagline:e.target.value})} placeholder="e.g. Your trusted home loan partner" style={{width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#111",background:"#fff",outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor="#1a6fd4"} onBlur={e=>e.target.style.borderColor="#e0e0da"} />
            <div style={{fontSize:"11px",color:"#aaa",textAlign:"right",marginTop:"4px"}}>{(editForm.tagline||"").length}/40 characters</div>
          </div>
          <div>
            <label style={{fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Description</label>
            <textarea value={editForm.description||""} onChange={(e)=>setEditForm({...editForm,description:e.target.value})} placeholder="Brief description about your bank's home loan offerings..." rows={4} style={{width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#111",background:"#fff",outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}} onFocus={e=>e.target.style.borderColor="#1a6fd4"} onBlur={e=>e.target.style.borderColor="#e0e0da"} />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
            <button onClick={handleProfileSave} style={{background:"#1a6fd4",color:"#fff",border:"none",padding:"11px 28px",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor:"pointer"}}>Save Profile</button>
            {profile?.status && <span style={{fontSize:"12px",padding:"4px 12px",borderRadius:"20px",background:profile.status==="approved"?"#f0fdf4":profile.status==="pending"?"#fffbeb":"#fef2f2",color:profile.status==="approved"?"#166534":profile.status==="pending"?"#92400e":"#dc2626",fontWeight:"500",textTransform:"capitalize"}}>{profile.status}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
