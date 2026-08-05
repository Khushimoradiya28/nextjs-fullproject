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

function BankCard({ bank, onCheck, selected }) {
  return (
    <div style={{background:"#ffffff",border:"1px solid #e8e8e3",borderRadius:"16px",padding:"20px",width:"220px",minWidth:"220px",display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
      <div style={{width:"100%",height:"90px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {bank.image
          ? <img src={bank.image} alt={bank.name} style={{maxWidth:"160px",maxHeight:"80px",width:"auto",height:"auto",objectFit:"contain"}} />
          : <div style={{width:"64px",height:"64px",background:"#eff6ff",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",color:"#1a6fd4",fontWeight:"700",fontSize:"20px"}}>{(bank.name || bank.tagline || "").slice(0,2).toUpperCase()}</div>
        }
      </div>
      <div style={{width:"100%",height:"1px",background:"#f0f0ea",margin:"0"}} />
      <div style={{height:"44px",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 12px"}}>
        <span style={{fontSize:"13px",fontWeight:"500",color:"#333",textAlign:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:"100%"}}>{bank.tagline || bank.name}</span>
      </div>
      <div style={{height:"28px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:"14px",color:"#1a6fd4",fontWeight:"500"}}>{selected && bank.rate ? `From ${bank.rate}% p.a.` : "Rate on request"}</span>
      </div>
      <div style={{marginTop:"16px",width:"100%"}}>
        <button onClick={() => onCheck(bank)} style={{border:"1.5px solid #1a6fd4",borderRadius:"8px",padding:"9px 0",fontSize:"13px",color: selected ? "#fff" : "#1a6fd4",background: selected ? "#1a6fd4" : "#fff",cursor:"pointer",fontWeight:"500",width:"100%"}}>
          {selected ? "✓ Applied" : "Check Offer"}
        </button>
      </div>
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
          // Get rate from offers array (latest offer) or fall back to profile-level field
          const latestOffer = b.offers && b.offers.length > 0 ? b.offers[b.offers.length - 1] : null;
          const rate = latestOffer?.interestRate || b.interestRate;
          return {
            _id: b._id,
            name: b.bankName,
            rate: rate,
            tagline: b.tagline || b.bankName,
            image: b.logo || "/img/banks/sbi.jpg",
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

  const marqueeRow1 = [
    ...displayBanks,
    ...displayBanks,
    ...displayBanks,
    ...displayBanks,
    ...displayBanks,
    ...displayBanks,
  ];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.heroLabel}>Home Loans</span>
          <h1 className={styles.heroTitle}>
            Get Your Dream Home <span className={styles.highlight}>Funded</span>
          </h1>
          <p className={styles.heroText}>
            Compare rates from top banks, calculate EMI, and apply online.
            Lowest interest rates starting at 8.40% p.a.
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
                <label className={styles.inputLabel}>Loan Amount</label>
                <div className={styles.sliderWrap}>
                  <span className={styles.inputValue}>
                    ₹ {loanAmount.toLocaleString("en-IN")}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="50000000"
                    step="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className={styles.rangeSlider}
                  />
                  <div className={styles.rangeLabels}>
                    <span>₹ 0</span>
                    <span>₹ 5 Cr</span>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Interest Rate (% p.a.)
                </label>
                <div className={styles.sliderWrap}>
                  <span className={styles.inputValue}>{interestRate}%</span>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className={styles.rangeSlider}
                  />
                  <div className={styles.rangeLabels}>
                    <span>1%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Loan Tenure (Years)</label>
                <div className={styles.sliderWrap}>
                  <span className={styles.inputValue}>{tenure} Years</span>
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
                    <span>1 Yr</span>
                    <span>30 Yrs</span>
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
                    via {selectedBank.name}
                  </span>
                )}
              </div>
              <div className={styles.breakdownGrid}>
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>Principal</span>
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
                  <span className={styles.breakdownLabel}>Total Payment</span>
                  <span className={styles.breakdownValue}>
                    ₹ {Math.round(totalPayment).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.stepsSection}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
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

        <section className={styles.banksSection}>
          <h2 className={styles.banksSectionTitle}>Our Banking Partners</h2>
          <p className={styles.banksSectionSubtitle}>
            Compare rates and choose the best offer for you
          </p>

          <div className={styles.banksCarouselWrap}>
            <div className={styles.marqueeWrap}>
              <div className={styles.marqueeTrack}>
                {marqueeRow1.map((bank, i) => (
                  <BankCard
                    key={`r1-${i}`}
                    bank={bank}
                    onCheck={handleCheckOffer}
                    selected={selectedBank?.name === bank.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.banksDots}>
            {displayBanks.slice(0, 5).map((_, i) => (
              <span key={i} className={`${styles.banksDot} ${i === 0 ? styles.banksDotActive : ""}`} />
            ))}
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
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
