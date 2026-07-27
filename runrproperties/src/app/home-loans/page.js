"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./homeloans.module.css";

function calculateEMI(principal, annualRate, years) {
  const months = years * 12;
  const monthlyRate = annualRate / 1200;
  if (months <= 0 || principal <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const rateFactor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * rateFactor) / (rateFactor - 1);
}

const partnerBanks = [
  { name: "SBI", rate: "8.40%", tagline: "State Bank of India", image: "/img/banks/sbi.jpg" },
  { name: "HDFC", rate: "8.50%", tagline: "HDFC Bank Ltd", image: "/img/banks/hdfc.jpg" },
  { name: "ICICI", rate: "8.60%", tagline: "ICICI Bank", image: "/img/banks/icici.webp" },
  { name: "Axis Bank", rate: "8.55%", tagline: "Axis Bank Ltd", image: "/img/banks/axis.webp" },
  { name: "Bank of Baroda", rate: "8.45%", tagline: "BOB", image: "/img/banks/bob.jpg" },
  { name: "PNB", rate: "8.50%", tagline: "Punjab National Bank", image: "/img/banks/pnb.jpg" },
];

const row1Banks = partnerBanks.slice(0, 3);
const row2Banks = partnerBanks.slice(3, 6);

const steps = [
  { number: "01", title: "Check Eligibility", description: "Enter your income and existing EMIs to check your loan eligibility instantly." },
  { number: "02", title: "Compare Offers", description: "Compare interest rates and terms from multiple partner banks at once." },
  { number: "03", title: "Apply Online", description: "Submit your application digitally with minimal documentation required." },
  { number: "04", title: "Get Disbursement", description: "Receive loan amount directly in your account within 3-5 working days." },
];

const faqs = [
  { q: "What is the minimum income required for a home loan?", a: "Most banks require a minimum monthly income of ₹25,000 for salaried individuals and ₹3 Lakh annual income for self-employed applicants." },
  { q: "What documents are needed for home loan application?", a: "You'll need identity proof, address proof, income proof (salary slips/ITR), bank statements (6 months), property documents, and passport-size photographs." },
  { q: "How long does the home loan approval take?", a: "Typically 7-15 working days from application submission, depending on document verification and property valuation." },
  { q: "Can I prepay my home loan without penalty?", a: "Yes, as per RBI guidelines, banks cannot charge prepayment penalty on floating rate home loans for individual borrowers." },
  { q: "What is the maximum tenure for a home loan?", a: "Most banks offer home loans for up to 30 years, subject to the borrower's age at loan maturity not exceeding 60-65 years." },
];

function BankCard({ bank, onCheck, selected }) {
  return (
    <div className={styles.bankCard}>
      <div className={styles.bankBanner}>
        <img src={bank.image} alt={bank.name} className={styles.bankBannerImg} />
      </div>
      <div className={styles.bankBody}>
        <h3 className={styles.bankName}>{bank.tagline}</h3>
        <p className={styles.bankRate}>From {bank.rate} p.a.</p>
        <button className={styles.bankCta} onClick={() => onCheck(bank)}>
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

  const emi = useMemo(() => calculateEMI(loanAmount, interestRate, tenure), [loanAmount, interestRate, tenure]);
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;

  const handleCheckOffer = (bank) => {
    setSelectedBank(bank);
    setInterestRate(parseFloat(bank.rate));
  };

  const marqueeRow1 = [...row1Banks, ...row1Banks, ...row1Banks, ...row1Banks];
  const marqueeRow2 = [...row2Banks, ...row2Banks, ...row2Banks, ...row2Banks];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.heroLabel}>Home Loans</span>
          <h1 className={styles.heroTitle}>Get Your Dream Home <span className={styles.highlight}>Funded</span></h1>
          <p className={styles.heroText}>Compare rates from top banks, calculate EMI, and apply online. Lowest interest rates starting at 8.40% p.a.</p>
        </section>

        <section className={styles.calcSection}>
          <div className={styles.calcHeader}>
            <h2>EMI Calculator</h2>
            <p className={styles.calcSubtitle}>Plan your home loan with accurate monthly payment estimates</p>
          </div>

          <div className={styles.calcGrid}>
            <div className={styles.calcInputs}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Loan Amount</label>
                <div className={styles.sliderWrap}>
                  <span className={styles.inputValue}>₹ {loanAmount.toLocaleString("en-IN")}</span>
                  <input type="range" min="0" max="50000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className={styles.rangeSlider} />
                  <div className={styles.rangeLabels}><span>₹ 0</span><span>₹ 5 Cr</span></div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Interest Rate (% p.a.)</label>
                <div className={styles.sliderWrap}>
                  <span className={styles.inputValue}>{interestRate}%</span>
                  <input type="range" min="1" max="15" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className={styles.rangeSlider} />
                  <div className={styles.rangeLabels}><span>1%</span><span>15%</span></div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Loan Tenure (Years)</label>
                <div className={styles.sliderWrap}>
                  <span className={styles.inputValue}>{tenure} Years</span>
                  <input type="range" min="1" max="30" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className={styles.rangeSlider} />
                  <div className={styles.rangeLabels}><span>1 Yr</span><span>30 Yrs</span></div>
                </div>
              </div>
            </div>

            <div className={styles.calcResult}>
              <div className={styles.emiCard}>
                <span className={styles.emiLabel}>Monthly EMI</span>
                <p className={styles.emiValue}>₹ {Math.round(emi).toLocaleString("en-IN")}</p>
                {selectedBank && <span className={styles.bankTag}>via {selectedBank.name}</span>}
              </div>
              <div className={styles.breakdownGrid}>
                <div className={styles.breakdownItem}><span className={styles.breakdownLabel}>Principal</span><span className={styles.breakdownValue}>₹ {loanAmount.toLocaleString("en-IN")}</span></div>
                <div className={styles.breakdownItem}><span className={styles.breakdownLabel}>Total Interest</span><span className={styles.breakdownValue}>₹ {Math.round(totalInterest).toLocaleString("en-IN")}</span></div>
                <div className={styles.breakdownItem}><span className={styles.breakdownLabel}>Total Payment</span><span className={styles.breakdownValue}>₹ {Math.round(totalPayment).toLocaleString("en-IN")}</span></div>
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

        {/* Banks with marquee */}
        <section className={styles.banksSection}>
          <h2 className={styles.sectionTitle}>Our Banking Partners</h2>
          <p className={styles.sectionSubtitle}>Compare rates and choose the best offer for you</p>

          <div className={styles.marqueeWrap}>
            <div className={styles.marqueeTrack}>
              {marqueeRow1.map((bank, i) => (
                <BankCard key={`r1-${i}`} bank={bank} onCheck={handleCheckOffer} selected={selectedBank?.name === bank.name} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ""}`}>
                <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  <span>{faq.q}</span>
                  <svg className={styles.faqIcon} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {openFaq === i && <p className={styles.faqAnswer}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
