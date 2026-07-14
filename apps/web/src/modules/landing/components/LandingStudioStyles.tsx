export default function LandingStudioStyles() {
  return (
    <style>{`
      html { scroll-behavior: smooth; }
      .landing-word span { display: inline-block; }
      .landing-reveal { opacity: 0; transform: translateY(28px); animation: landingReveal .72s cubic-bezier(.16,1,.3,1) forwards; animation-delay: var(--delay, 0ms); }
      .landing-marquee-track { animation: landingMarquee 24s linear infinite; }
      .landing-pulse-orb { animation: landingOrb 7s ease-in-out infinite; }
      .landing-float { animation: landingFloat 5.2s ease-in-out infinite; }
      .landing-float-delayed { animation: landingFloat 6.5s ease-in-out infinite; animation-delay: -1.3s; }
      .landing-grid-mask { mask-image: linear-gradient(to bottom, transparent, black 16%, black 82%, transparent); }
      .landing-loader-word { animation: landingLoaderWord .32s cubic-bezier(.16,1,.3,1) both; }
      .landing-loader-orb { animation: landingLoaderOrb 1.8s ease-in-out infinite; }
      @keyframes landingReveal { to { opacity: 1; transform: none; } }
      @keyframes landingMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      @keyframes landingOrb { 0%,100% { transform: scale(1); opacity:.34; } 50% { transform: scale(1.18); opacity:.62; } }
      @keyframes landingFloat { 0%,100% { transform: translate3d(0,0,0) rotate(0deg); } 50% { transform: translate3d(0,-16px,0) rotate(1deg); } }
      @keyframes landingLoaderWord { from { opacity: 0; transform: translateY(105%) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes landingLoaderOrb { 0%,100% { transform: scale(.85); opacity:.32; } 50% { transform: scale(1.12); opacity:.7; } }
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        .landing-reveal, .landing-marquee-track, .landing-pulse-orb, .landing-float, .landing-float-delayed, .landing-loader-word, .landing-loader-orb { animation: none !important; opacity: 1 !important; transform: none !important; }
      }
    `}</style>
  );
}
