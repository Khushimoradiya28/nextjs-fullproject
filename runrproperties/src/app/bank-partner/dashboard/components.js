"use client";
import { useState } from "react";
import OverviewTab from "./OverviewTab";
import LeadsTab from "./LeadsTab";
import ProfileTab from "./ProfileTab";
import AllOffersTab from "./AllOffersTab";

export { OverviewTab, LeadsTab, ProfileTab, AllOffersTab };

const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');`;

export function Nav({ activeTab, setActiveTab, profile, showNotifs, setShowNotifs, unreadCount, notifications, markAllRead }) {
  return (
    <>
      <style>{fonts}</style>
      <nav style={{ background:"rgba(255,255,255,0.92)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(0,123,189,0.1)", padding:"0 28px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <img src="/logo/runr-logo-new.svg" alt="runr" style={{ height:"34px", objectFit:"contain" }} />
          <div style={{width:"24px",height:"2px",background:"#007bbd",marginTop:"2px",borderRadius:"1px"}} />
        </div>
        <div style={{ display:"flex", gap:"4px" }}>
          {["Overview","Leads","Profile","Add Offer","All Offers"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:"6px 16px", borderRadius:"4px", border:"none", borderBottom: activeTab===tab ? "2px solid #007bbd" : "2px solid transparent", fontSize:"0.72rem", fontWeight:"500", letterSpacing:"0.09em", textTransform:"uppercase", background:"transparent", color: activeTab===tab ? "#007bbd" : "#555", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s ease" }}>{tab}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{position:"relative", cursor:"pointer"}} onClick={() => setShowNotifs(!showNotifs)}>
            <span style={{fontSize:"18px"}}>🔔</span>
            {unreadCount > 0 && <span style={{position:"absolute",top:"-4px",right:"-4px",background:"#D4621F",color:"#fff",fontSize:"10px",width:"16px",height:"16px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"600"}}>{unreadCount}</span>}
            {showNotifs && (
              <div style={{position:"absolute",top:"36px",right:0,width:"300px",background:"#fff",border:"1px solid rgba(0,123,189,0.15)",borderRadius:"12px",boxShadow:"0 8px 32px rgba(0,0,0,0.1)",zIndex:100,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(0,123,189,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"13px",fontWeight:"600",fontFamily:"'Playfair Display',serif",color:"#1A1A1A"}}>Notifications</span>
                  <button onClick={(e)=>{e.stopPropagation();markAllRead();}} style={{fontSize:"11px",color:"#007bbd",background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Mark all read</button>
                </div>
                <div style={{maxHeight:"280px",overflowY:"auto"}}>
                  {notifications.length===0 ? <div style={{padding:"24px",textAlign:"center",color:"#8A8A8A",fontSize:"12px"}}>No notifications</div> : notifications.slice(0,10).map((n,i) => (
                    <div key={i} style={{padding:"10px 16px",borderBottom:"1px solid rgba(0,123,189,0.05)",background:n.read?"#fff":"#F8FCFF"}}>
                      <p style={{fontSize:"12px",color:"#333",margin:0}}>{n.msg}</p>
                      <p style={{fontSize:"10px",color:"#aaa",margin:"3px 0 0",fontFamily:"'DM Mono',monospace"}}>{new Date(n.time).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div onClick={() => setActiveTab("Profile")} style={{ display:"flex", alignItems:"center", gap:"8px", background:"#fff", border:"1px solid rgba(0,123,189,0.25)", borderRadius:"999px", padding:"5px 14px 5px 8px", cursor:"pointer", transition:"all 0.2s ease" }}>
            <div style={{ width:"28px", height:"28px", background:"#007bbd", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"11px", fontWeight:"600" }}>{profile?.bankName?.slice(0,2).toUpperCase() || "BP"}</div>
            <span style={{ fontSize:"13px", fontWeight:"500", color:"#007bbd", fontFamily:"'DM Sans',sans-serif" }}>{profile?.bankName || "Bank Partner"}</span>
            <div style={{ width:"8px", height:"8px", background: profile?.status === "approved" ? "#2E9E6E" : "#D4621F", borderRadius:"50%" }} />
          </div>
        </div>
      </nav>
    </>
  );
}

export function Sidebar({ activeTab, setActiveTab, handleLogout }) {
  return (
    <aside style={{ width:"240px", background:"#FFFFFF", borderRight:"1px solid rgba(0,123,189,0.12)", display:"flex", flexDirection:"column", minHeight:"calc(100vh - 60px)", position:"sticky", top:"60px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ padding:"20px 0", flex:1 }}>
        <p style={{ fontSize:"0.65rem", color:"#BBBBBB", letterSpacing:"0.12em", textTransform:"uppercase", padding:"16px 24px 6px", fontWeight:"500" }}>Main</p>
        {[{label:"Overview",icon:"📊"},{label:"Leads",icon:"👥"},{label:"Profile",icon:"📄"},{label:"Add Offer",icon:"➕"},{label:"All Offers",icon:"🏷️"}].map(item => (
          <div key={item.label} onClick={() => setActiveTab(item.label)} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 24px", fontSize:"14px", cursor:"pointer", borderLeft: activeTab===item.label ? "3px solid #007bbd" : "3px solid transparent", background: activeTab===item.label ? "rgba(0,123,189,0.07)" : "transparent", color: activeTab===item.label ? "#007bbd" : "#555555", fontWeight: activeTab===item.label ? "500" : "400", transition:"all 0.2s ease" }}><span style={{fontSize:"18px"}}>{item.icon}</span>{item.label}</div>
        ))}
        <p style={{ fontSize:"0.65rem", color:"#BBBBBB", letterSpacing:"0.12em", textTransform:"uppercase", padding:"16px 24px 6px", fontWeight:"500" }}>Reports</p>
        {[{label:"Analytics",icon:"📈"},{label:"Settings",icon:"⚙️"}].map(item => (
          <div key={item.label} onClick={() => setActiveTab(item.label)} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 24px", fontSize:"14px", cursor:"pointer", borderLeft: activeTab===item.label ? "3px solid #007bbd" : "3px solid transparent", background: activeTab===item.label ? "rgba(0,123,189,0.07)" : "transparent", color: activeTab===item.label ? "#007bbd" : "#555555", fontWeight: activeTab===item.label ? "500" : "400", transition:"all 0.2s ease" }}><span style={{fontSize:"18px"}}>{item.icon}</span>{item.label}</div>
        ))}
      </div>
      <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(0,123,189,0.1)" }}>
        <button onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:"10px", color:"#8A8A8A", fontSize:"14px", background:"none", border:"none", cursor:"pointer", padding:"8px 0", transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color="#D4621F"} onMouseLeave={e=>e.currentTarget.style.color="#8A8A8A"}>🚪 Logout</button>
      </div>
    </aside>
  );
}
