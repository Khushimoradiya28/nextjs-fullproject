"use client";
import { useState } from "react";

export default function LeadsTab({ leads, leadsLoading, statusFilter, setStatusFilter, fetchLeads, handleLeadUpdate }) {
  const exportToCSV = () => {
    if (!leads || leads.length === 0) {
      alert("No leads to export");
      return;
    }
    const headers = ["Name", "Email", "Phone", "Loan Amount", "Employment Type", "Monthly Income", "Status", "User Message", "Internal Notes", "Date"];
    const rows = leads.map((l) => [
      `"${l.name || ""}"`,
      `"${l.email || ""}"`,
      `"${l.phone || l.mobile || ""}"`,
      `"${l.loanAmount || ""}"`,
      `"${l.employmentType || "Salaried"}"`,
      `"${l.monthlyIncome || ""}"`,
      `"${l.status || "pending"}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN") : ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bank_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <h2 style={{margin:0,fontSize:"1.5rem",fontWeight:"600",color:"#1A1A1A",fontFamily:"'Playfair Display',serif"}}>All Leads</h2>
          <p style={{margin:"4px 0 0",fontSize:"13px",color:"#8A8A8A"}}>{leads.length} total leads received</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <button
            onClick={exportToCSV}
            style={{
              padding:"9px 16px",
              background:"#ffffff",
              border:"1.5px solid #007bbd",
              color:"#007bbd",
              borderRadius:"8px",
              fontSize:"13px",
              fontWeight:"600",
              cursor:"pointer",
              display:"flex",
              alignItems:"center",
              gap:"6px",
              transition:"all 0.2s ease"
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="#007bbd";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#ffffff";e.currentTarget.style.color="#007bbd";}}
          >
            📥 Export CSV
          </button>
          <select value={statusFilter} onChange={(e)=>{setStatusFilter(e.target.value);fetchLeads(e.target.value);}} style={{padding:"9px 16px",border:"1px solid rgba(0,123,189,0.2)",borderRadius:"8px",fontSize:"13px",background:"white",color:"#1A1A1A",cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>
      </div>
      {leadsLoading && <p style={{color:"#8A8A8A",fontSize:"14px"}}>Loading leads...</p>}
      {leads.length===0 && !leadsLoading && (
        <div style={{textAlign:"center",padding:"60px 20px",background:"#fff",borderRadius:"14px",border:"1px solid rgba(0,123,189,0.12)",boxShadow:"0 2px 20px rgba(0,123,189,0.07)"}}>
          <div style={{fontSize:"48px",marginBottom:"16px",opacity:0.5}}>📋</div>
          <h3 style={{color:"#1A1A1A",marginBottom:"8px",fontFamily:"'Playfair Display',serif"}}>No leads yet</h3>
          <p style={{color:"#8A8A8A",fontSize:"14px"}}>When users enquire about your offers or properties, leads will appear here.</p>
        </div>
      )}
      {leads.map(lead => <LeadCard key={lead._id||lead.id} lead={lead} onUpdate={handleLeadUpdate} />)}
    </div>
  );
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
    <div style={{background:"#fff",borderRadius:"14px",border:"1px solid rgba(0,123,189,0.12)",marginBottom:"14px",overflow:"hidden",boxShadow:"0 2px 20px rgba(0,123,189,0.06)",transition:"all 0.2s ease"}}>
      {/* Card Header */}
      <div style={{padding:"18px 24px",cursor:"pointer",display:"flex",alignItems:"center",gap:"16px"}} onClick={()=>setExpanded(!expanded)}>
        <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"#007bbd",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",fontSize:"16px",flexShrink:0}}>
          {lead.name?.charAt(0).toUpperCase()||"?"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
            <p style={{margin:0,fontSize:"15px",fontWeight:"600",color:"#1A1A1A"}}>{lead.name}</p>
            {lead.employmentType && (
              <span style={{fontSize:"11px",background:"#eff6ff",color:"#007bbd",padding:"2px 8px",borderRadius:"4px",border:"1px solid #dbeafe",fontWeight:"600"}}>
                💼 {lead.employmentType}
              </span>
            )}
            {lead.monthlyIncome && (
              <span style={{fontSize:"11px",background:"#f0fdf4",color:"#16a34a",padding:"2px 8px",borderRadius:"4px",border:"1px solid #bbf7d0",fontWeight:"600"}}>
                💰 {lead.monthlyIncome}
              </span>
            )}
          </div>
          <p style={{margin:"3px 0 0",fontSize:"13px",color:"#64748b"}}>{lead.email} • {lead.phone||lead.mobile}</p>
          <p style={{margin:"4px 0 0",fontSize:"11px",color:"#94a3b8",fontFamily:"'DM Mono',monospace"}}>{formatDate(lead.createdAt)}</p>
        </div>
        <div style={{textAlign:"right",marginRight:"16px"}}>
          <p style={{margin:0,fontSize:"16px",fontWeight:"700",color:"#007bbd",fontFamily:"'DM Mono',monospace"}}>{parseLoanAmount(lead.loanAmount)}</p>
          <p style={{margin:"2px 0 0",fontSize:"11px",color:"#94a3b8"}}>Loan Amount</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",background:cfg.bg,color:cfg.color,border:cfg.border,padding:"5px 14px",borderRadius:"20px",fontSize:"12px",fontWeight:"600",flexShrink:0}}>
          {cfg.label}
        </div>
        <span style={{color:"#94a3b8",fontSize:"12px",transition:"transform 0.2s",transform:expanded?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
      </div>

      {/* Expanded View */}
      {expanded && (
        <div style={{padding:"18px 24px 24px",borderTop:"1px solid rgba(0,123,189,0.08)",background:"#f8fafc"}}>
          {/* Key Lead Qualification Details */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:"12px",marginBottom:"16px"}}>
            <div style={{background:"#ffffff",padding:"10px 14px",borderRadius:"8px",border:"1px solid #e2e8f0"}}>
              <span style={{fontSize:"11px",color:"#64748b",textTransform:"uppercase",fontWeight:"600"}}>Employment Type</span>
              <div style={{fontSize:"13px",fontWeight:"600",color:"#0f172a",marginTop:"2px"}}>{lead.employmentType || "Salaried"}</div>
            </div>
            <div style={{background:"#ffffff",padding:"10px 14px",borderRadius:"8px",border:"1px solid #e2e8f0"}}>
              <span style={{fontSize:"11px",color:"#64748b",textTransform:"uppercase",fontWeight:"600"}}>Monthly Income</span>
              <div style={{fontSize:"13px",fontWeight:"600",color:"#0f172a",marginTop:"2px"}}>{lead.monthlyIncome || "Not specified"}</div>
            </div>
            <div style={{background:"#ffffff",padding:"10px 14px",borderRadius:"8px",border:"1px solid #e2e8f0"}}>
              <span style={{fontSize:"11px",color:"#64748b",textTransform:"uppercase",fontWeight:"600"}}>Loan Required</span>
              <div style={{fontSize:"13px",fontWeight:"700",color:"#007bbd",marginTop:"2px"}}>{parseLoanAmount(lead.loanAmount)}</div>
            </div>
          </div>

          {lead.message && (
            <div style={{background:"#ffffff",borderRadius:"10px",padding:"14px 18px",marginBottom:"18px",border:"1px solid rgba(0,123,189,0.18)",boxShadow:"0 2px 8px rgba(0,0,0,0.02)"}}>
              <div style={{fontSize:"11px",fontWeight:"700",color:"#007bbd",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"4px"}}>
                💬 User Message:
              </div>
              <p style={{margin:0,fontSize:"14px",color:"#334155",fontWeight:"500",lineHeight:"1.5"}}>"{lead.message}"</p>
            </div>
          )}

          {/* Action Row */}
          <div style={{display:"grid",gridTemplateColumns:"220px 1fr auto",gap:"14px",alignItems:"end"}}>
            <div>
              <label style={{fontSize:"0.7rem",fontWeight:"700",color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:"6px"}}>Update Status</label>
              <select value={status} onChange={(e)=>setStatus(e.target.value)} style={{width:"100%",padding:"10px 14px",border:"1.5px solid #cbd5e1",borderRadius:"8px",fontSize:"13px",background:"#ffffff",color:"#1A1A1A",cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}}>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:"0.7rem",fontWeight:"700",color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:"6px"}}>Internal Notes</label>
              <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Add internal notes..." style={{width:"100%",padding:"10px 14px",border:"1.5px solid #cbd5e1",borderRadius:"8px",fontSize:"13px",background:"#ffffff",color:"#1A1A1A",outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"}} />
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              {(lead.phone || lead.mobile) && (
                <a
                  href={`https://wa.me/91${String(lead.phone||lead.mobile).replace(/[^0-9]/g,"")}?text=${encodeURIComponent(`Hello ${lead.name}, thank you for your home loan enquiry regarding ${lead.message || "our offers"}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding:"10px 16px",
                    background:"#22c55e",
                    color:"white",
                    borderRadius:"8px",
                    fontSize:"13px",
                    fontWeight:"600",
                    textDecoration:"none",
                    display:"inline-flex",
                    alignItems:"center",
                    gap:"6px",
                    whiteSpace:"nowrap"
                  }}
                >
                  💬 WhatsApp
                </a>
              )}
              <button onClick={handleSave} disabled={saving} style={{padding:"10px 22px",background:saving?"#94a3b8":"#007bbd",color:"white",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"600",cursor:saving?"not-allowed":"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",transition:"background 0.2s"}}>{saving?"Saving...":"Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
