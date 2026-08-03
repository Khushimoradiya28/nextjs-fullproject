"use client";
import { useState } from "react";
export default function LeadsTab({ leads, leadsLoading, statusFilter, setStatusFilter, fetchLeads, handleLeadUpdate }) {
  return (<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}><h1 style={{fontSize:"20px",fontWeight:"600",color:"#111"}}>All Leads</h1><select value={statusFilter} onChange={(e)=>{setStatusFilter(e.target.value);fetchLeads(e.target.value);}} style={{padding:"8px 14px",border:"1.5px solid #e5e5e0",borderRadius:"8px",fontSize:"13px",outline:"none",background:"#fff"}}><option value="">All</option><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="in_progress">In Progress</option><option value="closed_won">Closed Won</option><option value="closed_lost">Closed Lost</option></select></div>
    {leadsLoading?<p>Loading...</p>:leads.length===0?<div style={{textAlign:"center",padding:"60px",color:"#999"}}>No leads yet.</div>:leads.map(lead=><LeadCard key={lead._id||lead.id} lead={lead} onUpdate={handleLeadUpdate}/>)}
  </div>);
}
function LeadCard({ lead, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(lead.status || "pending");
  const [notes, setNotes] = useState(lead.notes || "");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => { setSaving(true); await onUpdate(lead._id||lead.id, status, notes); setSaving(false); };
  const sc = {pending:"#f59e0b",contacted:"#3b82f6",in_progress:"#8b5cf6",closed_won:"#22c55e",closed_lost:"#ef4444"};
  return (
    <div style={{background:"#fff",border:"1px solid #e5e5e0",borderRadius:"10px",marginBottom:"8px",overflow:"hidden"}}>
      <div onClick={()=>setExpanded(!expanded)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",cursor:"pointer"}}>
        <div><p style={{fontSize:"14px",fontWeight:"600",color:"#111",margin:0}}>{lead.name}</p><p style={{fontSize:"12px",color:"#888",margin:"2px 0 0"}}>{lead.email} • {lead.phone||lead.mobile}</p><p style={{fontSize:"11px",color:"#bbb",margin:"2px 0 0"}}>{lead.createdAt?new Date(lead.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):""}</p></div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{fontSize:"14px",fontWeight:"700",color:"#111"}}>₹{lead.loanAmount}</span><span style={{fontSize:"11px",padding:"3px 10px",borderRadius:"12px",fontWeight:"600",textTransform:"capitalize",background:(sc[lead.status]||"#94a3b8")+"20",color:sc[lead.status]||"#94a3b8"}}>{(lead.status||"").replace("_"," ")}</span><span style={{fontSize:"11px",color:"#bbb"}}>{expanded?"▲":"▼"}</span></div>
      </div>
      {expanded&&(<div style={{padding:"0 18px 18px",borderTop:"1px solid #f1f5f9"}}>
        {lead.message&&<p style={{fontSize:"13px",color:"#555",fontStyle:"italic",margin:"12px 0"}}>"{lead.message}"</p>}
        <div style={{display:"flex",gap:"12px",alignItems:"flex-end",flexWrap:"wrap",marginTop:"10px"}}>
          <div><label style={{fontSize:"11px",fontWeight:"600",color:"#475569",display:"block",marginBottom:"4px"}}>Status</label><select value={status} onChange={(e)=>setStatus(e.target.value)} style={{padding:"8px 12px",border:"1.5px solid #e5e5e0",borderRadius:"6px",fontSize:"13px",outline:"none"}}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="in_progress">In Progress</option><option value="closed_won">Closed Won</option><option value="closed_lost">Closed Lost</option></select></div>
          <div style={{flex:1}}><label style={{fontSize:"11px",fontWeight:"600",color:"#475569",display:"block",marginBottom:"4px"}}>Notes</label><input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Add notes..." style={{width:"100%",padding:"8px 12px",border:"1.5px solid #e5e5e0",borderRadius:"6px",fontSize:"13px",outline:"none"}}/></div>
          <button onClick={handleSave} disabled={saving} style={{padding:"8px 20px",background:"#1a6fd4",color:"#fff",border:"none",borderRadius:"6px",fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>{saving?"Saving...":"Save"}</button>
        </div>
      </div>)}
    </div>
  );
}
