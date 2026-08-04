"use client";
export default function OverviewTab({ stats, leads, profile, setActiveTab }) {
  const statusBg = (s) => s==="closed_won"?"rgba(46,158,110,0.1)":s==="pending"?"rgba(212,98,31,0.1)":s==="contacted"?"rgba(0,123,189,0.08)":s==="closed_lost"?"rgba(220,38,38,0.08)":"rgba(0,123,189,0.06)";
  const statusColor = (s) => s==="closed_won"?"#2E9E6E":s==="pending"?"#D4621F":s==="contacted"?"#007bbd":s==="closed_lost"?"#dc2626":"#007bbd";
  const statusBorder = (s) => s==="closed_won"?"1px solid rgba(46,158,110,0.25)":s==="pending"?"1px solid rgba(212,98,31,0.25)":"1px solid rgba(0,123,189,0.2)";
  const cards = [{label:"Total Leads",value:stats.totalLeads,icon:"👥",badge:"All time"},{label:"Pending",value:stats.pending,icon:"⏳",badge:"Action needed"},{label:"Closed Won",value:stats.closedWon,icon:"✅",badge:"Won"},{label:"Current Rate",value:profile?.interestRate?`${profile.interestRate}%`:"—",icon:"%",badge:"Live",isRate:true}];
  return (<div style={{fontFamily:"'DM Sans',sans-serif"}}>
    <div style={{marginBottom:"28px"}}><h1 style={{fontSize:"1.6rem",fontWeight:"600",color:"#1A1A1A",margin:0,fontFamily:"'Playfair Display',serif"}}>Overview</h1><p style={{fontSize:"13px",color:"#8A8A8A",marginTop:"4px"}}>Welcome back, {profile?.bankName||"Partner"}</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"28px"}}>{cards.map(c=>(<div key={c.label} style={{background:"#fff",border:"1px solid rgba(0,123,189,0.12)",borderRadius:"14px",padding:"24px",boxShadow:"0 2px 20px rgba(0,123,189,0.07)",transition:"transform 0.2s ease, box-shadow 0.2s ease",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(0,123,189,0.12)";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 20px rgba(0,123,189,0.07)";}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}><span style={{fontSize:"20px",color:"#007bbd"}}>{c.icon}</span><span style={{fontSize:"0.65rem",border:"1px solid rgba(0,123,189,0.3)",color:"#007bbd",padding:"2px 10px",borderRadius:"20px",fontWeight:"500",letterSpacing:"0.04em"}}>{c.badge}</span></div>
      <div style={{fontSize:"2.4rem",fontWeight:"600",color:c.isRate?"#007bbd":"#1A1A1A",lineHeight:1,fontFamily:"'DM Mono',monospace"}}>{c.value}</div>
      <div style={{fontSize:"12px",color:"#8A8A8A",marginTop:"6px"}}>{c.label}</div>
    </div>))}</div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:"16px"}}>
      <div style={{background:"#fff",border:"1px solid rgba(0,123,189,0.12)",borderRadius:"14px",overflow:"hidden",boxShadow:"0 2px 20px rgba(0,123,189,0.07)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(0,123,189,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"1.35rem",fontWeight:"600",color:"#1A1A1A",fontFamily:"'Playfair Display',serif",borderLeft:"3px solid #007bbd",paddingLeft:"12px"}}>Recent Leads</span>
          <span onClick={()=>setActiveTab("Leads")} style={{fontSize:"12px",color:"#007bbd",cursor:"pointer",fontWeight:"500",transition:"all 0.2s"}} onMouseEnter={e=>e.target.style.textDecoration="underline"} onMouseLeave={e=>e.target.style.textDecoration="none"}>View all →</span>
        </div>
        {leads.length>0?(<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Name","Amount","Status","Date"].map(h=><th key={h} style={{padding:"10px 20px",fontSize:"0.68rem",color:"#AAAAAA",textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"left",borderBottom:"1px solid rgba(0,123,189,0.06)",fontWeight:"500"}}>{h}</th>)}</tr></thead><tbody>{leads.slice(0,5).map((l,i)=>(<tr key={i} style={{borderBottom:"1px solid rgba(0,123,189,0.06)",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,123,189,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"12px 20px",fontSize:"13px",fontWeight:"500",color:"#1A1A1A"}}>{l.name||"—"}</td>
          <td style={{padding:"12px 20px",fontSize:"13px",color:"#1A1A1A",fontFamily:"'DM Mono',monospace",fontWeight:"500"}}>₹{l.loanAmount||"—"}</td>
          <td style={{padding:"12px 20px"}}><span style={{fontSize:"11px",padding:"3px 10px",borderRadius:"20px",background:statusBg(l.status),color:statusColor(l.status),border:statusBorder(l.status),fontWeight:"500"}}>{(l.status||"new").replace("_"," ")}</span></td>
          <td style={{padding:"12px 20px",fontSize:"12px",color:"#AAAAAA",fontFamily:"'DM Mono',monospace"}}>{l.createdAt?new Date(l.createdAt).toLocaleDateString():"—"}</td>
        </tr>))}</tbody></table>):(<div style={{padding:"48px 20px",textAlign:"center"}}><div style={{fontSize:"32px",marginBottom:"10px",opacity:0.5}}>📭</div><p style={{fontSize:"13px",color:"#8A8A8A"}}>No leads yet</p></div>)}
      </div>

      <div style={{background:"#fff",border:"1px solid rgba(0,123,189,0.12)",borderRadius:"14px",overflow:"hidden",boxShadow:"0 2px 20px rgba(0,123,189,0.07)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(0,123,189,0.08)"}}><span style={{fontSize:"1.1rem",fontWeight:"600",color:"#1A1A1A",fontFamily:"'Playfair Display',serif"}}>Your Offer</span></div>
        <div style={{padding:"24px 20px"}}>
          <div style={{fontSize:"3rem",fontWeight:"700",lineHeight:1,fontFamily:"'DM Mono',monospace",color:"#007bbd"}}>{profile?.interestRate||"—"}<span style={{fontSize:"1.4rem"}}>%</span></div>
          <div style={{fontSize:"0.7rem",color:"#AAAAAA",marginTop:"6px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Interest rate per annum</div>
          <div style={{height:"1px",background:"rgba(0,123,189,0.1)",margin:"18px 0"}} />
          {[{l:"Bank",v:profile?.bankName||"—"},{l:"Loan Type",v:profile?.loanType||"—"},{l:"Status",v:profile?.status||"—"}].map(r=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid rgba(0,123,189,0.06)"}}>
              <span style={{fontSize:"12px",color:"#AAAAAA"}}>{r.l}</span>
              {r.l==="Status"&&r.v==="approved"?<span style={{fontSize:"11px",fontWeight:"500",color:"#2E9E6E",background:"rgba(46,158,110,0.1)",border:"1px solid rgba(46,158,110,0.25)",padding:"2px 10px",borderRadius:"20px",textTransform:"capitalize"}}>{r.v}</span>:<span style={{fontSize:"13px",fontWeight:"500",color:"#1A1A1A",textTransform:"capitalize"}}>{r.v}</span>}
            </div>
          ))}
          <button onClick={()=>setActiveTab("Add Offer")} style={{width:"100%",marginTop:"18px",padding:"10px",border:"1.5px solid #007bbd",borderRadius:"8px",color:"#007bbd",background:"transparent",fontSize:"13px",cursor:"pointer",fontWeight:"500",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s ease"}} onMouseEnter={e=>{e.target.style.background="#007bbd";e.target.style.color="#fff";}} onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#007bbd";}}>Edit Offer →</button>
        </div>
      </div>
    </div>
  </div>);
}
