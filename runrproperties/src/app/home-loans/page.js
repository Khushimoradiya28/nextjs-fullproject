"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./homeloans.module.css";

import { HiOutlineCalculator, HiOutlineBadgeCheck } from "react-icons/hi";

import dynamic from "next/dynamic";
const BankEnquiryModal = dynamic(() => import("./BankEnquiryModal"), {
  ssr: false,
});

function calculateEMI(principal, annualRate, years) {
  const months = years * 12;
  const monthlyRate = annualRate / 1200;
  if (months <= 0 || principal <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const rateFactor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * rateFactor) / (rateFactor - 1);
}

function calculateEligibility(monthlyIncome, existingEmi, interestRate, tenureYears) {
  const FOIR = 0.5; // Max 50% of income can go to EMI
  const availableEmi = Math.max(0, monthlyIncome * FOIR - existingEmi);
  if (availableEmi <= 0) return { maxLoan: 0, maxEmi: 0 };
  
  const monthlyRate = interestRate / 1200;
  const months = tenureYears * 12;
  if (monthlyRate === 0) return { maxLoan: availableEmi * months, maxEmi: availableEmi };
  
  const rateFactor = Math.pow(1 + monthlyRate, months);
  // P = E * (rateFactor - 1) / (monthlyRate * rateFactor)
  const maxLoan = (availableEmi * (rateFactor - 1)) / (monthlyRate * rateFactor);
  return { maxLoan: Math.round(maxLoan), maxEmi: Math.round(availableEmi) };
}

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
    image: "/img/banks/icici.webp",
    hasActiveOffer: true,
  },
  {
    _id: "fb-4",
    name: "Bank of Baroda",
    rate: 7.20,
    loanType: "Home Loan",
    processingFee: "Nil",
    maxTenure: 30,
    image: "/img/banks/bob.jpg",
    hasActiveOffer: true,
  },
  {
    _id: "fb-5",
    name: "Axis Bank",
    rate: 7.35,
    loanType: "Home Loan",
    processingFee: "0.50%",
    maxTenure: 30,
    image: "/img/banks/axis.webp",
    hasActiveOffer: true,
  },
  {
    _id: "fb-6",
    name: "Kotak Mahindra Bank",
    rate: 7.80,
    loanType: "Home Loan",
    processingFee: "0.50%",
    maxTenure: 30,
    image: "",
    hasActiveOffer: true,
  },
  {
    _id: "fb-7",
    name: "L&T Financial Services",
    rate: 7.80,
    loanType: "Home Loan",
    processingFee: "Nil",
    maxTenure: 30,
    image: "",
    hasActiveOffer: true,
  },
  {
    _id: "fb-8",
    name: "PNB Housing",
    rate: 7.50,
    loanType: "Home Loan",
    processingFee: "Nil / Min",
    maxTenure: 30,
    image: "/img/banks/pnb.jpg",
    hasActiveOffer: true,
  },
];

const steps = [
  {
    number: "01",
    tag: "Step 01",
    title: "Check Eligibility",
    description:
      "Enter your income and existing EMIs to calculate your exact borrowing capacity instantly.",
    theme: "sky",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="18" />
        <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
      </svg>
    ),
  },
  {
    number: "02",
    tag: "Step 02",
    title: "Compare Offers",
    description:
      "Compare interest rates, tenure options, and lowest processing fees from top partner banks.",
    theme: "indigo",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    number: "03",
    tag: "Step 03",
    title: "Apply Online",
    description:
      "Submit your paperwork digitally with guided assistance from certified loan officers.",
    theme: "amber",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    number: "04",
    tag: "Step 04",
    title: "Get Disbursement",
    description:
      "Get final sanction letter and direct loan disbursement into your account in 3-5 days.",
    theme: "emerald",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

const faqs = [
  {
    q: "What is the minimum income required for a home loan?",
    a: "Most banks require a minimum monthly income of ₹25,000 for salaried individuals and ₹3 Lakh annual income for self-employed applicants.",
  },
  {
    q: "What documents are needed for home loan application?",
    a: "You'll need identity proof, address proof, income proof (salary slips/ITR), bank statements (6 months), property documents, and passport-size photographs.",
  },
  {
    q: "How long does the home loan approval take?",
    a: "Typically 7-15 working days from application submission, depending on document verification and property valuation.",
  },
  {
    q: "Can I prepay my home loan without penalty?",
    a: "Yes, as per RBI guidelines, banks cannot charge prepayment penalty on floating rate home loans for individual borrowers.",
  },
  {
    q: "What is the maximum tenure for a home loan?",
    a: "Most banks offer home loans for up to 30 years, subject to the borrower's age at loan maturity not exceeding 60-65 years.",
  },
];

import { API_BASE, getMediaUrl } from "../services/api";

function BankCard({ bank, onCheck, selected }) {
  const logoUrl = getMediaUrl(bank.image);
  
  // Custom brand styling for major Indian banks
  const bankStyles = {
    "sbi": { color: "#0083ca", name: "SBI" },
    "hdfc": { color: "#004c8f", name: "HDFC BANK" },
    "icici": { color: "#f37021", name: "ICICI Bank" },
    "kotak": { color: "#ed1c24", name: "kotak" },
    "axis": { color: "#97144d", name: "AXIS BANK" },
    "bob": { color: "#f26522", name: "Bank of Baroda" },
    "pnb": { color: "#a20a3a", name: "PNB Housing" },
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
      {/* Crisp Bank Logo / Header */}
      <div className={styles.bankLogoWrap}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={bank.name}
            className={styles.bankLogoImg}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget.parentElement.querySelector(`.${styles.bankBrandFallback}`);
              if (fb) fb.style.display = "flex";
            }}
          />
        ) : null}

        <div
          className={styles.bankBrandFallback}
          style={{ display: logoUrl ? "none" : "flex" }}
        >
          {brand ? (
            <div className={styles.brandFallbackInner}>
              <span className={styles.brandLogoDot} style={{ background: brand.color }} />
              <span className={styles.brandFallbackName} style={{ color: brand.color }}>
                {brand.name}
              </span>
            </div>
          ) : (
            <span className={styles.bankAvatarText}>
              {(bank.name || "BK").slice(0, 8)}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Area: Rate Badge & Apply Button on Hover */}
      <div className={styles.bankBottomArea}>
        <div className={styles.bankRatePillBadge}>
          Starts at {bank.rate ? `${bank.rate}%` : "7.2%"}
        </div>
        <div className={styles.bankApplyBtn}>
          <span>Apply Loan</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function HomeLoansPage() {
  const [calcTab, setCalcTab] = useState("emi"); // "emi" | "eligibility"
  const [loanTypeFilter, setLoanTypeFilter] = useState("All");

  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  // Eligibility Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState(75000);
  const [existingEmi, setExistingEmi] = useState(0);
  const [eligTenure, setEligTenure] = useState(20);
  const [eligInterestRate, setEligInterestRate] = useState(8.5);

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [enquiryBank, setEnquiryBank] = useState(null);
  const [dynamicBanks, setDynamicBanks] = useState([]);
  const [dynamicFaqs, setDynamicFaqs] = useState([]);
  const auth = useAuth() || {};
  const user = auth.user;
  const router = useRouter();

  const fetchBanks = () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${API_BASE}/bank-partners/public`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Not ok");
        return r.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          // Deduplicate by _id
          const unique = data.data.filter(
            (bank, index, self) =>
              index === self.findIndex((b) => b._id === bank._id),
          );
          setDynamicBanks(unique);
        }
      })
      .catch(() => {});
  };

  const fetchFaqs = () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${API_BASE}/faqs/public`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Not ok");
        return r.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDynamicFaqs(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBanks();
    fetchFaqs();
    // Automatically re-fetch whenever the user refocuses the tab / window
    const handleFocus = () => {
      fetchBanks();
      fetchFaqs();
    };
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
          name: b.bankName,
          rate: rate,
          tagline: b.tagline || "",
          loanType: loanType,
          processingFee: latestOffer?.processingFee || b.processingFee || "",
          maxTenure: latestOffer?.maxTenure || b.maxTenure || "",
          image: getMediaUrl(b.logo, ""),
          hasActiveOffer: activeOffers.length > 0 || Boolean(rate),
        };
      })
      .filter((b) => b.hasActiveOffer);

    if (loanTypeFilter === "All") return all;
    return all.filter((b) =>
      b.loanType?.toLowerCase().includes(loanTypeFilter.toLowerCase())
    );
  }, [dynamicBanks, loanTypeFilter]);

  // Unique available loan types for filter buttons
  const availableLoanTypes = useMemo(() => {
    const types = new Set(["All"]);
    dynamicBanks.forEach((b) => {
      if (b.loanType) types.add(b.loanType);
      (b.offers || []).forEach((o) => {
        if (o.loanType) types.add(o.loanType);
      });
    });
    return Array.from(types);
  }, [dynamicBanks]);

  const dynamicBankCount = useMemo(() => {
    const count = dynamicBanks.length > 0 
      ? dynamicBanks.filter((b) => b.isActive !== false).length 
      : displayBanks.length;
    if (count === 0) return "Top Banks";
    return `${count}+ Banks`;
  }, [dynamicBanks, displayBanks]);

  const displayFaqs = useMemo(() => {
    if (dynamicFaqs.length > 0) {
      return dynamicFaqs.map((f) => ({
        _id: f._id,
        q: f.question,
        a: f.answer,
      }));
    }
    return faqs;
  }, [dynamicFaqs]);

  const lowestRate = useMemo(() => {
    const list = displayBanks.length > 0 ? displayBanks : fallbackBanks;
    const rates = list.map((b) => parseFloat(b.rate)).filter((r) => !isNaN(r) && r > 0);
    return rates.length > 0 ? `${Math.min(...rates).toFixed(2)}%` : "7.20%";
  }, [displayBanks]);

  const emi = useMemo(
    () => calculateEMI(loanAmount, interestRate, tenure),
    [loanAmount, interestRate, tenure],
  );
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;

  // Eligibility results
  const eligibility = useMemo(
    () => calculateEligibility(monthlyIncome, existingEmi, eligInterestRate, eligTenure),
    [monthlyIncome, existingEmi, eligInterestRate, eligTenure]
  );

  const handleCheckOffer = (bank) => {
    if (!user) {
      router.push("/login?redirect=/home-loans");
      return;
    }
    setEnquiryBank(bank);
  };

  const handleEnquirySuccess = (bank) => {
    if (bank?.rate) {
      setInterestRate(parseFloat(bank.rate));
      setSelectedBank(bank);
    }
    setEnquiryBank(null);
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Standard Minimal Breadcrumb */}
      <div className={styles.breadcrumbBar}>
        <a href="/" className={styles.breadcrumbLink}>Home</a>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Home Loans</span>
      </div>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.heroBadge}>Home Financing</span>
          <h1 className={styles.heroTitle}>
            Get Your Dream Home <span className={styles.highlight}>Funded</span>
          </h1>
          <p className={styles.heroText}>
            Compare rates from top banks, calculate EMI, and apply online.
            Lowest interest rates starting at {lowestRate} p.a.
          </p>
        </section>

        <section className={styles.calcSection} id="loan-calculator">
          <div className={styles.calcTabHeader}>
            <button
              type="button"
              className={`${styles.calcTabBtn} ${calcTab === "emi" ? styles.calcTabBtnActive : ""}`}
              onClick={() => setCalcTab("emi")}
            >
              <HiOutlineCalculator style={{ fontSize: "1.15rem" }} />
              <span>EMI Calculator</span>
            </button>
            <button
              type="button"
              className={`${styles.calcTabBtn} ${calcTab === "eligibility" ? styles.calcTabBtnActive : ""}`}
              onClick={() => setCalcTab("eligibility")}
            >
              <HiOutlineBadgeCheck style={{ fontSize: "1.15rem" }} />
              <span>Loan Eligibility Checker</span>
            </button>
          </div>

          {calcTab === "emi" ? (
            <>
              <div className={styles.calcHeader}>
                <h2>EMI Calculator</h2>
                <p className={styles.calcSubtitle}>
                  Plan your home loan with accurate monthly payment estimates
                </p>
              </div>

              <div className={styles.calcGrid}>
                <div className={styles.calcInputs}>
                  <div className={styles.inputGroup}>
                    <div className={styles.inputHeader}>
                      <label className={styles.inputLabel}>Loan Amount</label>
                      <span className={styles.inputValueBadge}>
                        ₹ {loanAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className={styles.sliderWrap}>
                      <input
                        type="range"
                        min="100000"
                        max="50000000"
                        step="100000"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className={styles.rangeSlider}
                      />
                      <div className={styles.rangeLabels}>
                        <span>₹ 1 Lakh</span>
                        <span>₹ 5 Cr</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputHeader}>
                      <label className={styles.inputLabel}>Interest Rate (% p.a.)</label>
                      <span className={styles.inputValueBadge}>{interestRate}%</span>
                    </div>
                    <div className={styles.sliderWrap}>
                      <input
                        type="range"
                        min="5"
                        max="15"
                        step="0.05"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className={styles.rangeSlider}
                      />
                      <div className={styles.rangeLabels}>
                        <span>5%</span>
                        <span>15%</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputHeader}>
                      <label className={styles.inputLabel}>Loan Tenure</label>
                      <span className={styles.inputValueBadge}>{tenure} Years</span>
                    </div>
                    <div className={styles.sliderWrap}>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className={styles.rangeSlider}
                      />
                      <div className={styles.rangeLabels}>
                        <span>1 Year</span>
                        <span>30 Years</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.calcResult}>
                  <div className={styles.emiCard}>
                    <span className={styles.emiLabel}>Monthly EMI</span>
                    <p className={styles.emiValue}>
                      ₹ {Math.round(emi).toLocaleString("en-IN")}
                    </p>
                    {selectedBank && (
                      <span className={styles.bankTag}>
                        Selected: {selectedBank.name} ({interestRate}%)
                      </span>
                    )}
                  </div>
                  <div className={styles.breakdownGrid}>
                    <div className={styles.breakdownItem}>
                      <span className={styles.breakdownLabel}>Principal Amount</span>
                      <span className={styles.breakdownValue}>
                        ₹ {loanAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className={styles.breakdownItem}>
                      <span className={styles.breakdownLabel}>Total Interest</span>
                      <span className={styles.breakdownValue}>
                        ₹ {Math.round(totalInterest).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className={styles.breakdownItem}>
                      <span className={styles.breakdownLabel}>Total Amount Payable</span>
                      <span className={styles.breakdownValue}>
                        ₹ {Math.round(totalPayment).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.calcHeader}>
                <h2>Loan Eligibility Checker</h2>
                <p className={styles.calcSubtitle}>
                  Find out the maximum loan amount you can qualify for based on your net income & existing EMIs
                </p>
              </div>

              <div className={styles.calcGrid}>
                <div className={styles.calcInputs}>
                  <div className={styles.inputGroup}>
                    <div className={styles.inputHeader}>
                      <label className={styles.inputLabel}>Monthly Net Income</label>
                      <span className={styles.inputValueBadge}>
                        ₹ {monthlyIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className={styles.sliderWrap}>
                      <input
                        type="range"
                        min="15000"
                        max="1000000"
                        step="5000"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        className={styles.rangeSlider}
                      />
                      <div className={styles.rangeLabels}>
                        <span>₹ 15,000</span>
                        <span>₹ 10 Lakh</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputHeader}>
                      <label className={styles.inputLabel}>Existing Monthly EMIs (if any)</label>
                      <span className={styles.inputValueBadge}>
                        ₹ {existingEmi.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className={styles.sliderWrap}>
                      <input
                        type="range"
                        min="0"
                        max="500000"
                        step="2500"
                        value={existingEmi}
                        onChange={(e) => setExistingEmi(Number(e.target.value))}
                        className={styles.rangeSlider}
                      />
                      <div className={styles.rangeLabels}>
                        <span>₹ 0</span>
                        <span>₹ 5 Lakh</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputHeader}>
                      <label className={styles.inputLabel}>Expected Interest Rate (% p.a.)</label>
                      <span className={styles.inputValueBadge}>{eligInterestRate}%</span>
                    </div>
                    <div className={styles.sliderWrap}>
                      <input
                        type="range"
                        min="5"
                        max="15"
                        step="0.05"
                        value={eligInterestRate}
                        onChange={(e) => setEligInterestRate(Number(e.target.value))}
                        className={styles.rangeSlider}
                      />
                      <div className={styles.rangeLabels}>
                        <span>5%</span>
                        <span>15%</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputHeader}>
                      <label className={styles.inputLabel}>Desired Tenure</label>
                      <span className={styles.inputValueBadge}>{eligTenure} Years</span>
                    </div>
                    <div className={styles.sliderWrap}>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={eligTenure}
                        onChange={(e) => setEligTenure(Number(e.target.value))}
                        className={styles.rangeSlider}
                      />
                      <div className={styles.rangeLabels}>
                        <span>1 Year</span>
                        <span>30 Years</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.calcResult}>
                  <div className={styles.emiCard}>
                    <span className={styles.emiLabel}>Maximum Loan Eligibility</span>
                    <p className={styles.emiValue} style={{ color: "#059669" }}>
                      ₹ {eligibility.maxLoan.toLocaleString("en-IN")}
                    </p>
                    <span className={styles.bankTag} style={{ background: "#d1fae5", color: "#065f46" }}>
                      Max Allowed EMI: ₹ {eligibility.maxEmi.toLocaleString("en-IN")}/mo
                    </span>
                  </div>
                  <div className={styles.breakdownGrid}>
                    <div className={styles.breakdownItem}>
                      <span className={styles.breakdownLabel}>Net Monthly Income</span>
                      <span className={styles.breakdownValue}>
                        ₹ {monthlyIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className={styles.breakdownItem}>
                      <span className={styles.breakdownLabel}>Existing Obligation</span>
                      <span className={styles.breakdownValue}>
                        ₹ {existingEmi.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className={styles.breakdownItem}>
                      <span className={styles.breakdownLabel}>Max FOIR (50% rule)</span>
                      <span className={styles.breakdownValue}>
                        ₹ {Math.round(monthlyIncome * 0.5).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* MagicLoans Style Unified Showcase Section with Cards Marquee */}
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
              Compare Home Loan Offers from <span className={styles.showcaseTitleHighlight}>{dynamicBankCount}</span>
            </h2>

            {/* Bullet Points / Value Props */}
            <div className={styles.showcaseBadges}>
              <div className={styles.showcaseCheckItem}>
                <svg className={styles.checkIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 9 10 15 7 12" />
                </svg>
                <span>Rates starting from <strong className={styles.highlightGreen}>{lowestRate}*</strong></span>
              </div>
              <div className={styles.showcaseCheckItem}>
                <svg className={styles.checkIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 9 10 15 7 12" />
                </svg>
                <span><strong className={styles.highlightTheme}>0%*</strong> Processing Fee</span>
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
              <button
                type="button"
                onClick={() => {
                  setCalcTab("emi");
                  const elem = document.getElementById("loan-calculator");
                  if (elem) elem.scrollIntoView({ behavior: "smooth" });
                }}
                className={styles.exploreOffersLink}
              >
                <span>Explore Bank Offers</span>
                <span className={styles.exploreArrow}>→</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalcTab("eligibility");
                  const elem = document.getElementById("loan-calculator");
                  if (elem) elem.scrollIntoView({ behavior: "smooth" });
                }}
                className={styles.checkEligibilityBtn}
              >
                <span>Check Your Eligibility</span>
              </button>
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
        </section>

        <section className={styles.stepsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>FAST & EASY PROCESS</span>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              Four simple steps to secure your dream home loan with zero hassle
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((step, index) => (
              <div key={step.number} className={`${styles.stepCard} ${styles[`stepTheme_${step.theme}`]}`}>
                <div className={styles.stepTopRow}>
                  <span className={styles.stepBadge}>{step.tag}</span>
                  <span className={styles.stepIndexNum}>0{index + 1}</span>
                </div>
                <div className={styles.stepIconWrap}>
                  {step.icon}
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>FREQUENTLY ASKED QUESTIONS</span>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Got questions about home loans? We have answers to help you make informed decisions
            </p>
          </div>
          <div className={styles.faqList}>
            {displayFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq._id || `faq-${i}`}
                  className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ""}`}
                  onMouseEnter={() => setOpenFaq(i)}
                  onMouseLeave={() => setOpenFaq(null)}
                >
                  <button
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <svg
                      className={styles.faqIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {isOpen && <p className={styles.faqAnswer}>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      {enquiryBank && (
        <BankEnquiryModal
          bank={enquiryBank}
          onClose={() => setEnquiryBank(null)}
          onSuccess={handleEnquirySuccess}
        />
      )}
    </div>
  );
}
