"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getBlogBySlug, getMediaUrl } from "../../services/api";
import styles from "./blogdetail.module.css";

const fallbackBlogData = {
  "how-to-choose-right-property": {
    title: "How to Choose the Right Property",
    date: "Sep 23, 2026",
    author: "runr team",
    readTime: "4 min",
    category: "Buying Guide",
    image: "/img/blog/2.jpg",
    content: `<h2>Define Your Requirements</h2><p>Start by listing your must-haves versus nice-to-haves. Consider factors like proximity to workplace, schools, hospitals, and public transport.</p><h2>Budget Planning</h2><p>Factor in not just the property cost but registration charges, stamp duty, maintenance deposits, and interior costs. Keep 10-15% buffer for unexpected expenses.</p><h2>Location Analysis</h2><p>Research upcoming infrastructure projects, metro connectivity plans, and neighborhood development. Properties near upcoming infrastructure see 20-30% appreciation.</p><ul><li>Check RERA registration of the project</li><li>Verify builder's track record and delivery history</li><li>Visit the site at different times of day</li><li>Talk to existing residents if possible</li></ul>`,
  },
  "real-estate-trends-2025": {
    title: "Real Estate Trends in 2025",
    date: "Sep 23, 2026",
    author: "runr team",
    readTime: "5 min",
    category: "Market Trends",
    image: "/img/blog/1.jpg",
    content: `<h2>The Market is Shifting</h2><p>The Indian real estate market in 2025 is witnessing significant transformation driven by technology, government policies, and changing buyer preferences. Cities like Ahmedabad, Surat, and Pune are emerging as top investment destinations.</p><p>Key factors driving growth include infrastructure development, RERA compliance improvements, and increasing demand for premium housing segments.</p><h2>Technology-Driven Buying</h2><p>Virtual tours, AI-powered recommendations, and blockchain-based property records are making transactions faster and more transparent. Buyers now research extensively online before site visits.</p><h2>Investment Opportunities</h2><p>Commercial real estate, fractional ownership, and REITs continue to offer diversified investment options for different budget ranges.</p><ul><li>Tier-2 cities showing 15-20% annual appreciation</li><li>Green-certified buildings commanding 8-12% premium</li><li>Co-living spaces gaining traction among millennials</li></ul>`,
  },
  "top-investment-locations-india": {
    title: "Top Investment Locations in India",
    date: "Sep 23, 2026",
    author: "runr team",
    readTime: "6 min",
    category: "Investment",
    image: "/img/blog/3.jpg",
    content: `<h2>Gujarat Leading the Way</h2><p>Gujarat continues to be a top investment destination with cities like Ahmedabad, Surat, and Gandhinagar offering excellent infrastructure and growing demand.</p><h2>Key Cities to Watch</h2><p>Ahmedabad's SG Highway corridor, Surat's diamond hub expansion areas, and Vadodara's IT-driven growth zones are delivering strong returns for early investors.</p><ul><li>Ahmedabad - 12-18% annual appreciation in key micro-markets</li><li>Surat - Affordable entry with high rental yields</li><li>Gandhinagar - GIFT City driving premium demand</li><li>Vadodara - IT corridor attracting young professionals</li></ul>`,
  },
  "home-loan-tips-first-buyers": {
    title: "Home Loan Tips for First-Time Buyers",
    date: "Sep 23, 2026",
    author: "runr team",
    readTime: "5 min",
    category: "Finance",
    image: "/img/blog/4.jpg",
    content: `<h2>Know Your Eligibility</h2><p>Banks typically offer 75-90% of property value as loan. Your EMI should not exceed 40-50% of your monthly income for comfortable repayment.</p><h2>Compare Interest Rates</h2><p>Even a 0.25% difference in interest rate can save lakhs over the loan tenure. Always compare offers from at least 3-4 banks before deciding.</p><h2>Documentation Ready</h2><p>Keep all documents organized before applying to speed up the process significantly.</p><ul><li>Maintain good credit score (750+) for best rates</li><li>Consider joint loans for higher eligibility</li><li>Opt for longer tenure but prepay when possible</li><li>Choose floating rate in falling interest regime</li></ul>`,
  },
};

const defaultRelated = [
  {
    slug: "top-investment-locations-india",
    title: "Top Investment Locations in India",
    excerpt: "Discover the fastest-growing cities for real estate buyers and investors today.",
    date: "Sep 23, 2026",
    category: "Investment",
    readTime: "6 min",
    image: "/img/blog/3.jpg",
  },
  {
    slug: "home-loan-tips-first-buyers",
    title: "Home Loan Tips for First-Time Buyers",
    excerpt: "Everything you need to know before applying for your first home loan.",
    date: "Sep 23, 2026",
    category: "Finance",
    readTime: "5 min",
    image: "/img/blog/4.jpg",
  },
  {
    slug: "real-estate-trends-2025",
    title: "Real Estate Trends in 2025",
    excerpt: "A smart guide to the new market dynamics shaping investment choices across India.",
    date: "Sep 23, 2026",
    category: "Market Trends",
    readTime: "5 min",
    image: "/img/blog/1.jpg",
  },
];

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [post, setPost] = useState(() => fallbackBlogData[slug] || null);
  const [related, setRelated] = useState(defaultRelated);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    async function loadPost() {
      try {
        const res = await getBlogBySlug(slug);
        if (!isMounted) return;

        if (res.success && res.data) {
          const b = res.data;
          const isUpdated = b.updatedAt && new Date(b.updatedAt).getTime() - new Date(b.createdAt).getTime() > 60000;
          setPost({
            title: b.title,
            category: b.category,
            date: b.createdAt
              ? new Date(b.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : "Recent",
            updatedDate: isUpdated
              ? new Date(b.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : null,
            author: (b.author || "runr team").replace(/Runr/g, "runr"),
            readTime: b.readTime || "5 min",
            image: getMediaUrl(b.coverImage, "/img/blog/1.jpg"),
            content: b.content,
          });

          if (res.related && res.related.length > 0) {
            setRelated(
              res.related.map((r) => ({
                slug: r.slug,
                title: r.title,
                excerpt: r.excerpt,
                category: r.category,
                date: r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "Recent",
                readTime: r.readTime || "5 min",
                image: getMediaUrl(r.coverImage, "/img/blog/1.jpg"),
              }))
            );
          }
        } else if (fallbackBlogData[slug]) {
          setPost(fallbackBlogData[slug]);
        }
      } catch (err) {
        if (isMounted && fallbackBlogData[slug]) {
          setPost(fallbackBlogData[slug]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = (platform) => {
    if (typeof window === "undefined" || !post) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);

    let shareUrl = "";
    if (platform === "whatsapp") {
      shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
    } else if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    } else if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    } else if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    }
  };

  if (!post && !loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.notFoundCard}>
            <div className={styles.notFoundIcon}>📄</div>
            <h1 className={styles.notFoundTitle}>Article Not Found</h1>
            <p className={styles.notFoundText}>
              The article you are looking for might have been moved or removed.
            </p>
            <Link href="/blog" className={styles.backBtnPrimary}>
              ← Back to All Articles
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* Navigation / Breadcrumb Row */}
        <div className={styles.navRow}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{post?.category || "Article"}</span>
          </div>

          <Link href="/blog" className={styles.backLink}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>All Articles</span>
          </Link>
        </div>

        {/* Article Header (Editorial Hero) */}
        <header className={styles.articleHero}>
          <div className={styles.heroMetaTop}>
            <span className={styles.categoryBadge}>{post?.category || "Insights"}</span>
          </div>

          <h1 className={styles.articleTitle}>{post?.title}</h1>

          <div className={styles.authorBar}>
            <div className={styles.authorAvatar}>
              {post?.author ? post.author.substring(0, 2).toUpperCase() : "RT"}
            </div>
            <div className={styles.authorDetails}>
              <div className={styles.authorMetaRow}>
                <span className={styles.authorName}>{post?.author || "runr team"}</span>
                <span className={styles.verifiedBadge} title="Verified Author">✓</span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.publishDate}>Published on {post?.date}</span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.readTimeBadge}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {post?.readTime || "5 min"} read
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Editorial Grid: Content Left (with nicely managed image), Sidebar Right */}
        <div className={styles.articleLayout}>
          <article className={styles.contentColumn}>
            {/* Featured Image inside content column */}
            {post?.image && (
              <div className={styles.featuredCoverWrapper}>
                <img
                  src={post.image}
                  alt={post.title}
                  className={styles.featuredCoverImg}
                  loading="eager"
                />
              </div>
            )}

            {/* Article Content */}
            <div
              className={styles.articleBody}
              dangerouslySetInnerHTML={{ __html: post?.content || "" }}
            />

            {/* Bottom Interactive Share Card */}
            <div className={styles.bottomShareBox}>
              <div className={styles.bottomShareText}>
                <h4>Found this article helpful?</h4>
                <p>Share it with friends, colleagues, or family planning property decisions.</p>
              </div>

              <div className={styles.shareActionGroup}>
                {/* WhatsApp */}
                <button
                  type="button"
                  className={`${styles.socialIconBtn} ${styles.socialBtnWhatsapp}`}
                  onClick={() => handleShare("whatsapp")}
                  aria-label="Share on WhatsApp"
                  title="Share on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </button>

                {/* X (Twitter) */}
                <button
                  type="button"
                  className={`${styles.socialIconBtn} ${styles.socialBtnTwitter}`}
                  onClick={() => handleShare("twitter")}
                  aria-label="Share on X (Twitter)"
                  title="Share on X (Twitter)"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  className={`${styles.socialIconBtn} ${styles.socialBtnLinkedin}`}
                  onClick={() => handleShare("linkedin")}
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3z"/>
                  </svg>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  className={`${styles.socialIconBtn} ${styles.socialBtnFacebook}`}
                  onClick={() => handleShare("facebook")}
                  aria-label="Share on Facebook"
                  title="Share on Facebook"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  className={`${styles.socialIconBtn} ${copied ? styles.socialBtnCopied : styles.socialBtnLink}`}
                  onClick={handleCopyLink}
                  aria-label={copied ? "Link Copied!" : "Copy Article Link"}
                  title={copied ? "Link Copied!" : "Copy link to clipboard"}
                >
                  {copied ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Author Bio Box */}
            <div className={styles.authorBioCard}>
              <div className={styles.bioAvatar}>
                {post?.author ? post.author.substring(0, 2).toUpperCase() : "RT"}
              </div>
              <div className={styles.bioContent}>
                <div className={styles.bioHeader}>
                  <h4 className={styles.bioName}>{post?.author || "runr team"}</h4>
                  <span className={styles.bioRole}>Editorial & Real Estate Research</span>
                </div>
                <p className={styles.bioDesc}>
                  Our research analysts monitor property trends, infrastructure updates, and market valuations across Gujarat to bring actionable real estate insights.
                </p>
              </div>
            </div>

            {/* Consultation Banner CTA */}
            <div className={styles.consultationBanner}>
              <div className={styles.consultationContent}>
                <span className={styles.consultationBadge}>✦ Free Consultation</span>
                <h3 className={styles.consultationTitle}>Looking to Buy or Invest in Gujarat?</h3>
                <p className={styles.consultationText}>
                  Connect with our certified property advisors for verified project listings, price negotiations, and complete legal support.
                </p>
              </div>
              <Link href="/contact" className={styles.consultationBtn}>
                Talk to an Advisor →
              </Link>
            </div>
          </article>

          {/* Sticky Right Sidebar */}
          <aside className={styles.sidebarColumn}>
            {/* Quick Consultation Widget */}
            <div className={styles.sidebarWidget}>
              <div className={styles.widgetHeader}>
                <span className={styles.widgetIcon}>🏡</span>
                <h4 className={styles.widgetTitle}>Property Assistance</h4>
              </div>
              <p className={styles.widgetText}>
                Need verified options tailored to your budget in Ahmedabad, Surat, or Gandhinagar?
              </p>
              <div className={styles.widgetActions}>
                <Link href="/contact" className={styles.widgetPrimaryBtn}>
                  Request Free Callback
                </Link>
                <a
                  href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Runr%20Team,%20I%20am%20interested%20in%20property%20consultation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.widgetWhatsappBtn}
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Compact Related Topics Widget */}
            <div className={styles.sidebarWidget}>
              <h4 className={styles.widgetTitle}>Explore Categories</h4>
              <div className={styles.categoryPills}>
                {["Buying Guide", "Market Trends", "Investment", "Finance", "Lifestyle", "Rental", "Legal", "Interior"].map(
                  (cat) => (
                    <Link
                      key={cat}
                      href={`/blog?category=${encodeURIComponent(cat)}`}
                      className={styles.categoryPill}
                    >
                      {cat}
                    </Link>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {related && related.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.relatedHeader}>
              <div>
                <span className={styles.relatedLabel}>✦ Keep Reading</span>
                <h2 className={styles.relatedTitle}>Related Articles</h2>
              </div>
              <Link href="/blog" className={styles.viewAllBtn}>
                View All Articles →
              </Link>
            </div>

            <div className={styles.relatedGrid}>
              {related.slice(0, 3).map((item, idx) => (
                <Link
                  key={`${item.slug}-${idx}`}
                  href={`/blog/${item.slug}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImgWrap}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.relatedImg}
                      loading="lazy"
                    />
                    <span className={styles.relatedCardCategory}>{item.category}</span>
                  </div>
                  <div className={styles.relatedContent}>
                    <span className={styles.relatedDate}>{item.date}</span>
                    <h3 className={styles.relatedCardTitle}>{item.title}</h3>
                    <p className={styles.relatedExcerpt}>{item.excerpt}</p>
                    <div className={styles.relatedFooter}>
                      <span className={styles.relatedRead}>{item.readTime} read</span>
                      <span className={styles.readMoreArrow}>Read Article →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
