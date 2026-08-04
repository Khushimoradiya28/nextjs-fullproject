"use client";
import { useState } from "react";

export default function LeadsTab({ leads, leadsLoading, statusFilter, setStatusFilter, fetchLeads, handleLeadUpdate }) {
  return (<div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
      <div>
        <h2 style={{margin:0,fontSize:"20px",fontWeight:"700",color:"#111827"}}>All Leads</h2>
        <p style={{margin:"4px 0 0",fontSize:"13px",color:"#6b7280"}}>{leads.length} total leads</p>
      </div>
      <select value={statusFilter} onChange={(e)=>{setStatusFilter(e.target.value);fetchLeads(e.target.value);}} style={{padding:"8px 16px",border:"1.5px solid #e5e7eb",borderRadius:"8px",fontSize:"13px",background:"white",color:"#374151",cursor:"pointer",outline:"none",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="contacted">Contacted</option>
        <option value="in_progress">In Progress</option>
        <option value="closed_won">Closed Won</option>
        <option value="closed_lost">Closed Lost</option>
      </select>
    </div>
    {leadsLoading && <p style={{color:"#6b7280",fontSize:"14px"}}>Loading leads...</p>}
    {leads.length===0 && !leadsLoading && (
      <div style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>📋</div>
        <h3 style={{color:"#374151",marginBottom:"8px"}}>No leads yet</h3>
        <p style={{color:"#9ca3af",fontSize:"14px"}}>When users enquire about your offers, leads will appear here.</p>
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
    pending:     { label:"Pending",     bg:"#fef3c7", color:"#d97706", dot:"#f59e0b" },
    contacted:   { label:"Contacted",   bg:"#dbeafe", color:"#1d4ed8", dot:"#3b82f6" },
    in_progress: { label:"In Progress", bg:"#ede9fe", color:"#6d28d9", dot:"#8b5cf6" },
    closed_won:  { label:"Closed Won",  bg:"#dcfce7", color:"#15803d", dot:"#22c55e" },
    closed_lost: { label:"Closed Lost", bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444" },
  };
  const cfg = statusConfig[status] || statusConfig.pending;

  const formatDate = (d) => { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); };

  const handleSave = async () => { setSaving(true); await onUpdate(lead._id||lead.id, status, notes); setSaving(false); setExpanded(false); };

  const parseLoanAmount = (amt) => {
    if (!amt) return "—";
    const num = typeof amt === "number" ? amt : Number(String(amt).replace(/[^0-9.]/g,""));
    return isNaN(num) ? amt : "₹ " + num.toLocaleString("en-IN");
  };

  return (
    <div style={{background:"white",borderRadius:"12px",border:"1px solid #e5e7eb",marginBottom:"12px",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"box-shadow 0.2s"}}>
      <div style={{padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:"16px"}} onClick={()=>setExpanded(!expanded)}>
        {/* Avatar */}
        <div style={{width:"42px",height:"42px",borderRadius:"50%",background:`hsl(${(lead.name?.charCodeAt(0)||0)*10%360}, 60%, 50%)`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",fontSize:"16px",flexShrink:0}}>
          {lead.name?.charAt(0).toUpperCase()||"?"}
        </div>
        {/* Info */}
        <div style={{flex:1,minWidth:0}}>
          <p style={{margin:0,fontSize:"15px",fontWeight:"600",color:"#111827"}}>{lead.name}</p>
          <p style={{margin:"2px 0 0",fontSize:"13px",color:"#6b7280"}}>{lead.email} • {lead.phone||lead.mobile}</p>
          <p style={{margin:"2px 0 0",fontSize:"11px",color:"#9ca3af"}}>{formatDate(lead.createdAt)}</p>
        </div>
        {/* Loan Amount */}
        <div style={{textAlign:"right",marginRight:"16px"}}>
          <p style={{margin:0,fontSize:"16px",fontWeight:"700",color:"#111827"}}>{parseLoanAmount(lead.loanAmount)}</p>
          <p style={{margin:"2px 0 0",fontSize:"11px",color:"#9ca3af"}}>Loan Amount</p>
        </div>
        {/* Status Badge */}
        <div style={{display:"flex",alignItems:"center",gap:"6px",background:cfg.bg,color:cfg.color,padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600",flexShrink:0}}>
          <span style={{width:"6px",height:"6px",borderRadius:"50%",background:cfg.dot,display:"inline-block"}} />
          {cfg.label}
        </div>
        {/* Expand */}
        <span style={{color:"#9ca3af",fontSize:"12px",transition:"transform 0.2s",transform:expanded?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
      </div>

      {expanded && (
        <div style={{padding:"0 20px 20px",borderTop:"1px solid #f3f4f6"}}>
          {lead.message && (
            <div style={{background:"#f9fafb",borderRadius:"8px",padding:"12px 16px",margin:"16px 0 0",borderLeft:"3px solid #007bbd"}}>
              <p style={{margin:0,fontSize:"13px",color:"#374151",fontStyle:"italic"}}>"{lead.message}"</p>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"12px",marginTop:"16px",alignItems:"end"}}>
            <div>
              <label style={{fontSize:"11px",fontWeight:"600",color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:"6px"}}>Update Status</label>
              <select value={status} onChange={(e)=>setStatus(e.target.value)} style={{width:"100%",padding:"8px 12px",border:"1.5px solid #e5e7eb",borderRadius:"8px",fontSize:"13px",background:"white",color:"#111827",cursor:"pointer",outline:"none"}}>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:"11px",fontWeight:"600",color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:"6px"}}>Internal Notes</label>
              <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Add internal notes..." style={{width:"100%",padding:"8px 12px",border:"1.5px solid #e5e7eb",borderRadius:"8px",fontSize:"13px",outline:"none",boxSizing:"border-box", background:"#fff"}} />
            </div>
            <button onClick={handleSave} disabled={saving} style={{padding:"9px 20px",background:saving?"#9ca3af":"#007bbd",color:"white",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"600",cursor:saving?"not-allowed":"pointer",whiteSpace:"nowrap"}}>{saving?"Saving...":"Save Changes"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
