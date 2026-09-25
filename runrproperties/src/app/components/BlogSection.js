"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedBlogs, getMediaUrl } from "../services/api";
import styles from "./BlogSection.module.css";

const defaultBlogPosts = [
  {
    slug: "real-estate-trends-2025",
    title: "Real Estate Trends in 2025",
    date: "May 10, 2025",
    description: "A smart guide to the new market dynamics shaping investment choices.",
    image: "/img/blog/1.jpg",
  },
  {
    slug: "how-to-choose-right-property",
    title: "How to Choose the Right Property",
    date: "May 05, 2025",
    description: "Practical tips for matching budget, location, and future value.",
    image: "/img/blog/2.jpg",
  },
  {
    slug: "top-investment-locations-india",
    title: "Top Investment Locations in India",
    date: "May 01, 2025",
    description: "Discover the fastest-growing cities for real estate buyers today.",
    image: "/img/blog/3.jpg",
  },
  {
    slug: "home-loan-tips-first-buyers",
    title: "Home Loan Tips for First-Time Buyers",
    date: "Apr 28, 2025",
    description: "Everything you need to know before applying for your first home loan.",
    image: "/img/blog/4.jpg",
  },
];

export default function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;

    async function loadBlogs() {
      try {
        const res = await getFeaturedBlogs(4);
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((b) => ({
            slug: b.slug,
            title: b.title,
            date: b.createdAt
              ? new Date(b.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : "Recent",
            description: b.excerpt || "",
            image: getMediaUrl(b.coverImage, "/img/blog/1.jpg"),
          }));
          setBlogs(mapped);
        } else {
          setBlogs(defaultBlogPosts);
        }
      } catch (err) {
        setBlogs(defaultBlogPosts);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const displayBlogs = blogs.length > 0 ? blogs : defaultBlogPosts;

  return (
    <section className={styles.blogSection}>
      <div className={styles.blogInner}>
        <div className={styles.blogHeader}>
          <div>
            <span className={styles.label}>✦ Insights</span>
            <h2 className={styles.sectionTitle}>Latest from Blog</h2>
            <div className={styles.titleUnderline} />
          </div>
          <Link href="/blog" className={styles.viewAll}>
            View All Blogs →
          </Link>
        </div>

        <div className={styles.blogGrid}>
          {displayBlogs.map((post, index) => (
            <Link
              key={post.slug || index}
              href={`/blog/${post.slug || ""}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <article className={styles.blogCard}>
                <div className={styles.cardVisual} aria-hidden="true">
                  <img
                    className={styles.cardImage}
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    width={340}
                    height={200}
                  />
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.cardDate}>{post.date}</span>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardText}>{post.description}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.callbackPanel}>
        <div className={styles.callbackInfo}>
          <span className={styles.callbackIcon} aria-hidden="true">
            <Image
              src="/img/blog/search.png"
              alt="Search icon"
              width={60}
              height={60}
            />
          </span>
          <div>
            <h3 className={styles.callbackLabel}>Can’t find what you’re looking for?</h3>
            <p className={styles.callbackText}>Let us help you find the perfect property.</p>
          </div>
        </div>
        <a className={styles.callButton} href="tel:+911234567890">
          Request Callback
        </a>
      </div>
    </section>
  );
}
