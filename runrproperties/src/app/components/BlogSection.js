import Image from "next/image";
import styles from "./BlogSection.module.css";

const blogPosts = [
  {
    title: "Real Estate Trends in 2025",
    date: "May 10, 2025",
    description: "A smart guide to the new market dynamics shaping investment choices.",
    image: "/img/blog/1.jpg",
  },
  {
    title: "How to Choose the Right Property",
    date: "May 05, 2025",
    description: "Practical tips for matching budget, location, and future value.",
    image: "/img/blog/2.jpg",
  },
  {
    title: "Top Investment Locations in India",
    date: "May 01, 2025",
    description: "Discover the fastest-growing cities for real estate buyers today.",
    image: "/img/blog/3.jpg",
  },
];

export default function BlogSection() {
  return (
    <section className={styles.blogSection}>
      <div className={styles.blogHeader}>
        <div>
          <p className={styles.label}>Latest from Blog</p>
          <h2 className={styles.sectionTitle}>Real estate insights for buyers & investors</h2>
        </div>
        <a href="/blog" className={styles.viewAll}>
          View All Blogs →
        </a>
      </div>

      <div className={styles.blogGrid}>
        {blogPosts.map((post) => (
          <article key={post.title} className={styles.blogCard}>
            <div className={styles.cardVisual} aria-hidden="true">
              <Image
                className={styles.cardImage}
                src={post.image}
                alt={post.title}
                width={400}
                height={240}
                sizes="(max-width: 720px) 100vw, 33vw"
              />
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardDate}>{post.date}</span>
              <h3 className={styles.cardTitle}>{post.title}</h3>
              <p className={styles.cardText}>{post.description}</p>
            </div>
          </article>
        ))}
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
