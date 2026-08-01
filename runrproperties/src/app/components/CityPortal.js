"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { searchProperties } from "../services/api";
import styles from "./CityPortal.module.css";

const cities = [
  { slug: "ahmedabad", name: "Ahmedabad", image: "/img/cities-icon/1.png" },
  { slug: "surat", name: "Surat", image: "/img/cities-icon/2.png" },
  { slug: "vadodara", name: "Vadodara", image: "/img/cities-icon/3.png" },
  { slug: "rajkot", name: "Rajkot", image: "/img/cities-icon/4.png" },
  { slug: "gandhinagar", name: "Gandhinagar", image: "/img/cities-icon/5.png" },
  { slug: "bhavnagar", name: "Bhavnagar", image: "/img/cities-icon/6.png" },
];

export default function CityPortal() {
  const [cityCounts, setCityCounts] = useState({});
  const sliderRef = useRef(null);
  const cardWidthRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Fetch property counts per city from API
  useEffect(() => {
    async function loadCityCounts() {
      const res = await searchProperties({ limit: "100", status: "active" });
      if (res.success && res.properties) {
        const counts = {};
        res.properties.forEach(p => {
          if (p.city) {
            const key = p.city.toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
          }
        });
        setCityCounts(counts);
      }
    }
    loadCityCounts();
  }, []);

  // Tripled items for infinite loop effect
  const loopItems = [...cities, ...cities, ...cities];
  const coreSectionStart = cities.length;

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const card = slider.querySelector(`.${styles.cityCard}`);
    if (!card) return;

    const gap = 18;
    const cardWidth = card.offsetWidth + gap;
    cardWidthRef.current = cardWidth;
    slider.scrollLeft = cardWidth * coreSectionStart;
  }, [coreSectionStart]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const normalizePosition = () => {
      const cardWidth = cardWidthRef.current;
      if (!cardWidth) return;
      const min = cardWidth * 0.5;
      const max = cardWidth * (coreSectionStart * 2) - cardWidth * 0.5;

      if (slider.scrollLeft <= min) {
        slider.scrollLeft += cardWidth * cities.length;
      } else if (slider.scrollLeft >= max) {
        slider.scrollLeft -= cardWidth * cities.length;
      }
    };

    const onScroll = () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(normalizePosition, 80);
    };

    slider.addEventListener("scroll", onScroll);
    return () => {
      slider.removeEventListener("scroll", onScroll);
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    };
  }, [coreSectionStart]);

  const handlePrev = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const card = slider.querySelector(`.${styles.cityCard}`);
    if (card) {
      const gap = parseFloat(getComputedStyle(slider).gap) || 18;
      cardWidthRef.current = card.offsetWidth + gap;
    }
    const cardWidth = cardWidthRef.current || 180;
    slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
  };

  const handleNext = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const card = slider.querySelector(`.${styles.cityCard}`);
    if (card) {
      const gap = parseFloat(getComputedStyle(slider).gap) || 18;
      cardWidthRef.current = card.offsetWidth + gap;
    }
    const cardWidth = cardWidthRef.current || 180;
    slider.scrollBy({ left: cardWidth, behavior: "smooth" });
  };

  return (
    <section className={`${styles.citySection} gray-bg theme-padding`}>
      <div className={styles.cityHeader}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionTag}>✦ Explore Cities</span>
          <h2>Explore Properties in Top Cities</h2>
          <span className={styles.titleUnderline} />
        </div>

        <div className={styles.sliderControls}>
          <button
            type="button"
            className={styles.sliderButton}
            onClick={handlePrev}
            aria-label="Show previous cities"
          >
            ←
          </button>
          <button
            type="button"
            className={styles.sliderButton}
            onClick={handleNext}
            aria-label="Show next cities"
          >
            →
          </button>
        </div>
      </div>

      <div ref={sliderRef} className={styles.citySlider} suppressHydrationWarning>
        {loopItems.map((city, index) => (
          <Link
            key={`${city.slug}-${index}`}
            href={`/city/${city.slug}`}
            className={styles.cityCard}
          >
            <div className={styles.cityIcon} aria-hidden="true">
              <img src={city.image} alt={city.name} className={styles.cityImage} />
            </div>
            <div className={styles.cityInfo}>
              <span className={styles.cityName}>{city.name}</span>
              <span className={styles.cityLabel}>{cityCounts[city.slug] || 0} Properties</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
