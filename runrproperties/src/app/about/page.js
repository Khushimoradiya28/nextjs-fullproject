import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./about.module.css";

const values = [
  { icon: "/img/why-chooes/verified.png", title: "Transparency", text: "Every listing verified, every detail accurate. No hidden surprises." },
  { icon: "/img/why-chooes/trust.png", title: "Trust", text: "Building lasting relationships with buyers, sellers, and partners." },
  { icon: "/img/why-chooes/expert.png", title: "Innovation", text: "Using technology to simplify your property search experience." },
  { icon: "/img/why-chooes/best-deals.png", title: "Customer First", text: "Your needs drive everything we do, from search to settlement." },
];

const stats = [
  { value: "5000+", label: "Properties Listed" },
  { value: "2500+", label: "Happy Customers" },
  { value: "6", label: "Cities Covered" },
  { value: "150+", label: "Partner Agents" },
];

const team = [
  { name: "Rahul Kumar", role: "Founder & CEO", initials: "RK" },
  { name: "Sneha Patel", role: "Head of Operations", initials: "SP" },
  { name: "Amit Mehta", role: "Tech Lead", initials: "AM" },
];

export default function AboutPage() {
  const valuesDouble = [...values, ...values];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.heroLabel}>About Us</span>
          <h1 className={styles.heroTitle}>We Make Property Search Simple</h1>
          <p className={styles.heroText}>Runr Properties is Gujarat's trusted real estate platform connecting buyers, sellers, and renters with verified properties across top cities.</p>
        </section>

        <section className={styles.missionSection}>
          <div className={styles.missionContent}>
            <h2>Our Mission</h2>
            <p>To make property transactions transparent, efficient, and accessible for everyone. We believe finding your perfect home should be exciting, not stressful.</p>
            <p>Founded in 2023, we have helped thousands of families find their dream homes across Gujarat with verified listings, expert guidance, and seamless digital experience.</p>
          </div>
          <div className={styles.missionImage}>
            <img src="/img/about-us/mission.jpg" alt="Our mission - helping families find homes" loading="lazy" />
          </div>
        </section>

        <section className={styles.statsSection}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </section>

        <section className={styles.valuesSection}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <p className={styles.sectionSubtitle}>What drives us every day</p>

          <div className={styles.marqueeWrap}>
            <div className={styles.marqueeTrack}>
              {valuesDouble.map((v, i) => (
                <div key={`val-${i}`} className={styles.valueCard}>
                  <div className={styles.valueIcon}><img src={v.icon} alt={v.title} /></div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueText}>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.teamSection}>
          <h2 className={styles.sectionTitle}>Meet Our Team</h2>
          <p className={styles.sectionSubtitle}>The people behind Runr Properties</p>
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.name} className={styles.teamCard}>
                <div className={styles.teamAvatar}>{member.initials}</div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <p className={styles.teamRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
