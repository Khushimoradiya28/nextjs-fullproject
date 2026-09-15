"use client";
import { useState, useEffect } from "react";
import { getMediaUrl } from "../../services/api";
const inputStyle = {width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#111",background:"#fff",outline:"none",boxSizing:"border-box"};
const labelStyle = {fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"};
const focusIn = (e) => { e.target.style.borderColor = "#1a6fd4"; };
const focusOut = (e) => { e.target.style.borderColor = "#e0e0da"; };

export default function AllOffersTab({ offers, handleDeleteOffer, handleToggleOfferStatus, showAddForm: showAddFormProp, setShowAddForm, newOffer, setNewOffer, handleSaveNewOffer, setEditForm, setActiveTab, handleLogoUpload, profile }) {
  const [isEditing, setIsEditing] = useState(!!newOffer.interestRate || !!newOffer.loanType);
  const [localShowForm, setLocalShowForm] = useState(showAddFormProp);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bankLogo, setBankLogo] = useState(profile?.logo || null);
  const [bankName, setBankName] = useState(profile?.bankName || "");

  useState(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("runr_token") : null;
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/bank-partners/profile`, { headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success) { setBankLogo(d.data?.logo || ""); setBankName(d.data?.bankName || ""); } })
      .catch(() => {});
  }, []);

  const showForm = localShowForm || showAddFormProp;

  const internalLogoUpload = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (handleLogoUpload) { handleLogoUpload(e); return; }
    const fd = new FormData(); fd.append("logo", f);
    const token = typeof window !== "undefined" ? localStorage.getItem("runr_token") : null;
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/bank-partners/profile/logo`, { method: "POST", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: fd });
      const d = await r.json();
      if (d.success) setLogoPreview(d.data?.logo || URL.createObjectURL(f));
    } catch(err) {}
  };

  const handleEditOffer = (offer) => {
    const featuresStr = Array.isArray(offer.features) ? offer.features.join(", ") : (offer.features || "");
    setNewOffer({
      _id: offer._id || "",
      interestRate: offer.interestRate || "",
      processingFee: offer.processingFee || "",
      loanType: offer.loanType || "",
      maxTenure: offer.maxTenure || "",
      features: featuresStr,
      isActive: offer.isActive !== false,
    });
    setIsEditing(true);
    setShowAddForm(true);
    setActiveTab("Add Offer");
  };

  const handleCancel = () => {
    setLocalShowForm(false);
    setShowAddForm(false);
    setIsEditing(false);
    setNewOffer({ interestRate:"", processingFee:"", loanType:"", maxTenure:"", features:"", isActive: true });
  };

  return (<div>
    {/* Add/Edit Offer Form */}
    {showForm && (
      <div style={{background:"#fff",border:"1px solid #e5e5e0",borderRadius:"12px",padding:"28px 32px",marginBottom:"20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div style={{borderLeft:"4px solid #1a6fd4",paddingLeft:"14px"}}><h3 style={{fontSize:"16px",fontWeight:"600",color:"#111",margin:0}}>{isEditing ? "Edit Offer" : "Add New Offer"}</h3><p style={{fontSize:"13px",color:"#888",marginTop:"4px",margin:0}}>Set interest rate and loan parameters</p></div>
          <button onClick={handleCancel} style={{background:"none",border:"none",fontSize:"20px",color:"#aaa",cursor:"pointer",lineHeight:1}}>✕</button>
        </div>

        {/* Logo Upload Section */}
        <div style={{background:"#f8f8f5",border:"1px solid #e5e5e0",borderRadius:"10px",padding:"20px 24px",marginBottom:"24px",display:"flex",alignItems:"center",gap:"20px"}}>
          <div style={{width:"72px",height:"72px",borderRadius:"10px",border:"1px solid #e5e5e0",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#fff",flexShrink:0}}>
            {(logoPreview || bankLogo)
              ? <img src={getMediaUrl(logoPreview || bankLogo)} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={(e) => { e.currentTarget.style.display = "none"; }} />
              : <span style={{fontSize:"20px",fontWeight:"700",color:"#ccc"}}>🖼️</span>
            }
          </div>
          <div>
            <div style={{fontSize:"14px",fontWeight:"500",color:"#111",marginBottom:"4px"}}>Bank Logo</div>
            <div style={{fontSize:"12px",color:"#888",marginBottom:"10px"}}>Recommended: 400×160px, PNG with transparent background</div>
            <label style={{fontSize:"13px",color:"#1a6fd4",border:"1px solid #1a6fd4",padding:"6px 16px",borderRadius:"7px",cursor:"pointer",background:"#fff",display:"inline-block"}}>
              {isEditing ? "Change Logo" : "Upload Logo"}
              <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style={{display:"none"}} onChange={internalLogoUpload} />
            </label>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
          <div><label style={labelStyle}>Interest Rate (%) *</label><input type="number" placeholder="e.g. 8.50" value={newOffer.interestRate} onChange={e=>setNewOffer({...newOffer,interestRate:e.target.value})} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></div>
          <div><label style={labelStyle}>Processing Fee</label><input type="text" placeholder="e.g. ₹1,000 or 0.5%" value={newOffer.processingFee} onChange={e=>setNewOffer({...newOffer,processingFee:e.target.value})} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></div>
          <div><label style={labelStyle}>Loan Type *</label><select value={newOffer.loanType} onChange={e=>setNewOffer({...newOffer,loanType:e.target.value})} style={{...inputStyle,cursor:"pointer"}} onFocus={focusIn} onBlur={focusOut}><option value="">Select type</option><option value="Home Loan">Home Loan</option><option value="Plot Loan">Plot Loan</option><option value="Construction Loan">Construction Loan</option><option value="Loan Against Property">Loan Against Property</option><option value="Balance Transfer">Balance Transfer</option></select></div>
          <div><label style={labelStyle}>Max Tenure (years)</label><input type="number" placeholder="e.g. 30" value={newOffer.maxTenure} onChange={e=>setNewOffer({...newOffer,maxTenure:e.target.value})} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></div>
        </div>
        <div style={{marginTop:"20px"}}><label style={labelStyle}>Features (comma separated)</label><input type="text" placeholder="e.g. No prepayment charges, Doorstep service" value={newOffer.features} onChange={e=>setNewOffer({...newOffer,features:e.target.value})} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></div>
        <div style={{display:"flex",gap:"10px",marginTop:"24px"}}>
          <button onClick={()=>{handleSaveNewOffer();setIsEditing(false);}} style={{background:"#1a6fd4",color:"#fff",border:"none",padding:"11px 28px",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor:"pointer"}}>{isEditing ? "Update Offer" : "Save Offer"}</button>
          <button onClick={handleCancel} style={{background:"#fff",color:"#666",border:"1px solid #e0e0da",padding:"11px 20px",borderRadius:"8px",fontSize:"14px",cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    )}

    {/* Offers List */}
    <div style={{background:"#fff",border:"1px solid rgba(0,123,189,0.12)",borderRadius:"14px",overflow:"hidden",boxShadow:"0 2px 20px rgba(0,123,189,0.06)"}}>
      <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(0,123,189,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:"1.15rem",fontWeight:"600",color:"#1A1A1A",fontFamily:"'Playfair Display',serif",borderLeft:"3px solid #007bbd",paddingLeft:"12px"}}>All Offers</span>
        <span style={{fontSize:"12px",color:"#64748b",fontWeight:"500"}}>{offers.length} {offers.length === 1 ? "Offer" : "Offers"} Total</span>
      </div>
      {offers.length===0?(
        <div style={{padding:"60px 20px",textAlign:"center"}}><div style={{fontSize:"40px",marginBottom:"12px",opacity:0.6}}>🏷️</div><p style={{fontSize:"14px",color:"#64748b",fontWeight:"500"}}>No offers created yet.</p></div>
      ):offers.map((offer,i)=>{
        const isActive = offer.isActive !== false;
        return (
          <div
            key={i}
            style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
              padding:"20px 24px",
              borderBottom: i === offers.length - 1 ? "none" : "1px solid rgba(0,123,189,0.07)",
              background: isActive ? "#ffffff" : "#f8fafc",
              transition:"all 0.2s ease",
            }}
          >
            <div style={{display:"flex",alignItems:"center",gap:"18px",flex:1}}>
              <div style={{
                width:"64px",
                height:"64px",
                borderRadius:"12px",
                border:"1px solid rgba(0,123,189,0.15)",
                overflow:"hidden",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                background:"#ffffff",
                boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                flexShrink:0
              }}>
                {bankLogo
                  ? <img src={getMediaUrl(bankLogo)} alt={offer.bankName||"Bank"} style={{width:"100%",height:"100%",objectFit:"contain",padding:"6px"}} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  : <span style={{fontSize:"16px",fontWeight:"700",color:"#007bbd"}}>{(bankName||"BP").slice(0,2).toUpperCase()}</span>
                }
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px"}}>
                  <span style={{fontSize:"15px",fontWeight:"600",color:"#1A1A1A"}}>{offer.bankName || bankName || "Your Bank"}</span>
                  <span style={{
                    fontSize:"11px",
                    fontWeight:"600",
                    padding:"2px 9px",
                    borderRadius:"20px",
                    background: isActive ? "rgba(46,158,110,0.1)" : "#f1f5f9",
                    color: isActive ? "#2E9E6E" : "#64748b",
                    border: `1px solid ${isActive ? "rgba(46,158,110,0.25)" : "#e2e8f0"}`
                  }}>
                    {isActive ? "● Active" : "○ Inactive"}
                  </span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"12px",background:"rgba(0,123,189,0.08)",color:"#007bbd",padding:"3px 10px",borderRadius:"6px",fontWeight:"600"}}>
                    {offer.loanType||"Home Loan"}
                  </span>
                  <span style={{fontSize:"14px",fontWeight:"700",color:"#007bbd",fontFamily:"'DM Mono',monospace"}}>
                    {offer.interestRate && offer.interestRate !== "" ? `${offer.interestRate}% p.a.` : "Rate not set"}
                  </span>
                  {offer.processingFee && offer.processingFee !== "" && (
                    <span style={{fontSize:"13px",color:"#64748b"}}>
                      • Processing: <strong style={{color:"#334155",fontWeight:"600"}}>
                        {
                          String(offer.processingFee).startsWith("₹") || String(offer.processingFee).endsWith("%")
                            ? offer.processingFee
                            : isNaN(offer.processingFee) || Number(offer.processingFee) > 15
                            ? `₹${Number(offer.processingFee).toLocaleString("en-IN")}`
                            : `${offer.processingFee}%`
                        }
                      </strong>
                    </span>
                  )}
                  {offer.maxTenure && offer.maxTenure !== "" && (
                    <span style={{fontSize:"13px",color:"#64748b"}}>• Up to <strong style={{color:"#334155",fontWeight:"600"}}>{offer.maxTenure} yrs</strong></span>
                  )}
                </div>
                {offer.features && (typeof offer.features==="string"?offer.features.split(","):offer.features).filter(Boolean).length > 0 && (
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                    {(typeof offer.features==="string"?offer.features.split(","):offer.features).filter(Boolean).map((f,j)=>(
                      <span key={j} style={{fontSize:"11px",color:"#475569",background:"#f8fafc",padding:"2px 8px",borderRadius:"4px",border:"1px solid #e2e8f0",fontWeight:"500"}}>
                        ✓ {typeof f==="string"?f.trim():f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",flexShrink:0,marginLeft:"16px"}}>
              {/* Toggle Switch */}
              <div
                onClick={() => handleToggleOfferStatus && handleToggleOfferStatus(offer)}
                title={isActive ? "Click to Deactivate offer" : "Click to Activate offer"}
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:"8px",
                  background: isActive ? "rgba(46,158,110,0.08)" : "#f1f5f9",
                  padding:"5px 12px",
                  borderRadius:"20px",
                  border: `1px solid ${isActive ? "rgba(46,158,110,0.25)" : "#e2e8f0"}`,
                  cursor:"pointer",
                  userSelect:"none"
                }}
              >
                <span style={{fontSize:"12px",fontWeight:"600",color:isActive?"#2E9E6E":"#64748b"}}>
                  {isActive ? "Active" : "Inactive"}
                </span>
                <div
                  style={{
                    width: "36px",
                    height: "20px",
                    borderRadius: "10px",
                    background: isActive ? "#2E9E6E" : "#cbd5e1",
                    position: "relative",
                    transition: "background 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      position: "absolute",
                      top: "3px",
                      left: isActive ? "19px" : "3px",
                      transition: "left 0.25s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>
              <button onClick={()=>handleEditOffer(offer)} style={{fontSize:"13px",padding:"8px 16px",border:"1px solid rgba(0,123,189,0.3)",borderRadius:"8px",background:"#fff",color:"#007bbd",cursor:"pointer",fontWeight:"600",transition:"all 0.2s"}} onMouseEnter={e=>{e.target.style.background="#007bbd";e.target.style.color="#fff";}} onMouseLeave={e=>{e.target.style.background="#fff";e.target.style.color="#007bbd";}}>Edit</button>
              <button onClick={()=>setDeleteConfirm(offer._id)} style={{fontSize:"13px",padding:"8px 16px",border:"1px solid #fecaca",borderRadius:"8px",background:"#fff",color:"#dc2626",cursor:"pointer",fontWeight:"600",transition:"all 0.2s"}} onMouseEnter={e=>{e.target.style.background="#dc2626";e.target.style.color="#fff";}} onMouseLeave={e=>{e.target.style.background="#fff";e.target.style.color="#dc2626";}}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
    {deleteConfirm && (<><div onClick={()=>setDeleteConfirm(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:9998}} /><div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",borderRadius:"16px",padding:"32px",width:"360px",textAlign:"center",zIndex:9999,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}><div style={{width:"56px",height:"56px",borderRadius:"50%",background:"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:"24px"}}>🗑️</div><h3 style={{margin:"0 0 8px",fontSize:"18px",fontWeight:"600",color:"#111"}}>Delete Offer?</h3><p style={{margin:"0 0 24px",fontSize:"14px",color:"#6b7280"}}>This action cannot be undone. The offer will be permanently removed.</p><div style={{display:"flex",gap:"12px",justifyContent:"center"}}><button onClick={()=>setDeleteConfirm(null)} style={{padding:"10px 24px",borderRadius:"8px",border:"1px solid #e0e0da",background:"#fff",color:"#374151",fontSize:"14px",fontWeight:"500",cursor:"pointer"}}>Cancel</button><button onClick={()=>{handleDeleteOffer(deleteConfirm);setDeleteConfirm(null);}} style={{padding:"10px 24px",borderRadius:"8px",border:"none",background:"#dc2626",color:"#fff",fontSize:"14px",fontWeight:"500",cursor:"pointer"}}>Delete</button></div></div></>)}
  </div>);
}
