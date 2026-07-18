import ArenaPreview from '../components/ArenaPreview';
import FinalCta from '../components/FinalCta';
import FloatingStudioNav from '../components/FloatingStudioNav';
import HorizontalFlow from '../components/HorizontalFlow';
import IntroSection from '../components/IntroSection';
import LandingFooter from '../components/LandingFooter';
import LandingHero from '../components/LandingHero';
import LandingStudioStyles from '../components/LandingStudioStyles';
import LandingTicker from '../components/LandingTicker';
import StickyFeatureCards from '../components/StickyFeatureCards';

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <LandingStudioStyles />

      <FloatingStudioNav />
      <LandingHero skipIntro />
      <LandingTicker />
      <IntroSection />
      <StickyFeatureCards />
      <HorizontalFlow />
      <ArenaPreview />
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
