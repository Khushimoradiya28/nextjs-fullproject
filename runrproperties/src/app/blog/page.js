"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./blog.module.css";

const blogPosts = [
  { slug: "real-estate-trends-2025", title: "Real Estate Trends in 2025", excerpt: "A smart guide to the new market dynamics shaping investment choices across India.", date: "May 10, 2025", category: "Market Trends", author: "RK", readTime: "5 min", image: "/img/blog/1.jpg" },
  { slug: "how-to-choose-right-property", title: "How to Choose the Right Property", excerpt: "Practical tips for matching budget, location, and future value when buying.", date: "May 05, 2025", category: "Buying Guide", author: "SP", readTime: "4 min", image: "/img/blog/2.jpg" },
  { slug: "top-investment-locations-india", title: "Top Investment Locations in India", excerpt: "Discover the fastest-growing cities for real estate buyers and investors today.", date: "May 01, 2025", category: "Investment", author: "AM", readTime: "6 min", image: "/img/blog/3.jpg" },
  { slug: "home-loan-tips-first-buyers", title: "Home Loan Tips for First-Time Buyers", excerpt: "Everything you need to know before applying for your first home loan.", date: "Apr 28, 2025", category: "Finance", author: "RK", readTime: "5 min", image: "/img/blog/4.jpg" },
  { slug: "vastu-tips-new-home", title: "Vastu Tips for Your New Home", excerpt: "Simple vastu guidelines to bring positive energy to your living space.", date: "Apr 20, 2025", category: "Lifestyle", author: "SP", readTime: "3 min", image: "/img/blog/1.jpg" },
  { slug: "rental-market-guide-2025", title: "Rental Market Guide 2025", excerpt: "Understanding rental yields, tenant demands, and best cities for rental income.", date: "Apr 15, 2025", category: "Rental", author: "AM", readTime: "6 min", image: "/img/blog/2.jpg" },
  { slug: "real-estate-trends-2025", title: "RERA Compliance Guide for Buyers", excerpt: "How RERA protects your investment and what to check before buying.", date: "Apr 10, 2025", category: "Legal", author: "RK", readTime: "4 min", image: "/img/blog/3.jpg" },
  { slug: "how-to-choose-right-property", title: "Interior Design on a Budget", excerpt: "Transform your new home without breaking the bank with these smart tips.", date: "Apr 05, 2025", category: "Lifestyle", author: "SP", readTime: "5 min", image: "/img/blog/4.jpg" },
  { slug: "top-investment-locations-india", title: "Smart City Projects in Gujarat", excerpt: "How government smart city initiatives are boosting property values.", date: "Mar 28, 2025", category: "Investment", author: "AM", readTime: "6 min", image: "/img/blog/1.jpg" },
];

const ITEMS_PER_PAGE = 6;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(blogPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = blogPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page) => {
    const newPage = typeof page === "function" ? page(currentPage) : page;
    setCurrentPage(newPage);
    requestAnimationFrame(() => { window.scrollTo({ top: 0, behavior: "smooth" }); });
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.pageHeader}>
          <span className={styles.heroLabel}>Our Blog</span>
          <h1 className={styles.pageTitle}>Real Estate Insights & Guides</h1>
          <p className={styles.pageSubtitle}>Expert articles on buying, selling, investing, and market trends</p>
        </section>

        <div className={styles.blogGrid}>
          {paginatedPosts.map((post, i) => (
            <Link key={`${post.slug}-${i}`} href={`/blog/${post.slug}`} className={styles.blogCard}>
              <div className={styles.cardImageWrap}>
                <img src={post.image} alt={post.title} className={styles.cardImg} loading="lazy" />
                <span className={styles.cardCategory}>{post.category}</span>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardDate}>{post.date}</span>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardExcerpt}>{post.excerpt}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.authorAvatar}>{post.author}</span>
                  <span className={styles.authorName}>{post.author}</span>
                  <span className={styles.readTime}>{post.readTime} read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => goToPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`} onClick={() => goToPage(page)}>{page}</button>
            ))}
            <button className={styles.pageBtn} onClick={() => goToPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>→</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
