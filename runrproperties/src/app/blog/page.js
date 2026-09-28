"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPublicBlogs, getMediaUrl } from "../services/api";
import styles from "./blog.module.css";

// Exact category list matching Backend Schema enum & Admin Portal
const BLOG_CATEGORIES = [
  "All",
  "Buying Guide",
  "Market Trends",
  "Investment",
  "Finance",
  "Lifestyle",
  "Rental",
  "Legal",
  "Interior",
];

const fallbackBlogPosts = [
  { slug: "home-loan-tips-first-buyers", title: "Home Loan Tips for First-Time Buyers", excerpt: "Everything you need to know before applying for your first home loan.", date: "Sep 23, 2026", category: "Finance", author: "runr team", readTime: "5 min", image: "/img/blog/4.jpg" },
  { slug: "how-to-choose-right-property", title: "How to Choose the Right Property", excerpt: "Practical tips for matching budget, location, and future value when buying.", date: "Sep 23, 2026", category: "Buying Guide", author: "runr team", readTime: "4 min", image: "/img/blog/2.jpg" },
  { slug: "top-investment-locations-india", title: "Top Investment Locations in India", excerpt: "Discover the fastest-growing cities for real estate buyers and investors today.", date: "Sep 23, 2026", category: "Investment", author: "runr team", readTime: "6 min", image: "/img/blog/3.jpg" },
  { slug: "real-estate-trends-2025", title: "Real Estate Trends in 2025", excerpt: "A smart guide to the new market dynamics shaping investment choices across India.", date: "Sep 23, 2026", category: "Market Trends", author: "runr team", readTime: "5 min", image: "/img/blog/1.jpg" },
  { slug: "vastu-tips-new-home", title: "Vastu Tips for Your New Home", excerpt: "Simple vastu guidelines to bring positive energy to your living space.", date: "Sep 23, 2026", category: "Lifestyle", author: "runr team", readTime: "3 min", image: "/img/blog/1.jpg" },
  { slug: "rental-market-guide-2025", title: "Rental Market Guide 2025", excerpt: "Understanding rental yields, tenant demands, and best cities for rental income.", date: "Sep 23, 2026", category: "Rental", author: "runr team", readTime: "6 min", image: "/img/blog/2.jpg" },
  { slug: "commercial-vs-residential-real-estate", title: "Commercial vs Residential Real Estate: Which is Better?", excerpt: "A comprehensive comparison of capital appreciation, risk, and cash flow in both sectors.", date: "Sep 20, 2026", category: "Investment", author: "runr team", readTime: "7 min", image: "/img/blog/3.jpg" },
  { slug: "tax-benefits-home-loans-india", title: "Tax Benefits on Home Loans in India (2025-26)", excerpt: "Maximize your tax deductions under Section 80C, Section 24(b), and Section 80EEA.", date: "Sep 18, 2026", category: "Finance", author: "runr team", readTime: "5 min", image: "/img/blog/4.jpg" },
  { slug: "smart-home-automation-trends-gujarat", title: "Smart Home Automation Trends in Gujarat", excerpt: "Explore how smart lighting, IoT security, and energy-saving systems are redefining modern living.", date: "Sep 15, 2026", category: "Lifestyle", author: "runr team", readTime: "4 min", image: "/img/blog/1.jpg" },
  { slug: "rera-guidelines-buyer-guide", title: "RERA Guidelines: Everything Every Buyer Must Know", excerpt: "Protect your investment with key RERA rules regarding carpet area, escrow accounts, and delivery timelines.", date: "Sep 12, 2026", category: "Buying Guide", author: "runr team", readTime: "6 min", image: "/img/blog/2.jpg" },
  { slug: "emerging-growth-corridors-ahmedabad-gift-city", title: "Emerging Growth Corridors in Ahmedabad & GIFT City", excerpt: "Why the SG Highway - GIFT City corridor is currently India’s most promising real estate hotspot.", date: "Sep 10, 2026", category: "Market Trends", author: "runr team", readTime: "6 min", image: "/img/blog/3.jpg" },
  { slug: "nri-property-investment-guide", title: "NRI Property Investment in India: Complete Guide", excerpt: "Repatriation rules, FEMA regulations, power of attorney, and top investment avenues for NRIs.", date: "Sep 05, 2026", category: "Investment", author: "runr team", readTime: "7 min", image: "/img/blog/4.jpg" },
];

const ITEMS_PER_PAGE = 6; // Exactly 2 rows (3 cards per row)

// In-memory cache for instant zero-lag category & page transitions
const blogPageCache = {};

function BlogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramCat = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (paramCat && BLOG_CATEGORIES.includes(paramCat)) return paramCat;
    return "All";
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState(() => fallbackBlogPosts.slice(0, ITEMS_PER_PAGE));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const activeReq = useRef(0);
  const gridTopRef = useRef(null);

  // Sync category state if URL param changes
  useEffect(() => {
    if (paramCat && BLOG_CATEGORIES.includes(paramCat) && paramCat !== selectedCategory) {
      setSelectedCategory(paramCat);
      setCurrentPage(1);
    }
  }, [paramCat]);

  useEffect(() => {
    let isMounted = true;
    const reqId = ++activeReq.current;
    const cacheKey = `${selectedCategory}_${currentPage}`;

    // Use in-memory cache if available for instant feel
    if (blogPageCache[cacheKey]) {
      setBlogs(blogPageCache[cacheKey].blogs);
      setTotalPages(blogPageCache[cacheKey].totalPages);
      setTotalCount(blogPageCache[cacheKey].totalCount);
      setLoading(false);
    } else {
      setLoading(true);
    }

    async function loadBlogs() {
      try {
        const res = await getPublicBlogs({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          category: selectedCategory === "All" ? "all" : selectedCategory,
        });

        if (!isMounted || reqId !== activeReq.current) return;

        if (res.success && res.data) {
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
          const pages = res.pagination?.totalPages || 1;
          const count = res.pagination?.total || mapped.length;

          blogPageCache[cacheKey] = { blogs: mapped, totalPages: pages, totalCount: count };
          setBlogs(mapped);
          setTotalPages(pages);
          setTotalCount(count);
        } else {
          // Fallback filtering
          const filtered = selectedCategory === "All"
            ? fallbackBlogPosts
            : fallbackBlogPosts.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());
          
          const start = (currentPage - 1) * ITEMS_PER_PAGE;
          const slice = filtered.slice(start, start + ITEMS_PER_PAGE);
          const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

          blogPageCache[cacheKey] = { blogs: slice, totalPages: pages, totalCount: filtered.length };
          setBlogs(slice);
          setTotalPages(pages);
          setTotalCount(filtered.length);
        }
      } catch (err) {
        if (isMounted) {
          const filtered = selectedCategory === "All"
            ? fallbackBlogPosts
            : fallbackBlogPosts.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());
          
          const start = (currentPage - 1) * ITEMS_PER_PAGE;
          const slice = filtered.slice(start, start + ITEMS_PER_PAGE);
          const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

          setBlogs(slice);
          setTotalPages(pages);
          setTotalCount(filtered.length);
        }
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
  }, [currentPage, selectedCategory]);

  const handleCategorySelect = (cat) => {
    if (cat === selectedCategory) return;
    setSelectedCategory(cat);
    setCurrentPage(1);
    
    // Update URL query smoothly
    if (cat === "All") {
      router.push("/blog", { scroll: false });
    } else {
      router.push(`/blog?category=${encodeURIComponent(cat)}`, { scroll: false });
    }

    scrollToGrid();
  };

  const goToPage = (page) => {
    const newPage = typeof page === "function" ? page(currentPage) : page;
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    scrollToGrid();
  };

  const scrollToGrid = () => {
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        if (gridTopRef.current) {
          gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => goToPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          aria-label="Previous Page"
        >
          ←
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageBtnActive : ""}`}
              onClick={() => goToPage(1)}
            >
              1
            </button>
            {start > 2 && <span className={styles.pageEllipsis}>...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            type="button"
            key={page}
            className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className={styles.pageEllipsis}>...</span>}
            <button
              type="button"
              className={`${styles.pageBtn} ${currentPage === totalPages ? styles.pageBtnActive : ""}`}
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => goToPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* Page Header Section */}
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

        {/* Anchor for smooth scroll */}
        <div ref={gridTopRef} className={styles.gridAnchor} />

        {/* Sticky Category Filter Tabs Bar right above the blog grid */}
        <div className={styles.stickyFilterContainer}>
          <div className={styles.stickyFilterInner} role="tablist" aria-label="Blog categories">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`${styles.filterTab} ${selectedCategory === cat ? styles.filterTabActive : ""}`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2 Rows (6 cards per page) */}
        {loading && blogs.length === 0 ? (
          <div className={styles.blogGrid}>
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={`skeleton-${i}`} className={styles.skeletonCard}>
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine} style={{ width: "30%" }} />
                  <div className={styles.skeletonLine} style={{ width: "85%", height: "20px" }} />
                  <div className={styles.skeletonLine} style={{ width: "95%" }} />
                  <div className={styles.skeletonLine} style={{ width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className={styles.blogGrid}>
            {blogs.map((post, i) => (
              <Link key={`${post.slug}-${i}`} href={`/blog/${post.slug}`} className={styles.blogCard}>
                <div className={styles.cardImageWrap}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className={styles.cardImg}
                    loading="eager"
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
        ) : (
          /* Empty State for category with no blogs */
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📂</div>
            <h3 className={styles.emptyTitle}>No Articles in &quot;{selectedCategory}&quot;</h3>
            <p className={styles.emptyDesc}>
              There are currently no published articles under this category.
            </p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => handleCategorySelect("All")}
            >
              View All Articles
            </button>
          </div>
        )}

        {/* Proper Pagination after 2 rows */}
        {!loading && renderPagination()}
      </main>

      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogContent />
    </Suspense>
  );
}
