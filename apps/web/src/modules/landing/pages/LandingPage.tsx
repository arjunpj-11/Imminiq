import { useState } from 'react';

import ArenaPreview from '../components/ArenaPreview';
import FinalCta from '../components/FinalCta';
import FloatingStudioNav from '../components/FloatingStudioNav';
import HorizontalFlow from '../components/HorizontalFlow';
import IntroSection from '../components/IntroSection';
import LandingFooter from '../components/LandingFooter';
import LandingHero from '../components/LandingHero';
import LandingLoader from '../components/LandingLoader';
import LandingStudioStyles from '../components/LandingStudioStyles';
import LandingTicker from '../components/LandingTicker';
import StickyFeatureCards from '../components/StickyFeatureCards';

declare global {
  interface Window {
    __introPlayed?: boolean;
  }
}
const getPlayed = () => !!window.__introPlayed;
const setPlayed = () => {
  window.__introPlayed = true;
};

export default function LandingPage() {
  const [alreadyPlayed] = useState(() => getPlayed());

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <LandingStudioStyles />

      {!alreadyPlayed && (
        <LandingLoader onGone={() => setPlayed()} />
      )}

      <FloatingStudioNav />
      <LandingHero skipIntro={alreadyPlayed} />
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
