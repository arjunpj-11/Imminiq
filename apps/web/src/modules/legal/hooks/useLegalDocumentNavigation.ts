import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useLegalDocumentNavigation(defaultBackPath = '/register') {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAreaRef = useRef<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState('s1');
  const [readPct, setReadPct] = useState(0);

  const handleBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || defaultBackPath, { replace: true });
  };

  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();

    const scrollArea = scrollAreaRef.current;
    const section = document.getElementById(id);
    if (!scrollArea || !section) return;

    const scrollAreaRect = scrollArea.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const top = sectionRect.top - scrollAreaRect.top + scrollArea.scrollTop - 24;

    scrollArea.scrollTo({ top, behavior: 'smooth' });
    window.history.replaceState(null, '', window.location.pathname);
    setActiveId(id);
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const onScroll = () => {
      const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
      if (scrollHeight <= 0) {
        setReadPct(0);
        return;
      }

      const pct = (scrollArea.scrollTop / scrollHeight) * 100;
      setReadPct(Math.min(Math.max(pct, 0), 100));
    };

    onScroll();
    scrollArea.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      scrollArea.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const sections = scrollArea.querySelectorAll('.pp-section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      {
        root: scrollArea,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return {
    activeId,
    readPct,
    scrollAreaRef,
    handleBack,
    handleTocClick,
  };
}
