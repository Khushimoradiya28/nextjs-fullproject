import styles from "./page.module.css";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import FeaturedProperties from "./components/FeaturedProperties";
import CityPortal from "./components/CityPortal";
import BlogSection from "./components/BlogSection";
import BenefitsCalculatorSection from "./components/BenefitsCalculatorSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <HeroBanner />
      <FeaturedProperties />
      <CityPortal />
      <BenefitsCalculatorSection />
      <BlogSection />
      <Footer/>
    </div>
  );
}
