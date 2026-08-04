"use client";
import { useState } from "react";

export default function LeadsTab({ leads, leadsLoading, statusFilter, setStatusFilter, fetchLeads, handleLeadUpdate }) {
  return (<div style={{fontFamily:"'DM Sans',sans-serif"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
      <div>
        <h2 style={{margin:0,fontSize:"1.5rem",fontWeight:"600",color:"#1A1A1A",fontFamily:"'Playfair Display',serif"}}>All Leads</h2>
        <p style={{margin:"4px 0 0",fontSize:"13px",color:"#8A8A8A"}}>{leads.length} total leads</p>
      </div>
      <select value={statusFilter} onChange={(e)=>{setStatusFilter(e.target.value);fetchLeads(e.target.value);}} style={{padding:"8px 16px",border:"1px solid rgba(0,123,189,0.2)",borderRadius:"8px",fontSize:"13px",background:"white",color:"#1A1A1A",cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="contacted">Contacted</option>
        <option value="in_progress">In Progress</option>
        <option value="closed_won">Closed Won</option>
        <option value="closed_lost">Closed Lost</option>
      </select>
    </div>
    {leadsLoading && <p style={{color:"#8A8A8A",fontSize:"14px"}}>Loading leads...</p>}
    {leads.length===0 && !leadsLoading && (
      <div style={{textAlign:"center",padding:"60px 20px",background:"#fff",borderRadius:"14px",border:"1px solid rgba(0,123,189,0.12)",boxShadow:"0 2px 20px rgba(0,123,189,0.07)"}}>
        <div style={{fontSize:"48px",marginBottom:"16px",opacity:0.5}}>📋</div>
        <h3 style={{color:"#1A1A1A",marginBottom:"8px",fontFamily:"'Playfair Display',serif"}}>No leads yet</h3>
        <p style={{color:"#8A8A8A",fontSize:"14px"}}>When users enquire about your offers, leads will appear here.</p>
      </div>
    )}
    {leads.map(lead => <LeadCard key={lead._id||lead.id} lead={lead} onUpdate={handleLeadUpdate} />)}
  </div>);
}

function LeadCard({ lead, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(lead.status || "pending");
  const [notes, setNotes] = useState(lead.notes || "");
  const [saving, setSaving] = useState(false);

  const statusConfig = {
    pending:     { label:"Pending",     bg:"rgba(212,98,31,0.1)", color:"#D4621F", border:"1px solid rgba(212,98,31,0.25)" },
    contacted:   { label:"Contacted",   bg:"rgba(0,123,189,0.08)", color:"#007bbd", border:"1px solid rgba(0,123,189,0.2)" },
    in_progress: { label:"In Progress", bg:"rgba(0,123,189,0.06)", color:"#005f94", border:"1px solid rgba(0,123,189,0.2)" },
    closed_won:  { label:"Closed Won",  bg:"rgba(46,158,110,0.1)", color:"#2E9E6E", border:"1px solid rgba(46,158,110,0.25)" },
    closed_lost: { label:"Closed Lost", bg:"rgba(220,38,38,0.08)", color:"#dc2626", border:"1px solid rgba(220,38,38,0.2)" },
  };
  const cfg = statusConfig[status] || statusConfig.pending;
  const formatDate = (d) => { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); };
  const handleSave = async () => { setSaving(true); await onUpdate(lead._id||lead.id, status, notes); setSaving(false); setExpanded(false); };
  const parseLoanAmount = (amt) => { if (!amt) return "—"; const num = typeof amt === "number" ? amt : Number(String(amt).replace(/[^0-9.]/g,"")); return isNaN(num) ? amt : "₹ " + num.toLocaleString("en-IN"); };

  return (
    <div style={{background:"#fff",borderRadius:"14px",border:"1px solid rgba(0,123,189,0.12)",marginBottom:"12px",overflow:"hidden",boxShadow:"0 2px 20px rgba(0,123,189,0.07)",transition:"box-shadow 0.2s"}}>
      <div style={{padding:"18px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:"16px"}} onClick={()=>setExpanded(!expanded)}>
        <div style={{width:"42px",height:"42px",borderRadius:"50%",background:"#007bbd",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"600",fontSize:"16px",flexShrink:0}}>{lead.name?.charAt(0).toUpperCase()||"?"}</div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{margin:0,fontSize:"15px",fontWeight:"600",color:"#1A1A1A"}}>{lead.name}</p>
          <p style={{margin:"2px 0 0",fontSize:"13px",color:"#8A8A8A"}}>{lead.email} • {lead.phone||lead.mobile}</p>
          <p style={{margin:"2px 0 0",fontSize:"11px",color:"#AAAAAA",fontFamily:"'DM Mono',monospace"}}>{formatDate(lead.createdAt)}</p>
        </div>
        <div style={{textAlign:"right",marginRight:"16px"}}>
          <p style={{margin:0,fontSize:"16px",fontWeight:"600",color:"#1A1A1A",fontFamily:"'DM Mono',monospace"}}>{parseLoanAmount(lead.loanAmount)}</p>
          <p style={{margin:"2px 0 0",fontSize:"11px",color:"#AAAAAA"}}>Loan Amount</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",background:cfg.bg,color:cfg.color,border:cfg.border,padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",flexShrink:0}}>{cfg.label}</div>
        <span style={{color:"#AAAAAA",fontSize:"12px",transition:"transform 0.2s",transform:expanded?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
      </div>

      {expanded && (
        <div style={{padding:"0 22px 22px",borderTop:"1px solid rgba(0,123,189,0.08)"}}>
          {lead.message && (
            <div style={{background:"#F8FCFF",borderRadius:"8px",padding:"12px 16px",margin:"16px 0 0",borderLeft:"3px solid #007bbd"}}>
              <p style={{margin:0,fontSize:"13px",color:"#555",fontStyle:"italic"}}>"{lead.message}"</p>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"12px",marginTop:"16px",alignItems:"end"}}>
            <div>
              <label style={{fontSize:"0.68rem",fontWeight:"600",color:"#AAAAAA",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:"6px"}}>Update Status</label>
              <select value={status} onChange={(e)=>setStatus(e.target.value)} style={{width:"100%",padding:"8px 12px",border:"1px solid rgba(0,123,189,0.2)",borderRadius:"8px",fontSize:"13px",background:"white",color:"#1A1A1A",cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
                <option value="pending">Pending</option><option value="contacted">Contacted</option><option value="in_progress">In Progress</option><option value="closed_won">Closed Won</option><option value="closed_lost">Closed Lost</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:"0.68rem",fontWeight:"600",color:"#AAAAAA",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:"6px"}}>Internal Notes</label>
              <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Add internal notes..." style={{width:"100%",padding:"8px 12px",border:"1px solid rgba(0,123,189,0.2)",borderRadius:"8px",fontSize:"13px",outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"}} />
            </div>
            <button onClick={handleSave} disabled={saving} style={{padding:"9px 20px",background:saving?"#AAAAAA":"#007bbd",color:"white",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"600",cursor:saving?"not-allowed":"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",transition:"background 0.2s"}}>{saving?"Saving...":"Save Changes"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
