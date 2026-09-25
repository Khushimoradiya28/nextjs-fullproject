"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPublicBlogs, getMediaUrl } from "../services/api";
import styles from "./blog.module.css";

const fallbackBlogPosts = [
  { slug: "real-estate-trends-2025", title: "Real Estate Trends in 2025", excerpt: "A smart guide to the new market dynamics shaping investment choices across India.", date: "May 10, 2025", category: "Market Trends", author: "runr team", readTime: "5 min", image: "/img/blog/1.jpg" },
  { slug: "how-to-choose-right-property", title: "How to Choose the Right Property", excerpt: "Practical tips for matching budget, location, and future value when buying.", date: "May 05, 2025", category: "Buying Guide", author: "runr team", readTime: "4 min", image: "/img/blog/2.jpg" },
  { slug: "top-investment-locations-india", title: "Top Investment Locations in India", excerpt: "Discover the fastest-growing cities for real estate buyers and investors today.", date: "May 01, 2025", category: "Investment", author: "runr team", readTime: "6 min", image: "/img/blog/3.jpg" },
  { slug: "home-loan-tips-first-buyers", title: "Home Loan Tips for First-Time Buyers", excerpt: "Everything you need to know before applying for your first home loan.", date: "Apr 28, 2025", category: "Finance", author: "runr team", readTime: "5 min", image: "/img/blog/4.jpg" },
  { slug: "vastu-tips-new-home", title: "Vastu Tips for Your New Home", excerpt: "Simple vastu guidelines to bring positive energy to your living space.", date: "Apr 20, 2025", category: "Lifestyle", author: "runr team", readTime: "3 min", image: "/img/blog/1.jpg" },
  { slug: "rental-market-guide-2025", title: "Rental Market Guide 2025", excerpt: "Understanding rental yields, tenant demands, and best cities for rental income.", date: "Apr 15, 2025", category: "Rental", author: "runr team", readTime: "6 min", image: "/img/blog/2.jpg" },
];

const ITEMS_PER_PAGE = 6;

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const activeReq = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const reqId = ++activeReq.current;

    async function loadBlogs() {
      setLoading(true);
      try {
        const res = await getPublicBlogs({ page: currentPage, limit: ITEMS_PER_PAGE });
        if (!isMounted || reqId !== activeReq.current) return;

        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((b) => ({
            slug: b.slug,
            title: b.title,
            excerpt: b.excerpt,
            category: b.category,
            author: (b.author || "runr team").replace(/Runr/g, "runr"),
            readTime: b.readTime || "5 min",
            date: b.createdAt
              ? new Date(b.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : "Recent",
            image: getMediaUrl(b.coverImage, "/img/blog/1.jpg"),
          }));
          setBlogs(mapped);
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages || 1);
          }
        } else {
          // If no blogs returned, use graceful fallback
          setBlogs(fallbackBlogPosts);
        }
      } catch (err) {
        if (isMounted) setBlogs(fallbackBlogPosts);
      } finally {
        if (isMounted && reqId === activeReq.current) {
          setLoading(false);
        }
      }
    }

    loadBlogs();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const goToPage = (page) => {
    const newPage = typeof page === "function" ? page(currentPage) : page;
    setCurrentPage(newPage);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.pageHeader}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            <span>Market Research & Insights</span>
          </div>
          <h1 className={styles.pageTitle}>
            Real Estate <span className={styles.highlight}>Insights & Guides</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Expert articles, market trends, and investment strategies crafted by Gujarat's trusted property advisors.
          </p>
        </section>

        <div className={styles.blogGrid}>
          {loading && blogs.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImg} />
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonLine} style={{ width: "30%" }} />
                    <div className={styles.skeletonLine} style={{ width: "85%", height: "20px" }} />
                    <div className={styles.skeletonLine} style={{ width: "95%" }} />
                    <div className={styles.skeletonLine} style={{ width: "60%" }} />
                  </div>
                </div>
              ))
            : blogs.map((post, i) => (
                <Link key={`${post.slug}-${i}`} href={`/blog/${post.slug}`} className={styles.blogCard}>
                  <div className={styles.cardImageWrap}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className={styles.cardImg}
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={220}
                    />
                    <span className={styles.cardCategory}>{post.category}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.cardDate}>{post.date}</span>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.authorAvatar}>
                        {post.author ? post.author.substring(0, 2).toLowerCase() : "rt"}
                      </span>
                      <span className={styles.authorName}>
                        {post.author ? post.author.replace(/Runr/g, "runr") : "runr team"}
                      </span>
                      <span className={styles.readTime}>{post.readTime} read</span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => goToPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              onClick={() => goToPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
            >
              →
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
