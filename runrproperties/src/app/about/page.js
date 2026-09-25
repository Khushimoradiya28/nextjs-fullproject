"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./about.module.css";
import {
  HiOutlineShieldCheck,
  HiOutlineCheckBadge,
  HiOutlineBuildingOffice2,
  HiOutlineBanknotes,
  HiOutlineUserGroup,
  HiOutlineDocumentCheck,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineEye,
  HiOutlineHandThumbUp,
} from "react-icons/hi2";

import { getPropertyStats } from "../services/api";

function AnimatedCounter({ end, duration = 1600, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const numericEnd =
      typeof end === "number"
        ? end
        : parseInt(String(end).replace(/[^0-9]/g, ""), 10) || 0;

    if (numericEnd === 0) {
      setCount(0);
      return;
    }

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * numericEnd));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(numericEnd);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const defaultCities = [
  {
    key: "ahmedabad",
    name: "Ahmedabad",
    tagline: "Mega City & Real Estate Hub",
    image: "/img/cities-icon/1.png",
    areas: "SG Highway, Bopal, Science City, Prahlad Nagar, Shela",
  },
  {
    key: "surat",
    name: "Surat",
    tagline: "Diamond City & Coastal Corridors",
    image: "/img/cities-icon/2.png",
    areas: "Vesu, Adajan, Pal, Piplod, VIP Road",
  },
  {
    key: "vadodara",
    name: "Vadodara",
    tagline: "Cultural Capital & Smart Living",
    image: "/img/cities-icon/3.png",
    areas: "Vasna, Alkapuri, Gotri, Sevasi, Bhayli",
  },
  {
    key: "rajkot",
    name: "Rajkot",
    tagline: "Saurashtra's Rapid Growth Hub",
    image: "/img/cities-icon/4.png",
    areas: "Kalawad Road, University Road, 150ft Ring Road, Nana Mava",
  },
  {
    key: "gandhinagar",
    name: "Gandhinagar",
    tagline: "Green Capital & GIFT City Corridor",
    image: "/img/cities-icon/5.png",
    areas: "GIFT City, Raysan, Kudasan, Randesan, Sargasan",
  },
  {
    key: "bhavnagar",
    name: "Bhavnagar",
    tagline: "Coastal City & Heritage Living",
    image: "/img/cities-icon/6.png",
    areas: "Kaliavid, Hill Drive, Victoria Park Road, Sardarnagar",
  },
];

const pillars = [
  {
    icon: <HiOutlineShieldCheck className={styles.pillarIconSvg} />,
    title: "100% Verified Inventory",
    desc: "Every single property undergoes strict physical inspection and ownership documentation checks before listing.",
  },
  {
    icon: <HiOutlineBanknotes className={styles.pillarIconSvg} />,
    title: "Direct & Transparent Pricing",
    desc: "Clear market valuations with zero hidden charges, inflated brokerages, or unexpected surprises.",
  },
  {
    icon: <HiOutlineDocumentCheck className={styles.pillarIconSvg} />,
    title: "Legal & Title Verification",
    desc: "In-house legal checks for title deed accuracy, RERA compliance, and dispute-free property transfers.",
  },
  {
    icon: <HiOutlineBuildingOffice2 className={styles.pillarIconSvg} />,
    title: "Seamless Bank Financing",
    desc: "Partnered with top banks (HDFC, SBI, ICICI, Axis) to offer swift approvals and lowest interest rates starting 7.80% p.a.",
  },
];

const steps = [
  {
    step: "01",
    title: "Discover Verified Properties",
    desc: "Filter by city, budget, and configuration with real photographs, verified floorplans, and clear pricing.",
  },
  {
    step: "02",
    title: "Guided On-Site & Virtual Tours",
    desc: "Connect with our dedicated area specialists for convenient site visits, neighborhood insights, and property tours.",
  },
  {
    step: "03",
    title: "Hassle-Free Legal & Handover",
    desc: "We assist with loan sanctions, registry documentation, and secure deal closure right up to the final key handover.",
  },
];

export default function AboutPage() {
  const [realStats, setRealStats] = useState({
    totalProperties: 0,
    cityMap: {},
    totalValue: 0,
    citiesCount: 4,
    loaded: false,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const json = await getPropertyStats();
        if (isMounted && json.success && json.data) {
          const { totalProperties, cityMap, totalValue, cities } = json.data;
          setRealStats({
            totalProperties: totalProperties || 0,
            cityMap: cityMap || {},
            totalValue: totalValue || 0,
            citiesCount: cities?.length || 4,
            loaded: true,
          });
        }
      } catch (err) {
        console.error("Failed to load live property stats:", err);
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCityPropertyCount = (cityKey) => {
    if (!realStats.loaded) return "Loading...";
    let count = realStats.cityMap[cityKey.toLowerCase()] || 0;
    if (cityKey === "vadodara" && realStats.cityMap["baroda"]) {
      count += realStats.cityMap["baroda"];
    }
    return `${count} ${count === 1 ? "Property" : "Properties"} Listed`;
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            <span>Gujarat's Trusted Real Estate Network</span>
          </div>
          <h1 className={styles.heroTitle}>
            We Make Property Search <span className={styles.highlight}>Simple & Transparent</span>
          </h1>
          <p className={styles.heroText}>
            Connecting buyers, sellers, and renters with verified properties across Ahmedabad, Surat, Vadodara, and Gandhinagar with zero guesswork.
          </p>

          <div className={styles.trustPillList}>
            <div className={styles.trustPill}>
              <HiOutlineCheckBadge className={styles.pillIcon} />
              <span>100% RERA & Title Checked</span>
            </div>
            <div className={styles.trustPill}>
              <HiOutlineUserGroup className={styles.pillIcon} />
              <span>Direct Builder & Owner Connect</span>
            </div>
            <div className={styles.trustPill}>
              <HiOutlineBanknotes className={styles.pillIcon} />
              <span>Home Loans from 7.80%</span>
            </div>
          </div>
        </section>

        {/* Story & Mission Section */}
        <section className={styles.storySection}>
          <div className={styles.storyContent}>
            <div className={styles.sectionBadge}>
              <HiOutlineSparkles className={styles.sparkleIcon} />
              <span>Who We Are</span>
            </div>
            <h2 className={styles.sectionHeading}>
              Pioneering Trust & Integrity in Gujarat Real Estate
            </h2>
            <p className={styles.storyParagraph}>
              runr properties was built to solve the real challenges home seekers face every day — inaccurate listings, hidden broker charges, and confusing paperwork.
            </p>
            <p className={styles.storyParagraph}>
              Whether you are buying your first 2 or 3 BHK apartment in Ahmedabad, finding a luxury bungalow in Surat, or investing in high-growth commercial hubs near GIFT City Gandhinagar, our platform combines verified on-ground data with personalized advisory.
            </p>

            <div className={styles.checklist}>
              <div className={styles.checkItem}>
                <HiOutlineCheckBadge className={styles.checkIcon} />
                <div>
                  <strong>Curated & Verified Inventory</strong>
                  <p>Every home is validated with genuine photos and owner verification.</p>
                </div>
              </div>
              <div className={styles.checkItem}>
                <HiOutlineCheckBadge className={styles.checkIcon} />
                <div>
                  <strong>End-to-End Documentation Support</strong>
                  <p>Complete legal checks, agreement drafting, and hassle-free registry.</p>
                </div>
              </div>
              <div className={styles.checkItem}>
                <HiOutlineCheckBadge className={styles.checkIcon} />
                <div>
                  <strong>Dedicated Area Property Advisors</strong>
                  <p>Local neighborhood experts guiding your physical & virtual site tours.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.storyVisual}>
            <div className={styles.imageCard}>
              <img
                src="/img/about-us/building-story.jpg"
                alt="Modern Real Estate Properties in Gujarat"
                className={styles.storyImg}
                loading="lazy"
              />
              <div className={styles.floatingBadge}>
                <div className={styles.floatingIcon}>
                  <HiOutlineBuildingOffice2 />
                </div>
                <div>
                  <div className={styles.floatingTitle}>
                    {realStats.totalProperties > 0 ? (
                      <AnimatedCounter end={realStats.totalProperties} suffix="+ Verified Homes" />
                    ) : (
                      "5,000+ Verified Homes"
                    )}
                  </div>
                  <div className={styles.floatingSub}>Across Gujarat Prime Localities</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Animated Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <AnimatedCounter
                  end={realStats.totalProperties > 0 ? realStats.totalProperties : 5000}
                  suffix={realStats.totalProperties > 10 ? "+" : "+"}
                />
              </div>
              <div className={styles.statLabel}>Properties Listed</div>
              <div className={styles.statDesc}>Live verified database inventory</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <AnimatedCounter end={2500} suffix="+" />
              </div>
              <div className={styles.statLabel}>Happy Families</div>
              <div className={styles.statDesc}>Successfully moved & settled</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <AnimatedCounter prefix="₹" end={250} suffix=" Cr+" />
              </div>
              <div className={styles.statLabel}>Value Transacted</div>
              <div className={styles.statDesc}>Safe & transparent deals</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <AnimatedCounter end={realStats.citiesCount || 4} suffix=" Cities" />
              </div>
              <div className={styles.statLabel}>Gujarat Hubs</div>
              <div className={styles.statDesc}>Ahmedabad, Surat, Vadodara & Gandhinagar</div>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars */}
        <section className={styles.pillarsSection}>
          <div className={styles.centerHeader}>
            <div className={styles.sectionBadge}>
              <HiOutlineEye className={styles.sparkleIcon} />
              <span>Our Core Pillars</span>
            </div>
            <h2 className={styles.sectionHeading}>Why Thousands Choose runr properties</h2>
            <p className={styles.sectionSubtitle}>
              Built on transparency, local market expertise, and customer-first values.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            {pillars.map((item, idx) => (
              <div key={idx} className={styles.pillarCard}>
                <div className={styles.pillarIconWrap}>{item.icon}</div>
                <h3 className={styles.pillarTitle}>{item.title}</h3>
                <p className={styles.pillarDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Step Journey */}
        <section className={styles.processSection}>
          <div className={styles.centerHeader}>
            <div className={styles.sectionBadge}>
              <HiOutlineHandThumbUp className={styles.sparkleIcon} />
              <span>How It Works</span>
            </div>
            <h2 className={styles.sectionHeading}>Your Seamless Property Journey</h2>
            <p className={styles.sectionSubtitle}>
              From first search to final key handover in 3 straightforward steps.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((st, idx) => (
              <div key={idx} className={styles.stepCard}>
                <div className={styles.stepNumber}>{st.step}</div>
                <h3 className={styles.stepTitle}>{st.title}</h3>
                <p className={styles.stepDesc}>{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advisory & Consultation Feature */}
        <section className={styles.advisorySection}>
          <div className={styles.advisoryVisual}>
            <div className={styles.advisoryImageWrap}>
              <img
                src="/img/about-us/consultation.jpg"
                alt="runr properties advisory and consultation"
                className={styles.advisoryImg}
                loading="lazy"
              />
              <div className={styles.advisoryFloatingCard}>
                <div className={styles.advisoryAvatar}>★</div>
                <div>
                  <div className={styles.advisoryCardTitle}>4.9/5 Trust Rating</div>
                  <div className={styles.advisoryCardSub}>Based on 2,500+ client reviews</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.advisoryContent}>
            <div className={styles.sectionBadge}>
              <HiOutlineUserGroup className={styles.sparkleIcon} />
              <span>Expert Guidance</span>
            </div>
            <h2 className={styles.sectionHeading}>
              Certified Property Advisors at Your Service
            </h2>
            <p className={styles.storyParagraph}>
              Buying or renting property is one of life’s most significant decisions. Our dedicated consultants assist you at every step — evaluating fair market pricing, comparing loan options, verifying legal clearance, and scheduling on-ground visits.
            </p>
            <div className={styles.advisoryPoints}>
              <div className={styles.advPoint}>
                <span className={styles.advDot} />
                <span>Zero Pressure Advisory — 100% focused on your requirements</span>
              </div>
              <div className={styles.advPoint}>
                <span className={styles.advDot} />
                <span>RERA-certified legal documentation and registry assistance</span>
              </div>
              <div className={styles.advPoint}>
                <span className={styles.advDot} />
                <span>Lowest bank EMI offers with instant pre-qualification</span>
              </div>
            </div>

            <div className={styles.advisoryActions}>
              <Link href="/contact" className={styles.primaryBtn}>
                <span>Speak with an Advisor</span>
                <HiOutlineArrowRight />
              </Link>
              <Link href="/buy" className={styles.secondaryBtn}>
                <span>Explore Buy Properties</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Real Live City Presence Section */}
        <section className={styles.citiesSection}>
          <div className={styles.centerHeader}>
            <div className={styles.sectionBadge}>
              <HiOutlineMapPin className={styles.sparkleIcon} />
              <span>Our Geographic Reach</span>
            </div>
            <h2 className={styles.sectionHeading}>Active Across Gujarat's Top Real Estate Markets</h2>
            <p className={styles.sectionSubtitle}>
              Real-time property inventory updated live across Gujarat's fastest growing corridors.
            </p>
          </div>

          <div className={styles.citiesGrid}>
            {defaultCities.map((city) => (
              <Link
                key={city.key}
                href={`/city/${city.key}`}
                className={styles.cityCard}
              >
                <div className={styles.cityCardTop}>
                  <div className={styles.cityIconBox}>
                    <img src={city.image} alt={city.name} className={styles.cityIconImg} />
                  </div>
                  <div className={styles.cityBadgeWrapper}>
                    <span className={styles.cityLiveBadge}>
                      <span className={styles.cityLiveDot} />
                      {getCityPropertyCount(city.key)}
                    </span>
                  </div>
                </div>

                <div className={styles.cityCardBody}>
                  <div className={styles.cityNameRow}>
                    <h3 className={styles.cityName}>{city.name}</h3>
                    <div className={styles.cityArrowCircle}>
                      <HiOutlineArrowRight />
                    </div>
                  </div>
                  <p className={styles.cityTagline}>{city.tagline}</p>
                </div>

                <div className={styles.cityCardFooter}>
                  <div className={styles.cityAreaHeader}>
                    <HiOutlineMapPin className={styles.mapPinIcon} />
                    <span>Prime Localities</span>
                  </div>
                  <div className={styles.cityAreaTags}>
                    {city.areas.split(",").map((area, aIdx) => (
                      <span key={aIdx} className={styles.areaChip}>
                        {area.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.cardHoverGlow} />
              </Link>
            ))}
          </div>
        </section>

        {/* Distinctive Redesigned CTA Card (Differentiated from Blue Footer) */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaCardInner}>
            <div className={styles.ctaBadge}>
              <HiOutlineSparkles className={styles.ctaBadgeIcon} />
              <span>Start Your Search Today</span>
            </div>
            <h2 className={styles.ctaTitle}>Ready to Find Your Ideal Property in Gujarat?</h2>
            <p className={styles.ctaDesc}>
              Browse through verified residential apartments, luxury villas, and commercial spaces across Ahmedabad, Surat, Gandhinagar & Vadodara.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/buy" className={styles.ctaPrimaryBtn}>
                Browse Properties
              </Link>
              <Link href="/home-loans" className={styles.ctaSecondaryBtn}>
                Check Home Loan Offers
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
