"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./homeloans.module.css";

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

const fallbackBanks = [];

const steps = [
  {
    number: "01",
    title: "Check Eligibility",
    description:
      "Enter your income and existing EMIs to check your loan eligibility instantly.",
  },
  {
    number: "02",
    title: "Compare Offers",
    description:
      "Compare interest rates and terms from multiple partner banks at once.",
  },
  {
    number: "03",
    title: "Apply Online",
    description:
      "Submit your application digitally with minimal documentation required.",
  },
  {
    number: "04",
    title: "Get Disbursement",
    description:
      "Receive loan amount directly in your account within 3-5 working days.",
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

  return (
    <div className={`${styles.bankCardItem} ${selected ? styles.bankCardItemSelected : ""}`}>
      {/* Big Logo on Top */}
      <div className={styles.bankLogoWrap}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={bank.name}
            className={styles.bankLogoImg}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget.parentElement.querySelector(`.${styles.bankAvatarText}`);
              if (fb) fb.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={styles.bankAvatarText}
          style={{ display: logoUrl ? "none" : "flex" }}
        >
          {(bank.name || "BK").slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Name below Logo */}
      <div className={styles.bankInfoBlock}>
        <h3 className={styles.bankCardTitle}>{bank.name}</h3>
        <span className={styles.bankRatePill}>
          {bank.rate ? `${bank.rate}% p.a.` : "Rate on request"}
        </span>
      </div>

      {/* Details List */}
      <div className={styles.bankCompactList}>
        <div className={styles.compactRow}>
          <span>Loan Type</span>
          <strong>{bank.loanType || "Home Loan"}</strong>
        </div>
        <div className={styles.compactRow}>
          <span>Fee</span>
          <strong>
            {bank.processingFee
              ? (bank.processingFee.startsWith("₹") || bank.processingFee.endsWith("%")
                  ? bank.processingFee
                  : `₹ ${bank.processingFee}`)
              : "Nil / Min"}
          </strong>
        </div>
        <div className={styles.compactRow}>
          <span>Tenure</span>
          <strong>{bank.maxTenure ? `${bank.maxTenure} Yrs` : "30 Yrs"}</strong>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onCheck(bank)}
        className={`${styles.bankCardBtn} ${selected ? styles.bankCardBtnSelected : ""}`}
      >
        {selected ? "✓ Applied" : "Apply Online"}
      </button>
    </div>
  );
}

export default function HomeLoansPage() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [enquiryBank, setEnquiryBank] = useState(null);
  const [dynamicBanks, setDynamicBanks] = useState([]);
  const auth = useAuth() || {};
  const user = auth.user;
  const router = useRouter();

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${API_BASE}/bank-partners/public`)
      .then((r) => {
        if (!r.ok) throw new Error("Not ok");
        return r.json();
      })
      .then((data) => {
        if (data.success && data.data?.length > 0) {
          // Deduplicate by _id
          const unique = data.data.filter(
            (bank, index, self) =>
              index === self.findIndex((b) => b._id === bank._id),
          );
          setDynamicBanks(unique);
        }
      })
      .catch(() => {});
  }, []);

  const displayBanks =
    dynamicBanks.length > 0
      ? dynamicBanks.map((b) => {
          const latestOffer = b.offers && b.offers.length > 0 ? b.offers[b.offers.length - 1] : null;
          const rate = latestOffer?.interestRate || b.interestRate;
          return {
            _id: b._id,
            name: b.bankName,
            rate: rate,
            tagline: b.tagline || "",
            loanType: latestOffer?.loanType || b.loanType || "Home Loan",
            processingFee: latestOffer?.processingFee || b.processingFee || "",
            maxTenure: latestOffer?.maxTenure || b.maxTenure || "",
            image: getMediaUrl(b.logo, ""),
          };
        })
      : fallbackBanks;

  const emi = useMemo(
    () => calculateEMI(loanAmount, interestRate, tenure),
    [loanAmount, interestRate, tenure],
  );
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;

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
            Lowest interest rates starting at 7.80% p.a.
          </p>
        </section>

        <section className={styles.calcSection}>
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
        </section>

        {/* Banking Partners Section (Marquee Slider) */}
        {displayBanks.length > 0 && (
          <section className={styles.banksSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Our Banking Partners</h2>
              <p className={styles.sectionSubtitle}>
                Compare pre-approved offers, interest rates, and apply directly
              </p>
            </div>

            <div className={styles.marqueeWrap}>
              <div className={styles.marqueeTrack}>
                {/* Quadruple repeat to ensure seamless infinite looping on any screen width */}
                {[...displayBanks, ...displayBanks, ...displayBanks, ...displayBanks].map((bank, idx) => (
                  <BankCard
                    key={`${bank._id || bank.name}-${idx}`}
                    bank={bank}
                    onCheck={handleCheckOffer}
                    selected={selectedBank?.name === bank.name}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className={styles.stepsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              Four simple steps to secure your dream home loan
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <div key={step.number} className={styles.stepCard}>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Got questions about home loans? We have answers to help you make informed decisions
            </p>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ""}`}
              >
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
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
                {openFaq === i && <p className={styles.faqAnswer}>{faq.a}</p>}
              </div>
            ))}
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
