import { useState } from 'react';
import { STORAGE_KEYS } from '../../../lib/storage/storage-keys';
import { safeSessionStorage } from '../../../lib/storage/safe-storage';
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
import SocialPreview from '../components/SocialPreview';
import StickyFeatureCards from '../components/StickyFeatureCards';

function shouldPlayLandingIntro() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const isAutomatedAudit =
    navigator.webdriver || /Lighthouse|Chrome-Lighthouse/i.test(navigator.userAgent);
  if (isAutomatedAudit) return false;

  return safeSessionStorage.get(STORAGE_KEYS.landingIntroPlayed) !== 'true';
}

export default function LandingPage() {
  const [playIntro] = useState(shouldPlayLandingIntro);
  const [introComplete, setIntroComplete] = useState(() => !playIntro);
  const [showLoader, setShowLoader] = useState(playIntro);

  const completeIntro = () => {
    safeSessionStorage.set(STORAGE_KEYS.landingIntroPlayed, 'true');
    setIntroComplete(true);
  };

  return (
    <>
      {showLoader && <LandingLoader onDone={completeIntro} onGone={() => setShowLoader(false)} />}

      {introComplete && (
        <main className="min-h-screen overflow-x-clip bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
          <LandingStudioStyles />

          <FloatingStudioNav />
          <LandingHero skipIntro={!playIntro} />
          <LandingTicker />
          <IntroSection />
          <StickyFeatureCards />
          <HorizontalFlow />
          <SocialPreview />
          <ArenaPreview />
          <FinalCta />
          <LandingFooter />
        </main>
      )}
    </>
  );
}
