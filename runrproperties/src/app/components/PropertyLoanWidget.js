"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getMediaUrl } from "../services/api";
import BankEnquiryModal from "../home-loans/BankEnquiryModal";

export default function PropertyLoanWidget({ property }) {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [enquiryBank, setEnquiryBank] = useState(null);
  const [tenureYears, setTenureYears] = useState(20);

  // By default, assume standard 80% financing of property price
  const propertyPrice = Number(property?.price) || 5000000;
  const initialLoan = Math.round(propertyPrice * 0.8);
  const [loanAmount, setLoanAmount] = useState(initialLoan);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${API}/bank-partners/public`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success && Array.isArray(d.data)) {
          // Filter only active bank partners and active offers
          const activeBanks = d.data
            .filter((b) => b.isActive !== false)
            .map((b) => {
              const activeOffers = (b.offers || []).filter((o) => o.isActive !== false);
              const latestOffer = activeOffers.length > 0 ? activeOffers[activeOffers.length - 1] : null;
              const rate = Number(latestOffer?.interestRate || b.interestRate) || 8.5;
              return {
                _id: b._id,
                name: b.bankName,
                rate: rate,
                loanType: latestOffer?.loanType || b.loanType || "Home Loan",
                processingFee: latestOffer?.processingFee || b.processingFee || "Nil",
                maxTenure: latestOffer?.maxTenure || b.maxTenure || "30",
                logo: b.logo || "",
              };
            });
          setBanks(activeBanks);
          if (activeBanks.length > 0) setSelectedBank(activeBanks[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Calculate EMI based on selected bank or default rate
  const activeRate = selectedBank?.rate || 8.5;
  const monthlyEmi = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = activeRate / 12 / 100;
    const months = tenureYears * 12;
    if (monthlyRate === 0) return Math.round(principal / months);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  }, [loanAmount, activeRate, tenureYears]);

  if (property?.listingType === "rent") return null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0, 123, 189, 0.16)",
        borderRadius: "16px",
        padding: "24px",
        marginTop: "24px",
        boxShadow: "0 4px 20px rgba(0, 123, 189, 0.06)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Widget Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🏦</span>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
              Home Loan & EMI for this Property
            </h3>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
            Compare offers from bank partners & get instant approval
          </p>
        </div>
        <Link
          href="/home-loans"
          style={{
            fontSize: "12px",
            color: "#007bbd",
            fontWeight: "600",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          View all banks →
        </Link>
      </div>

      {/* EMI Highlight Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0f7fd 0%, #e2f1fd 100%)",
          border: "1px solid rgba(0, 123, 189, 0.2)",
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#007bbd", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Estimated Monthly EMI
            </span>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#007bbd", fontFamily: "'DM Mono', monospace", marginTop: "2px" }}>
              ₹ {monthlyEmi.toLocaleString("en-IN")}
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}> /month</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              Based on {selectedBank?.name || "Selected Bank"} rate: <strong style={{color:"#007bbd"}}>{activeRate}% p.a.</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEnquiryBank(selectedBank || { name: "Bank Partner", _id: "" })}
            style={{
              background: "#007bbd",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "11px 24px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0, 123, 189, 0.3)",
              transition: "all 0.2s ease",
            }}
          >
            Apply Loan Now
          </button>
        </div>

        {/* Interactive Sliders */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "rgba(255,255,255,0.7)", padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(0,123,189,0.12)" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
              <span>Loan Amount</span>
              <span style={{ color: "#007bbd", fontFamily: "'DM Mono', monospace" }}>₹ {loanAmount.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={Math.max(propertyPrice, 5000000)}
              step={50000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#007bbd", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
              <span>₹ 1 Lakh</span>
              <span>₹ {(Math.max(propertyPrice, 5000000) / 10000000 >= 1 ? (Math.max(propertyPrice, 5000000) / 10000000).toFixed(2) + " Cr" : (Math.max(propertyPrice, 5000000) / 100000).toFixed(1) + " Lakh")}</span>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
              <span>Tenure</span>
              <span style={{ color: "#007bbd", fontFamily: "'DM Mono', monospace" }}>{tenureYears} {tenureYears === 1 ? "Year" : "Years"}</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#007bbd", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Partners Available */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "10px" }}>
          Bank Partners Financing this Property
        </span>

        {loading ? (
          <div style={{ fontSize: "13px", color: "#94a3b8", padding: "10px 0" }}>Loading bank offers...</div>
        ) : banks.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#64748b", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
            Home loans available starting from <strong>8.50% p.a.</strong> from top nationalized & private banks.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {banks.map((b) => {
              const isSelected = selectedBank?._id === b._id;
              return (
                <div
                  key={b._id}
                  onClick={() => setSelectedBank(b)}
                  style={{
                    border: `1.5px solid ${isSelected ? "#007bbd" : "#e2e8f0"}`,
                    background: isSelected ? "#f8fcff" : "#ffffff",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fff",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {b.logo ? (
                        <img
                          src={getMediaUrl(b.logo)}
                          alt={b.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2px" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#007bbd" }}>
                          {b.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#007bbd" }}>
                        {b.rate}% p.a.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: "8px", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Fee: {b.processingFee.startsWith("₹") || b.processingFee.endsWith("%") ? b.processingFee : `₹${b.processingFee}`}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEnquiryBank(b);
                      }}
                      style={{
                        background: isSelected ? "#007bbd" : "#f1f5f9",
                        color: isSelected ? "#fff" : "#007bbd",
                        border: "none",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enquiry Modal when triggered */}
      {enquiryBank && (
        <BankEnquiryModal
          bank={{
            ...enquiryBank,
            loanAmount: "",
            message: `Enquiry for Property: ${property?.title || "Property ID " + property?.id} (Price: ₹${propertyPrice.toLocaleString("en-IN")})`,
          }}
          onClose={() => setEnquiryBank(null)}
          onSuccess={() => setEnquiryBank(null)}
        />
      )}
    </div>
  );
}
