"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import styles from "./BenefitsCalculatorSection.module.css";

const benefits = [
  {
    title: "Verified Listings",
    description: "100% verified properties",
    image: "/img/why-chooes/verified.png",
  },
  {
    title: "Trusted by Thousands",
    description: "Loved by buyers and owners",
    image: "/img/why-chooes/trust.png",
  },
  {
    title: "Expert Support",
    description: "We are here to help you",
    image: "/img/why-chooes/expert.png",
  },
  {
    title: "Best Deals",
    description: "Compare & find the best",
    image: "/img/why-chooes/best-deals.png",
  },
];

function calculateEMI(principal, annualRate, years) {
  const months = years * 12;
  const monthlyRate = annualRate / 1200;
  if (months <= 0 || principal <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const rateFactor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * rateFactor) / (rateFactor - 1);
}

function parseNumber(value) {
  if (typeof value !== "string") return Number(value) || 0;
  const cleaned = value.replace(/[^0-9.]/g, "");
  return Number(cleaned) || 0;
}

export default function BenefitsCalculatorSection() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const calculatedEMI = useMemo(
    () => calculateEMI(loanAmount, interestRate, tenureYears),
    [loanAmount, interestRate, tenureYears]
  );

  const formattedEMI = useMemo(() => {
    return calculatedEMI > 0
      ? `₹ ${calculatedEMI.toLocaleString("en-IN", { maximumFractionDigits: 0 })} / month`
      : "₹ 0 / month";
  }, [calculatedEMI]);

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.innerGrid}>
        <div className={styles.benefitsPanel}>
          <div className={styles.sectionTitleBox}>
            <h2>Why Choose Runr Properties?</h2>
            <span className={styles.titleUnderline} aria-hidden="true" />
          </div>

          <div className={styles.benefitGrid}>
            {benefits.map((item) => (
              <article key={item.title} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <Image src={item.image} alt="" aria-hidden="true" width={64} height={64} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.calculatorPanel}>
          <div className={styles.calcHeader}>
            <h3>Home Loan – EMI Calculator</h3>
            <span className={styles.titleUnderline} aria-hidden="true" />
          </div>

          <div className={styles.calcBody}>
            <form className={styles.calcForm} onSubmit={(event) => event.preventDefault()}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="loan-amount">
                  Loan Amount
                </label>
                <input
                  id="loan-amount"
                  className={styles.fieldInput}
                  type="text"
                  value={`₹ ${loanAmount.toLocaleString("en-IN")}`}
                  onChange={(event) => setLoanAmount(parseNumber(event.target.value))}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="interest-rate">
                  Interest Rate (%)
                </label>
                <input
                  id="interest-rate"
                  className={styles.fieldInput}
                  type="number"
                  min="0"
                  step="0.01"
                  value={interestRate}
                  onChange={(event) => setInterestRate(Number(event.target.value))}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="tenure-years">
                  Tenure (Years)
                </label>
                <input
                  id="tenure-years"
                  className={styles.fieldInput}
                  type="number"
                  min="1"
                  step="1"
                  value={tenureYears}
                  onChange={(event) => setTenureYears(Number(event.target.value))}
                />
              </div>

              <div className={styles.estimateCard}>
                <span className={styles.estimateLabel}>Estimated EMI</span>
                <p className={styles.estimateValue}>{formattedEMI}</p>
              </div>
            </form>

            <div className={styles.calcDecorIcon} aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="4" width="36" height="40" rx="4" fill="#E8EDF5" stroke="#94A3B8" strokeWidth="1.5" />
                <rect x="10" y="8" width="28" height="10" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                <rect x="10" y="22" width="7" height="6" rx="1.5" fill="#D1D9E6" />
                <rect x="20" y="22" width="7" height="6" rx="1.5" fill="#D1D9E6" />
                <rect x="30" y="22" width="7" height="6" rx="1.5" fill="#D1D9E6" />
                <rect x="10" y="31" width="7" height="6" rx="1.5" fill="#D1D9E6" />
                <rect x="20" y="31" width="7" height="6" rx="1.5" fill="#D1D9E6" />
                <rect x="30" y="31" width="7" height="6" rx="1.5" fill="#3FA66B" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
