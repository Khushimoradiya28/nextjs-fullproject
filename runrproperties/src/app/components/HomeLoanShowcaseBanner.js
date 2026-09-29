"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { API_BASE, getMediaUrl } from "../services/api";
import dynamic from "next/dynamic";
import styles from "./HomeLoanShowcaseBanner.module.css";

const BankEnquiryModal = dynamic(
  () => import("../home-loans/BankEnquiryModal"),
  { ssr: false }
);

const fallbackBanks = [
  {
    _id: "fb-1",
    name: "HDFC Bank",
    rate: 7.25,
    loanType: "Home Loan",
    processingFee: "0.50%",
    maxTenure: 30,
    image: "/img/banks/hdfc.jpg",
    hasActiveOffer: true,
  },
  {
    _id: "fb-2",
    name: "SBI",
    rate: 7.25,
    loanType: "Home Loan",
    processingFee: "Nil / Min",
    maxTenure: 30,
    image: "/img/banks/sbi.jpg",
    hasActiveOffer: true,
  },
  {
    _id: "fb-3",
    name: "ICICI Bank",
    rate: 7.35,
    loanType: "Home Loan",
    processingFee: "0.50%",
    maxTenure: 30,
    image: "/img/banks/icici.jpg",
    hasActiveOffer: true,
  },
  {
    _id: "fb-4",
    name: "Kotak Mahindra Bank",
    rate: 7.30,
    loanType: "Home Loan",
    processingFee: "Nil",
    maxTenure: 30,
    image: "/img/banks/kotak.jpg",
    hasActiveOffer: true,
  },
  {
    _id: "fb-5",
    name: "Bank of Baroda",
    rate: 7.45,
    loanType: "Home Loan",
    processingFee: "Nil",
    maxTenure: 30,
    image: "/img/banks/bob.jpg",
    hasActiveOffer: true,
  },
];

function BankCard({ bank, onCheck, selected }) {
  const logoUrl = getMediaUrl(bank.image);

  const bankStyles = {
    sbi: { color: "#0083ca", name: "SBI" },
    hdfc: { color: "#004c8f", name: "HDFC BANK" },
    icici: { color: "#f37021", name: "ICICI Bank" },
    kotak: { color: "#ed1c24", name: "kotak" },
    axis: { color: "#97144d", name: "AXIS BANK" },
    bob: { color: "#f26522", name: "Bank of Baroda" },
    pnb: { color: "#a20a3a", name: "PNB Housing" },
    "l&t": { color: "#fdb813", name: "L&T Finance" },
  };

  const key = Object.keys(bankStyles).find((k) =>
    (bank.name || "").toLowerCase().includes(k)
  );
  const brand = key ? bankStyles[key] : null;

  return (
    <div
      className={`${styles.bankCardItem} ${selected ? styles.bankCardItemSelected : ""}`}
      onClick={() => onCheck(bank)}
      role="button"
      tabIndex={0}
      title={`Apply with ${bank.name}`}
    >
      <div className={styles.bankLogoWrap}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={bank.name}
            className={styles.bankLogoImg}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget.parentElement.querySelector(
                `.${styles.bankBrandFallback}`
              );
              if (fb) fb.style.display = "flex";
            }}
          />
        ) : null}

        <div
          className={styles.bankBrandFallback}
          style={{ display: logoUrl ? "none" : "flex" }}
        >
          {brand ? (
            <div className={styles.brandFallbackInner} style={{ color: brand.color }}>
              <span className={styles.brandLogoDot} style={{ background: brand.color }}></span>
              <span className={styles.brandFallbackName}>{brand.name}</span>
            </div>
          ) : (
            <span className={styles.brandFallbackName} style={{ color: "#007bbd" }}>
              {bank.name}
            </span>
          )}
        </div>
      </div>

      <div className={styles.bankBottomArea}>
        <span className={styles.bankRatePillBadge}>
          Starts at {bank.rate}%
        </span>
        <span className={styles.bankApplyBtn}>
          <span>Apply Loan</span>
          <span style={{ fontSize: "1rem" }}>→</span>
        </span>
      </div>
    </div>
  );
}

export default function HomeLoanShowcaseBanner({
  property = null,
  onExplore = null,
  onCheckEligibility = null,
}) {
  const router = useRouter();
  const auth = useAuth() || {};
  const user = auth.user;

  const [dynamicBanks, setDynamicBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [enquiryBank, setEnquiryBank] = useState(null);

  const fetchBanks = () => {
    const API = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${API}/bank-partners/public`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Not ok");
        return r.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const unique = data.data.filter(
            (bank, index, self) =>
              index === self.findIndex((b) => b._id === bank._id)
          );
          setDynamicBanks(unique);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBanks();
    const handleFocus = () => fetchBanks();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const displayBanks = useMemo(() => {
    if (dynamicBanks.length === 0) return fallbackBanks;
    const all = dynamicBanks
      .filter((b) => b.isActive !== false)
      .map((b) => {
        const activeOffers = (b.offers || []).filter((o) => o.isActive !== false);
        const latestOffer = activeOffers.length > 0 ? activeOffers[activeOffers.length - 1] : null;
        const rate = latestOffer?.interestRate || b.interestRate;
        const loanType = latestOffer?.loanType || b.loanType || "Home Loan";
        return {
          _id: b._id,
          name: b.name,
          rate: rate ? parseFloat(rate) : 8.5,
          loanType,
          processingFee: latestOffer?.processingFee || b.processingFee || "Zero",
          maxTenure: latestOffer?.maxTenure || b.maxTenure || 30,
          image: b.logo || b.image,
          hasActiveOffer: activeOffers.length > 0,
        };
      });
    return all.length > 0 ? all : fallbackBanks;
  }, [dynamicBanks]);

  const dynamicBankCount = useMemo(() => {
    const count = dynamicBanks.length > 0 
      ? dynamicBanks.filter((b) => b.isActive !== false).length 
      : displayBanks.length;
    if (count === 0) return "Top Banks";
    return `${count}+ Banks`;
  }, [dynamicBanks, displayBanks]);

  const lowestRate = useMemo(() => {
    const list = displayBanks.length > 0 ? displayBanks : fallbackBanks;
    const rates = list.map((b) => parseFloat(b.rate)).filter((r) => !isNaN(r) && r > 0);
    return rates.length > 0 ? `${Math.min(...rates).toFixed(2)}%` : "7.20%";
  }, [displayBanks]);

  const handleCheckOffer = (bank) => {
    if (!user) {
      router.push(`/login?redirect=${typeof window !== "undefined" ? window.location.pathname : "/home-loans"}`);
      return;
    }
    setEnquiryBank(bank);
  };

  return (
    <section className={styles.showcaseBannerCard} id="partner-banks">
      <div className={styles.showcaseContentArea}>
        {/* Top Brand Tagline Badge */}
        <div className={styles.showcaseBrand}>
          <span className={styles.brandBadgeDot}></span>
          <span className={styles.brandRunr}>runr</span>
          <span className={styles.brandLoans}>Loans</span>
        </div>

        {/* Main Highlighted Headline */}
        <h2 className={styles.showcaseTitle}>
          Compare Home Loan Offers from{" "}
          <span className={styles.showcaseTitleHighlight}>{dynamicBankCount}</span>
        </h2>

        {/* Bullet Points / Value Props */}
        <div className={styles.showcaseBadges}>
          <div className={styles.showcaseCheckItem}>
            <svg
              className={styles.checkIconSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="16 9 10 15 7 12" />
            </svg>
            <span>
              Rates starting from{" "}
              <strong className={styles.highlightGreen}>{lowestRate}*</strong>
            </span>
          </div>
          <div className={styles.showcaseCheckItem}>
            <svg
              className={styles.checkIconSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="16 9 10 15 7 12" />
            </svg>
            <span>
              <strong className={styles.highlightTheme}>0%*</strong> Processing Fee
            </span>
          </div>
        </div>

        {/* Bank Partner Header */}
        <div className={styles.partnerFilterRow}>
          <span className={styles.partnerPillsLabel}>OUR BANKING PARTNERS</span>
        </div>

        {/* Marquee Slider with continuous animation */}
        <div className={styles.marqueeWrap}>
          {displayBanks.length > 0 ? (
            (() => {
              let repeatedBanks = [...displayBanks];
              while (repeatedBanks.length < 10) {
                repeatedBanks = [...repeatedBanks, ...displayBanks];
              }
              return (
                <div className={styles.marqueeTrack}>
                  <div className={styles.marqueeGroup}>
                    {repeatedBanks.map((bank, idx) => (
                      <BankCard
                        key={`track1-${bank._id || bank.name}-${idx}`}
                        bank={bank}
                        onCheck={handleCheckOffer}
                        selected={selectedBank?.name === bank.name}
                      />
                    ))}
                  </div>
                  <div className={styles.marqueeGroup} aria-hidden="true">
                    {repeatedBanks.map((bank, idx) => (
                      <BankCard
                        key={`track2-${bank._id || bank.name}-${idx}`}
                        bank={bank}
                        onCheck={handleCheckOffer}
                        selected={selectedBank?.name === bank.name}
                      />
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className={styles.noBanksFound}>
              No bank partner offers found.
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className={styles.showcaseActionsRow}>
          {onExplore ? (
            <button
              type="button"
              onClick={onExplore}
              className={styles.exploreOffersLink}
            >
              <span>Explore Bank Offers</span>
              <span className={styles.exploreArrow}>→</span>
            </button>
          ) : (
            <Link href="/home-loans" className={styles.exploreOffersLink}>
              <span>Explore Bank Offers</span>
              <span className={styles.exploreArrow}>→</span>
            </Link>
          )}

          {onCheckEligibility ? (
            <button
              type="button"
              onClick={onCheckEligibility}
              className={styles.checkEligibilityBtn}
            >
              <span>Check Your Eligibility</span>
            </button>
          ) : (
            <Link href="/home-loans#loan-calculator" className={styles.checkEligibilityBtn}>
              <span>Check Your Eligibility</span>
            </Link>
          )}
        </div>
      </div>

      {/* Foreground 3D Hand holding house model */}
      <div className={styles.showcaseFloatingHand}>
        <div className={styles.floatingHouseWrap}>
          <img
            src="/img/unique_home_grip_corner.png"
            alt="Compare Home Loans - runr Loans"
            className={styles.handHoldingHouseImg}
          />
        </div>
      </div>

      {/* Direct Modal Integration */}
      {enquiryBank && (
        <BankEnquiryModal
          bank={enquiryBank}
          propertyPrice={property?.price || 0}
          propertyTitle={property?.title || ""}
          onClose={() => setEnquiryBank(null)}
          onSuccess={(bank) => {
            setSelectedBank(bank);
            setEnquiryBank(null);
          }}
        />
      )}
    </section>
  );
}
