import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import VideoIntro from "./_components/VideoIntro";
import Navbar from "./_components/Navbar";
import HeroSection from "./_components/HeroSection";
import DestinationsSection from "./_components/DestinationsSection";
import WhyChooseUs from "./_components/WhyChooseUs";
import TeamSection from "./_components/TeamSection";
import PopularTours from "./_components/PopularTours";
import Testimonials from "./_components/Testimonials";
import NewsletterSection from "./_components/NewsletterSection";
import Footer from "./_components/Footer";

export default function Index() {
  const [introComplete, setIntroComplete] = useState(false);
  return (
    <div>
      <AnimatePresence>{!introComplete && <VideoIntro onComplete={() => setIntroComplete(true)} />}</AnimatePresence>
      {introComplete && (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
          <Navbar />
          <HeroSection />
          <DestinationsSection />
          <WhyChooseUs />
          <PopularTours />
          <TeamSection />
          <Testimonials />
          <NewsletterSection />
          <Footer />
        </motion.main>
      )}
    </div>
  );
}
