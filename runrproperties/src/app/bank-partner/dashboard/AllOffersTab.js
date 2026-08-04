"use client";
import { useState } from "react";
const inputStyle = {width:"100%",padding:"11px 14px",border:"1px solid #e0e0da",borderRadius:"8px",fontSize:"14px",color:"#111",background:"#fff",outline:"none",boxSizing:"border-box"};
const labelStyle = {fontSize:"11px",fontWeight:"600",color:"#888",letterSpacing:"0.8px",textTransform:"uppercase",display:"block",marginBottom:"6px"};
const focusIn = (e) => { e.target.style.borderColor = "#1a6fd4"; };
const focusOut = (e) => { e.target.style.borderColor = "#e0e0da"; };

export default function AllOffersTab({ offers, handleDeleteOffer, showAddForm, setShowAddForm, newOffer, setNewOffer, handleSaveNewOffer, setEditForm, setActiveTab }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditOffer = (offer) => {
    const featuresStr = Array.isArray(offer.features) ? offer.features.join(", ") : (offer.features || "");
    setNewOffer({
      interestRate: offer.interestRate || "",
      processingFee: offer.processingFee || "",
      loanType: offer.loanType || "",
      maxTenure: offer.maxTenure || "",
      features: featuresStr,
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setNewOffer({ interestRate:"", processingFee:"", loanType:"", maxTenure:"", features:"" });
  };

  return (<div>
    {/* Add/Edit Offer Form */}
    {showAddForm && (
      <div style={{background:"#fff",border:"1px solid #e5e5e0",borderRadius:"12px",padding:"28px 32px",marginBottom:"20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div style={{borderLeft:"4px solid #1a6fd4",paddingLeft:"14px"}}><h3 style={{fontSize:"16px",fontWeight:"600",color:"#111",margin:0}}>{isEditing ? "Edit Offer" : "Add New Offer"}</h3><p style={{fontSize:"13px",color:"#888",marginTop:"4px",margin:0}}>Set interest rate and loan parameters</p></div>
          <button onClick={handleCancel} style={{background:"none",border:"none",fontSize:"20px",color:"#aaa",cursor:"pointer",lineHeight:1}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
          <div><label style={labelStyle}>Interest Rate (%) *</label><input type="number" placeholder="e.g. 8.50" value={newOffer.interestRate} onChange={e=>setNewOffer({...newOffer,interestRate:e.target.value})} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></div>
          <div><label style={labelStyle}>Processing Fee (%)</label><input type="number" placeholder="e.g. 0.5" value={newOffer.processingFee} onChange={e=>setNewOffer({...newOffer,processingFee:e.target.value})} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></div>
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
    <div style={{background:"#fff",border:"1px solid #e5e5e0",borderRadius:"10px",overflow:"hidden"}}>
      <div style={{padding:"16px 24px",borderBottom:"1px solid #f0f0ea",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:"15px",fontWeight:"600",color:"#111"}}>All Offers</span>
        <button onClick={()=>{setNewOffer({interestRate:"",processingFee:"",loanType:"",maxTenure:"",features:""});setIsEditing(false);setShowAddForm(true);}} style={{fontSize:"13px",background:"#1a6fd4",color:"#fff",border:"none",padding:"8px 18px",borderRadius:"7px",cursor:"pointer",fontWeight:"500"}}>+ Add Offer</button>
      </div>
      {offers.length===0?(
        <div style={{padding:"60px 20px",textAlign:"center"}}><div style={{fontSize:"36px",marginBottom:"12px"}}>🏷️</div><p style={{fontSize:"14px",color:"#999"}}>No offers yet. Create your first offer.</p></div>
      ):offers.map((offer,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid #f0f0ea"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:"16px"}}>
            <div style={{width:"60px",height:"60px",borderRadius:"10px",border:"1px solid #e5e5e0",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8f8f5",flexShrink:0}}>
              {offer.logo||offer.logoUrl
                ? <img src={offer.logo||offer.logoUrl} style={{width:"100%",height:"100%",objectFit:"contain"}} />
                : <span style={{fontSize:"16px",fontWeight:"700",color:"#1a6fd4"}}>{(offer.bankName||"").slice(0,2).toUpperCase()}</span>
              }
            </div>
            <div>
              <div style={{fontSize:"16px",fontWeight:"600",color:"#111",marginBottom:"6px"}}>{offer.bankName}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",flexWrap:"wrap"}}>
                <span style={{fontSize:"12px",background:"#eff6ff",color:"#1a6fd4",padding:"3px 10px",borderRadius:"20px",border:"1px solid #dbeafe"}}>{offer.loanType||"Home Loan"}</span>
                <span style={{fontSize:"14px",fontWeight:"600",color:"#1a6fd4"}}>{offer.interestRate && offer.interestRate !== "" ? `${offer.interestRate}% p.a.` : "Rate not set"}</span>
                {offer.processingFee && offer.processingFee !== "" && <span style={{fontSize:"13px",color:"#666"}}>• Processing: {offer.processingFee}%</span>}
                {offer.maxTenure && offer.maxTenure !== "" && <span style={{fontSize:"13px",color:"#666"}}>• Up to {offer.maxTenure} yrs</span>}
              </div>
              {offer.features && (typeof offer.features==="string"?offer.features.split(","):offer.features).filter(Boolean).length > 0 && (
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{(typeof offer.features==="string"?offer.features.split(","):offer.features).filter(Boolean).map((f,j)=>(<span key={j} style={{fontSize:"11px",color:"#666",background:"#f5f5f0",padding:"2px 8px",borderRadius:"4px",border:"1px solid #e8e8e3"}}>✓ {typeof f==="string"?f.trim():f}</span>))}</div>
              )}
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",flexShrink:0,marginTop:"4px"}}>
            <button onClick={()=>handleEditOffer(offer)} style={{fontSize:"13px",padding:"8px 18px",border:"1px solid #1a6fd4",borderRadius:"7px",background:"#fff",color:"#1a6fd4",cursor:"pointer",fontWeight:"500"}}>Edit</button>
            <button onClick={()=>handleDeleteOffer(offer._id)} style={{fontSize:"13px",padding:"8px 18px",border:"1px solid #fca5a5",borderRadius:"7px",background:"#fff",color:"#dc2626",cursor:"pointer",fontWeight:"500"}}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>);
}
