"use client";
const inputStyle = {width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#111",background:"#ffffff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
const labelStyle = {fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"};
const focusIn = (e) => { e.target.style.borderColor = "#1a6fd4"; };
const focusOut = (e) => { e.target.style.borderColor = "#e0e0da"; };

export default function ProfileTab({ editForm, setEditForm, profile, formError, handleProfileSave, handleLogoUpload }) {
  if (!editForm) return null;
  return (<div>
    <h1 style={{fontSize:"20px",fontWeight:"600",color:"#111",marginBottom:"20px"}}>Bank Profile</h1>
    {formError&&<div style={{padding:"10px 16px",borderRadius:"8px",background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:"13px",marginBottom:"16px"}}>{formError}</div>}
    <div style={{background:"#fff",border:"1px solid #e5e5e0",borderRadius:"12px",padding:"28px 32px",maxWidth:"650px"}}>
      <div style={{borderLeft:"4px solid #1a6fd4",paddingLeft:"14px",marginBottom:"24px"}}><h3 style={{fontSize:"16px",fontWeight:"600",color:"#111",margin:0}}>Bank Profile</h3><p style={{fontSize:"13px",color:"#888",marginTop:"4px",margin:0}}>Update your bank details and logo</p></div>
      <div style={{display:"flex",alignItems:"center",gap:"20px",marginBottom:"24px",paddingBottom:"20px",borderBottom:"1px solid #f0f0ea"}}>
        <div style={{width:"80px",height:"80px",borderRadius:"12px",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"1px solid #e5e5e0"}}>{profile?.logo?<img src={profile.logo} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:"20px",fontWeight:"700",color:"#1a6fd4"}}>{profile?.bankName?.slice(0,2).toUpperCase()||"BP"}</span>}</div>
        <div><label style={{padding:"8px 16px",background:"#fff",border:"1.5px solid #e5e5e0",borderRadius:"8px",fontSize:"13px",fontWeight:"600",color:"#111",cursor:"pointer",display:"inline-block"}}>Change Logo<input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoUpload} style={{display:"none"}}/></label><p style={{fontSize:"11px",color:"#aaa",margin:"6px 0 0"}}>Recommended: 400×160px, PNG or SVG (transparent bg)</p><p style={{fontSize:"10px",color:"#bbb",margin:"3px 0 0"}}>Max 2MB • Horizontal logo works best</p></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        <div><label style={labelStyle}>Bank Name *</label><input value={editForm.bankName||""} onChange={(e)=>setEditForm({...editForm,bankName:e.target.value})} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></div>
        <div><label style={labelStyle}>Tagline</label><input value={editForm.tagline||""} onChange={(e)=>setEditForm({...editForm,tagline:e.target.value})} placeholder="e.g. Your trusted home loan partner" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></div>
        <div><label style={labelStyle}>Description</label><textarea rows={4} value={editForm.description||""} onChange={(e)=>setEditForm({...editForm,description:e.target.value})} style={{...inputStyle,resize:"vertical"}} onFocus={focusIn} onBlur={focusOut}/></div>
        <button onClick={handleProfileSave} style={{background:"#1a6fd4",color:"#fff",border:"none",padding:"11px 28px",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor:"pointer",alignSelf:"flex-start",marginTop:"8px"}}>Save Profile</button>
      </div>
    </div>
  </div>);
}
