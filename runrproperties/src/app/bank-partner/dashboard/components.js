"use client";
import { useState } from "react";
import OverviewTab from "./OverviewTab";
import LeadsTab from "./LeadsTab";
import ProfileTab from "./ProfileTab";
import AllOffersTab from "./AllOffersTab";

export { OverviewTab, LeadsTab, ProfileTab, AllOffersTab };

export function Nav({ activeTab, setActiveTab, profile, showNotifs, setShowNotifs, unreadCount, notifications, markAllRead }) {
  return (
    <nav style={{ background:"#fff", borderBottom:"1px solid #e5e5e0", padding:"0 28px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
      <img src="/logo/runr-logo-new.svg" alt="runr" style={{ height:"34px", objectFit:"contain" }} />
      <div style={{ display:"flex", gap:"4px" }}>
        {["Overview","Leads","Profile","Add Offer","All Offers"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:"6px 18px", borderRadius:"6px", border:"none", fontSize:"13px", fontWeight: activeTab===tab ? "600" : "400", background: activeTab===tab ? "#eff6ff" : "transparent", color: activeTab===tab ? "#1a6fd4" : "#666", cursor:"pointer" }}>{tab}</button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
        <div style={{position:"relative", cursor:"pointer"}} onClick={() => setShowNotifs(!showNotifs)}>
          <span style={{fontSize:"18px"}}>🔔</span>
          {unreadCount > 0 && <span style={{position:"absolute",top:"-4px",right:"-4px",background:"#ef4444",color:"#fff",fontSize:"10px",width:"16px",height:"16px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"600"}}>{unreadCount}</span>}
          {showNotifs && (
            <div style={{position:"absolute",top:"36px",right:0,width:"300px",background:"#fff",border:"1px solid #e5e5e0",borderRadius:"10px",boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:100,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f0f0ea",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"13px",fontWeight:"600"}}>Notifications</span>
                <button onClick={(e)=>{e.stopPropagation();markAllRead();}} style={{fontSize:"11px",color:"#1a6fd4",background:"none",border:"none",cursor:"pointer"}}>Mark all read</button>
              </div>
              <div style={{maxHeight:"280px",overflowY:"auto"}}>
                {notifications.length===0 ? <div style={{padding:"24px",textAlign:"center",color:"#999",fontSize:"12px"}}>No notifications</div> : notifications.slice(0,10).map((n,i) => (
                  <div key={i} style={{padding:"10px 16px",borderBottom:"1px solid #f8f8f5",background:n.read?"#fff":"#fffdf5"}}>
                    <p style={{fontSize:"12px",color:"#333",margin:0}}>{n.msg}</p>
                    <p style={{fontSize:"10px",color:"#aaa",margin:"3px 0 0"}}>{new Date(n.time).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div onClick={() => setActiveTab("Profile")} style={{ display:"flex", alignItems:"center", gap:"8px", background:"#f5f5f0", border:"1px solid #e0e0da", borderRadius:"20px", padding:"5px 14px 5px 8px", cursor:"pointer" }}>
          <div style={{ width:"28px", height:"28px", background:"#1a4fa0", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"11px", fontWeight:"600" }}>{profile?.bankName?.slice(0,2).toUpperCase() || "BP"}</div>
          <span style={{ fontSize:"13px", fontWeight:"500", color:"#111" }}>{profile?.bankName || "Bank Partner"}</span>
          <div style={{ width:"8px", height:"8px", background: profile?.status === "approved" ? "#22c55e" : "#f59e0b", borderRadius:"50%" }} />
        </div>
      </div>
    </nav>
  );
}

export function Sidebar({ activeTab, setActiveTab, handleLogout }) {
  return (
    <aside style={{ width:"240px", background:"#fff", borderRight:"1px solid #e5e5e0", display:"flex", flexDirection:"column", minHeight:"calc(100vh - 60px)", position:"sticky", top:"60px" }}>
      <div style={{ padding:"20px 0", flex:1 }}>
        <p style={{ fontSize:"11px", color:"#aaa", letterSpacing:"1.4px", textTransform:"uppercase", padding:"16px 24px 6px" }}>Main</p>
        {[{label:"Overview",icon:"📊"},{label:"Leads",icon:"👥"},{label:"Profile",icon:"📄"},{label:"Add Offer",icon:"➕"},{label:"All Offers",icon:"🏷️"}].map(item => (
          <div key={item.label} onClick={() => setActiveTab(item.label)} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 24px", fontSize:"14px", cursor:"pointer", borderLeft: activeTab===item.label ? "3px solid #1a6fd4" : "3px solid transparent", background: activeTab===item.label ? "#eff6ff" : "transparent", color: activeTab===item.label ? "#1a6fd4" : "#444", fontWeight: activeTab===item.label ? "600" : "400", transition:"all 0.15s" }}><span style={{fontSize:"18px"}}>{item.icon}</span>{item.label}</div>
        ))}
        <p style={{ fontSize:"11px", color:"#aaa", letterSpacing:"1.4px", textTransform:"uppercase", padding:"16px 24px 6px" }}>Reports</p>
        {[{label:"Analytics",icon:"📈"},{label:"Settings",icon:"⚙️"}].map(item => (
          <div key={item.label} onClick={() => setActiveTab(item.label)} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 24px", fontSize:"14px", cursor:"pointer", borderLeft: activeTab===item.label ? "3px solid #1a6fd4" : "3px solid transparent", background: activeTab===item.label ? "#eff6ff" : "transparent", color: activeTab===item.label ? "#1a6fd4" : "#444", fontWeight: activeTab===item.label ? "600" : "400", transition:"all 0.15s" }}><span style={{fontSize:"18px"}}>{item.icon}</span>{item.label}</div>
        ))}
      </div>
      <div style={{ padding:"16px 24px", borderTop:"1px solid #e5e5e0" }}>
        <button onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:"10px", color:"#999", fontSize:"14px", background:"none", border:"none", cursor:"pointer", padding:"8px 0" }}>🚪 Logout</button>
      </div>
    </aside>
  );
}
