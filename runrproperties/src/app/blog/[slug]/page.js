import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "./blogdetail.module.css";

const blogData = {
  "real-estate-trends-2025": { title: "Real Estate Trends in 2025", date: "May 10, 2025", author: "Runr Team", readTime: "5 min", category: "Market Trends", image: "/img/blog/1.jpg", content: `<h2>The Market is Shifting</h2><p>The Indian real estate market in 2025 is witnessing significant transformation driven by technology, government policies, and changing buyer preferences. Cities like Ahmedabad, Surat, and Pune are emerging as top investment destinations.</p><p>Key factors driving growth include infrastructure development, RERA compliance improvements, and increasing demand for premium housing segments.</p><h2>Technology-Driven Buying</h2><p>Virtual tours, AI-powered recommendations, and blockchain-based property records are making transactions faster and more transparent. Buyers now research extensively online before site visits.</p><h2>Investment Opportunities</h2><p>Commercial real estate, fractional ownership, and REITs continue to offer diversified investment options for different budget ranges.</p><ul><li>Tier-2 cities showing 15-20% annual appreciation</li><li>Green-certified buildings commanding 8-12% premium</li><li>Co-living spaces gaining traction among millennials</li></ul>` },
  "how-to-choose-right-property": { title: "How to Choose the Right Property", date: "May 05, 2025", author: "Runr Team", readTime: "4 min", category: "Buying Guide", image: "/img/blog/2.jpg", content: `<h2>Define Your Requirements</h2><p>Start by listing your must-haves versus nice-to-haves. Consider factors like proximity to workplace, schools, hospitals, and public transport.</p><h2>Budget Planning</h2><p>Factor in not just the property cost but registration charges, stamp duty, maintenance deposits, and interior costs. Keep 10-15% buffer for unexpected expenses.</p><h2>Location Analysis</h2><p>Research upcoming infrastructure projects, metro connectivity plans, and neighborhood development. Properties near upcoming infrastructure see 20-30% appreciation.</p><ul><li>Check RERA registration of the project</li><li>Verify builder's track record and delivery history</li><li>Visit the site at different times of day</li><li>Talk to existing residents if possible</li></ul>` },
  "top-investment-locations-india": { title: "Top Investment Locations in India", date: "May 01, 2025", author: "Runr Team", readTime: "6 min", category: "Investment", image: "/img/blog/3.jpg", content: `<h2>Gujarat Leading the Way</h2><p>Gujarat continues to be a top investment destination with cities like Ahmedabad, Surat, and Gandhinagar offering excellent infrastructure and growing demand.</p><h2>Key Cities to Watch</h2><p>Ahmedabad's SG Highway corridor, Surat's diamond hub expansion areas, and Vadodara's IT-driven growth zones are delivering strong returns for early investors.</p><ul><li>Ahmedabad - 12-18% annual appreciation in key micro-markets</li><li>Surat - Affordable entry with high rental yields</li><li>Gandhinagar - GIFT City driving premium demand</li><li>Vadodara - IT corridor attracting young professionals</li></ul>` },
  "home-loan-tips-first-buyers": { title: "Home Loan Tips for First-Time Buyers", date: "Apr 28, 2025", author: "Runr Team", readTime: "5 min", category: "Finance", image: "/img/blog/4.jpg", content: `<h2>Know Your Eligibility</h2><p>Banks typically offer 75-90% of property value as loan. Your EMI should not exceed 40-50% of your monthly income for comfortable repayment.</p><h2>Compare Interest Rates</h2><p>Even a 0.25% difference in interest rate can save lakhs over the loan tenure. Always compare offers from at least 3-4 banks before deciding.</p><h2>Documentation Ready</h2><p>Keep all documents organized before applying to speed up the process significantly.</p><ul><li>Maintain good credit score (750+) for best rates</li><li>Consider joint loans for higher eligibility</li><li>Opt for longer tenure but prepay when possible</li><li>Choose floating rate in falling interest regime</li></ul>` },
  "vastu-tips-new-home": { title: "Vastu Tips for Your New Home", date: "Apr 20, 2025", author: "Runr Team", readTime: "3 min", category: "Lifestyle", image: "/img/blog/1.jpg", content: `<h2>Entrance Direction</h2><p>North and east-facing entrances are considered most auspicious. Ensure the main door opens clockwise and is well-lit.</p><h2>Kitchen Placement</h2><p>The ideal kitchen location is the southeast corner of the house. The cook should face east while preparing food.</p><h2>Bedroom Guidelines</h2><p>Master bedroom should ideally be in the southwest. Avoid mirrors facing the bed and keep electronics minimal in sleeping areas.</p>` },
  "rental-market-guide-2025": { title: "Rental Market Guide 2025", date: "Apr 15, 2025", author: "Runr Team", readTime: "6 min", category: "Rental", image: "/img/blog/2.jpg", content: `<h2>Rental Yields in Gujarat</h2><p>Average rental yields in Gujarat range from 2.5% to 4.5% depending on location, property type, and furnishing level.</p><h2>Tenant Preferences</h2><p>Post-pandemic, tenants prioritize spacious layouts, work-from-home setups, good ventilation, and proximity to essential services.</p><h2>Tips for Landlords</h2><ul><li>Furnish smartly - semi-furnished attracts wider audience</li><li>Keep rent market-competitive with annual 5-8% revision</li><li>Maintain property well for long-term tenants</li><li>Use digital platforms for wider reach</li></ul>` },
};

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = blogData[slug];

  if (!post) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.articleHeader}>
            <h1 className={styles.articleTitle}>Blog post not found</h1>
            <Link href="/blog">← Back to Blog</Link>
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
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{post.title}</span>
        </div>

        <div className={styles.articleHeader}>
          <span className={styles.category}>{post.category}</span>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <div className={styles.articleMeta}>
            <span>{post.author}</span>
            <span className={styles.dot}>·</span>
            <span>{post.date}</span>
            <span className={styles.dot}>·</span>
            <span>{post.readTime} read</span>
          </div>
        </div>

        <div className={styles.articleLayout}>
          <div className={styles.imageColumn}>
            <div className={styles.featuredImage}>
              <img src={post.image} alt={post.title} loading="lazy" />
            </div>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className={styles.shareSection}>
              <p className={styles.shareLabel}>Share this article</p>
              <div className={styles.shareLinks}>
                <button className={styles.shareBtn} aria-label="Share on Facebook">f</button>
                <button className={styles.shareBtn} aria-label="Share on Twitter">t</button>
                <button className={styles.shareBtn} aria-label="Share on LinkedIn">in</button>
                <button className={styles.shareBtn} aria-label="Copy link">🔗</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
