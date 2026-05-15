import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getCitiesOfState,
  getCountries,
  getStatesOfCountry,
} from "@countrystatecity/countries-browser";
import type {
  ICity,
  ICountry,
  IState,
} from "@countrystatecity/countries-browser";
import Sidebar from "../../../components/layout/Sidebar";
import TopBar from "../../../components/layout/TopBar";
import AppFooter from "../../../components/layout/Footer";
import BottomNav from "../../../components/layout/BottomNav";
import HeapTile from "../../../components/layout/HeapTile";
import { useProfile } from "../../../hooks/users/useProfile";
import { useUpdateProfile } from "../../../hooks/users/useUpdateProfile";
import { useProfileStats } from "../../../hooks/users/useProfileStats";
import { useProfileBadges } from "../../../hooks/users/useProfileBadges";
import { usePublishedTrackers } from "../../../hooks/users/usePublishedTrackers";
import { useUploadAvatar } from "../../../hooks/users/useUploadAvatar";
import { useUploadBanner } from "../../../hooks/users/useUploadBanner";
import { useGenerateAiBannerPreview } from "../../../hooks/users/useGenerateAiBannerPreview";
import { useStreak } from "../../../hooks/progress/useStreak";
import { useRecentActivity } from "../../../hooks/activity/useRecentActivity";
import { usePublicProfile } from "../../../hooks/public/usePublicProfile";
import { useAuthStore } from "../../../store/useAuthStore";
import { useProfileStore } from "../../../store/useProfileStore";
import {
  dataUrlToFile,
  formatLocation,
  normalizeOptionalUrl,
  parseLocation,
} from "../utils/profile-data";
import type {
  ActivityFeedItem,
  ProfileBadge,
  PublishedTracker,
} from "../../../types/profile.types";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const themedScrollbar =
  "[scrollbar-width:thin] [scrollbar-color:rgba(184,76,43,0.28)_transparent] dark:[scrollbar-color:rgba(232,129,106,0.34)_transparent] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.28)] dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.34)] [&::-webkit-scrollbar-thumb:hover]:bg-[rgba(184,76,43,0.44)] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[rgba(232,129,106,0.52)]";

/* ─── Types ─── */
interface ProfileData {
  name: string;
  username: string;
  profession: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  postal: string;
  skills: string[];
  avatarUrl: string | null;
  bannerDataUrl: string | null;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

/* ─── Toast ─── */
type ToastTone = "info" | "loading" | "success" | "error";

function useToast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [tone, setTone] = useState<ToastTone>("info");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToastTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const show = useCallback(
    (msg: string, nextTone: ToastTone = "info", duration = 2400) => {
      clearToastTimer();
      setMessage(msg);
      setTone(nextTone);
      setVisible(true);

      if (nextTone !== "loading") {
        timer.current = setTimeout(() => setVisible(false), duration);
      }
    },
    [clearToastTimer],
  );

  const showLoading = useCallback(
    (msg: string) => {
      show(msg, "loading", 0);
    },
    [show],
  );

  const hide = useCallback(() => {
    clearToastTimer();
    setVisible(false);
  }, [clearToastTimer]);

  return { message, visible, tone, show, showLoading, hide };
}

/* ─── Frontend submit rate limiting / duplicate-submit guard ─── */
type SubmitActionKey = "profile-save" | "avatar-upload" | "banner-upload";

function useSubmitRateLimit(cooldownMs = 1800) {
  const lastRequestAt = useRef<Partial<Record<SubmitActionKey, number>>>({});
  const inFlight = useRef<Set<SubmitActionKey>>(new Set());

  const canStart = useCallback(
    (key: SubmitActionKey) => {
      const now = Date.now();
      const previous = lastRequestAt.current[key] ?? 0;

      if (inFlight.current.has(key) || now - previous < cooldownMs) {
        return false;
      }

      inFlight.current.add(key);
      lastRequestAt.current[key] = now;
      return true;
    },
    [cooldownMs],
  );

  const finish = useCallback((key: SubmitActionKey) => {
    inFlight.current.delete(key);
  }, []);

  return { canStart, finish };
}

function formatProfileLevel(level: number | undefined) {
  const safeLevel = Math.max(0, Number(level ?? 0));

  const title =
    safeLevel >= 30
      ? "Master"
      : safeLevel >= 20
        ? "Expert"
        : safeLevel >= 10
          ? "Adept"
          : safeLevel >= 5
            ? "Builder"
            : "Starter";

  return `Level ${safeLevel} · ${title}`;
}

/* ─── Stat Card ─── */
function StatCard({
  accent,
  label,
  children,
}: {
  accent: "rust" | "green" | "amber" | "blue";
  label: string;
  children: React.ReactNode;
}) {
  const accentColors = {
    rust: "from-[#e8816a] to-[#b84c2b]",
    green: "from-[#70d49a] to-[#4caf7d]",
    amber: "from-[#e8c060] to-[#c98000]",
    blue: "from-[#7aa4e8] to-[#3b6cb7]",
  };
  return (
    <div className="relative overflow-hidden bg-[#fdf8f5] dark:bg-[#1e1c19] border-[1.5px] border-[#e0d0c5] dark:border-white/[0.09] rounded-[16px] p-4 flex flex-col gap-2 shadow-[0_2px_16px_rgba(26,23,20,0.06)]">
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2.5px] rounded-t-[16px] bg-gradient-to-r",
          accentColors[accent],
        )}
      />
      <div className="font-['DM_Mono',monospace] text-[8px] tracking-[0.14em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-55 mt-0.5">
        {label}
      </div>
      {children}
    </div>
  );
}

/* ─── Badge item ─── */
type BadgeColor = "fire" | "green" | "amber" | "blue" | "locked";

interface Badge {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  color: BadgeColor;
  earned: boolean;
  tier: string;
  iconUrl?: string;
}

const badgeEmojiByType: Record<ProfileBadge["badgeType"], string> = {
  streak: "🔥",
  test: "🧠",
  tracker: "🏆",
  battle: "⚔️",
  community: "🌟",
};

const badgeColorByType: Record<ProfileBadge["badgeType"], BadgeColor> = {
  streak: "fire",
  test: "blue",
  tracker: "amber",
  battle: "green",
  community: "blue",
};

const badgeTierByType: Record<ProfileBadge["badgeType"], string> = {
  streak: "Streak",
  test: "Assessment",
  tracker: "Creator",
  battle: "Arena",
  community: "Community",
};

const badgeToneClasses: Record<
  BadgeColor,
  {
    tile: string;
    icon: string;
    aura: string;
    chip: string;
    dot: string;
    divider: string;
  }
> = {
  fire: {
    tile: "border-[rgba(184,76,43,0.28)] bg-[linear-gradient(145deg,rgba(184,76,43,0.16),rgba(255,248,240,0.86))] dark:border-[rgba(232,129,106,0.34)] dark:bg-[linear-gradient(145deg,rgba(232,129,106,0.18),rgba(30,28,25,0.94))]",
    icon: "border-[rgba(184,76,43,0.30)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,231,210,0.95),rgba(184,76,43,0.18))] dark:border-[rgba(232,129,106,0.38)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(255,196,176,0.30),rgba(232,129,106,0.12))]",
    aura: "bg-[radial-gradient(circle,rgba(184,76,43,0.30),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.34),transparent_68%)]",
    chip: "border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.10)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.34)] dark:bg-[rgba(232,129,106,0.14)] dark:text-[#f5a090]",
    dot: "bg-[#b84c2b] shadow-[0_0_10px_rgba(184,76,43,0.75)] dark:bg-[#e8816a] dark:shadow-[0_0_12px_rgba(232,129,106,0.72)]",
    divider:
      "from-transparent via-[rgba(184,76,43,0.42)] to-transparent dark:via-[rgba(232,129,106,0.46)]",
  },
  green: {
    tile: "border-[rgba(45,106,71,0.26)] bg-[linear-gradient(145deg,rgba(45,106,71,0.14),rgba(246,252,248,0.90))] dark:border-[rgba(92,201,138,0.34)] dark:bg-[linear-gradient(145deg,rgba(92,201,138,0.16),rgba(30,28,25,0.94))]",
    icon: "border-[rgba(45,106,71,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(215,255,231,0.92),rgba(45,106,71,0.15))] dark:border-[rgba(92,201,138,0.38)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(171,255,208,0.24),rgba(92,201,138,0.10))]",
    aura: "bg-[radial-gradient(circle,rgba(45,106,71,0.24),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(92,201,138,0.30),transparent_68%)]",
    chip: "border-[rgba(45,106,71,0.24)] bg-[rgba(45,106,71,0.10)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.34)] dark:bg-[rgba(92,201,138,0.14)] dark:text-[#7fe1a7]",
    dot: "bg-[#4caf7d] shadow-[0_0_10px_rgba(76,175,125,0.68)] dark:bg-[#5cc98a] dark:shadow-[0_0_12px_rgba(92,201,138,0.72)]",
    divider:
      "from-transparent via-[rgba(45,106,71,0.40)] to-transparent dark:via-[rgba(92,201,138,0.46)]",
  },
  amber: {
    tile: "border-[rgba(138,98,0,0.26)] bg-[linear-gradient(145deg,rgba(138,98,0,0.14),rgba(255,251,241,0.90))] dark:border-[rgba(240,168,66,0.36)] dark:bg-[linear-gradient(145deg,rgba(240,168,66,0.16),rgba(30,28,25,0.94))]",
    icon: "border-[rgba(138,98,0,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,243,200,0.96),rgba(138,98,0,0.15))] dark:border-[rgba(240,168,66,0.40)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(255,224,146,0.24),rgba(240,168,66,0.10))]",
    aura: "bg-[radial-gradient(circle,rgba(201,128,0,0.28),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(240,168,66,0.32),transparent_68%)]",
    chip: "border-[rgba(138,98,0,0.24)] bg-[rgba(138,98,0,0.10)] text-[#8a6200] dark:border-[rgba(240,168,66,0.36)] dark:bg-[rgba(240,168,66,0.14)] dark:text-[#f0bf67]",
    dot: "bg-[#c98000] shadow-[0_0_10px_rgba(201,128,0,0.68)] dark:bg-[#f0a842] dark:shadow-[0_0_12px_rgba(240,168,66,0.72)]",
    divider:
      "from-transparent via-[rgba(138,98,0,0.40)] to-transparent dark:via-[rgba(240,168,66,0.48)]",
  },
  blue: {
    tile: "border-[rgba(59,108,183,0.28)] bg-[linear-gradient(145deg,rgba(59,108,183,0.14),rgba(246,250,255,0.90))] dark:border-[rgba(107,159,232,0.36)] dark:bg-[linear-gradient(145deg,rgba(107,159,232,0.16),rgba(30,28,25,0.94))]",
    icon: "border-[rgba(59,108,183,0.30)] bg-[radial-gradient(circle_at_30%_25%,rgba(220,235,255,0.96),rgba(59,108,183,0.15))] dark:border-[rgba(107,159,232,0.40)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(188,219,255,0.24),rgba(107,159,232,0.10))]",
    aura: "bg-[radial-gradient(circle,rgba(59,108,183,0.28),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(107,159,232,0.32),transparent_68%)]",
    chip: "border-[rgba(59,108,183,0.24)] bg-[rgba(59,108,183,0.10)] text-[#3b6cb7] dark:border-[rgba(107,159,232,0.36)] dark:bg-[rgba(107,159,232,0.14)] dark:text-[#8ab8f4]",
    dot: "bg-[#3b6cb7] shadow-[0_0_10px_rgba(59,108,183,0.68)] dark:bg-[#6b9fe8] dark:shadow-[0_0_12px_rgba(107,159,232,0.72)]",
    divider:
      "from-transparent via-[rgba(59,108,183,0.42)] to-transparent dark:via-[rgba(107,159,232,0.48)]",
  },
  locked: {
    tile: "border-[#e0d0c5] bg-[linear-gradient(145deg,rgba(26,23,20,0.06),rgba(253,248,245,0.84))] opacity-65 grayscale dark:border-white/[0.09] dark:bg-[linear-gradient(145deg,rgba(242,240,235,0.06),rgba(30,28,25,0.92))]",
    icon: "border-[#e0d0c5] bg-[rgba(26,23,20,0.06)] dark:border-white/[0.09] dark:bg-[rgba(242,240,235,0.08)]",
    aura: "bg-[radial-gradient(circle,rgba(26,23,20,0.10),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(242,240,235,0.10),transparent_68%)]",
    chip: "border-[#e0d0c5] bg-[rgba(26,23,20,0.05)] text-[#6b5f58] dark:border-white/[0.09] dark:bg-[rgba(242,240,235,0.08)] dark:text-[#9b9a92]",
    dot: "",
    divider:
      "from-transparent via-[rgba(26,23,20,0.18)] to-transparent dark:via-[rgba(242,240,235,0.16)]",
  },
};

/* ─── Edit Panel ─── */
interface EditPanelProps {
  profile: ProfileData;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProfileData>) => void | Promise<void>;
  isSaving?: boolean;
}

function EditPanel({
  profile,
  open,
  onClose,
  onSave,
  isSaving = false,
}: EditPanelProps) {
  const [name, setName] = useState(profile.name);
  const [profession, setProfession] = useState(profile.profession);
  const [bio, setBio] = useState(profile.bio);
  const [country, setCountry] = useState(profile.country);
  const [state, setState] = useState(profile.state);
  const [city, setCity] = useState(profile.city);
  const [postal, setPostal] = useState(profile.postal);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [locationLoading, setLocationLoading] = useState({
    countries: true,
    states: Boolean(profile.country),
    cities: Boolean(profile.country && profile.state),
  });
  const [locationError, setLocationError] = useState("");
  const [skills, setSkills] = useState([...profile.skills]);
  const [skillInput, setSkillInput] = useState("");
  const [github, setGithub] = useState(profile.githubUrl);
  const [linkedin, setLinkedin] = useState(profile.linkedinUrl);
  const [portfolio, setPortfolio] = useState(profile.portfolioUrl);
  const [openTo, setOpenTo] = useState({
    collaboration: true,
    mockInterviews: false,
    trackerSharing: true,
    mentoring: false,
  });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getCountries()
      .then((loadedCountries) => {
        if (cancelled) return;
        setCountries(loadedCountries);

        const matchedCountry = loadedCountries.find(
          (item) =>
            item.name === profile.country || item.iso2 === profile.country,
        );
        setCountryCode(matchedCountry?.iso2 ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setCountries([]);
        setCountryCode("");
        setLocationError("Unable to load live location data right now.");
      })
      .finally(() => {
        if (!cancelled)
          setLocationLoading((current) => ({ ...current, countries: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [open, profile.country]);

  useEffect(() => {
    if (!open || !countryCode) return;

    let cancelled = false;

    getStatesOfCountry(countryCode)
      .then((loadedStates) => {
        if (cancelled) return;
        setStates(loadedStates);

        const canRestoreState = country === profile.country;
        const matchedState = canRestoreState
          ? loadedStates.find(
              (item) =>
                item.name === profile.state || item.iso2 === profile.state,
            )
          : undefined;
        setStateCode(matchedState?.iso2 ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setStates([]);
        setStateCode("");
        setLocationError("Unable to load states for the selected country.");
      })
      .finally(() => {
        if (!cancelled)
          setLocationLoading((current) => ({ ...current, states: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [open, countryCode, country, profile.country, profile.state]);

  useEffect(() => {
    if (!open || !countryCode || !stateCode) return;

    let cancelled = false;

    getCitiesOfState(countryCode, stateCode)
      .then((loadedCities) => {
        if (cancelled) return;
        setCities(loadedCities);
      })
      .catch(() => {
        if (cancelled) return;
        setCities([]);
        setLocationError("Unable to load cities for the selected state.");
      })
      .finally(() => {
        if (!cancelled)
          setLocationLoading((current) => ({ ...current, cities: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [open, countryCode, stateCode]);

  const inputCls =
    'w-full px-[13px] py-2.5 border-[1.5px] border-[#e0d0c5] dark:border-white/[0.09] rounded-[9px] bg-white dark:bg-[#252320] text-[#1a1714] dark:text-[#f2f0eb] text-[13.5px] font-["DM_Sans",sans-serif] outline-none transition focus:border-[#b84c2b] dark:focus:border-[#e8816a] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] placeholder:text-[#9f8f86] dark:placeholder:text-[#7a756e]';
  const labelCls =
    'font-["DM_Mono",monospace] text-[8px] tracking-[0.13em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-70 mb-[5px] block';

  const handleSkillKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = skillInput.trim().replace(/,$/, "");
      if (v && !skills.includes(v)) setSkills([...skills, v]);
      setSkillInput("");
    } else if (e.key === "Backspace" && skillInput === "" && skills.length) {
      setSkills(skills.slice(0, -1));
    }
  };

  const handleCountryChange = (nextCountryCode: string) => {
    const selectedCountry = countries.find(
      (item) => item.iso2 === nextCountryCode,
    );
    setCountryCode(nextCountryCode);
    setCountry(selectedCountry?.name ?? "");
    setStateCode("");
    setState("");
    setCity("");
    setStates([]);
    setCities([]);
    setLocationError("");
    setLocationLoading((current) => ({
      ...current,
      states: Boolean(nextCountryCode),
      cities: false,
    }));
  };

  const handleStateChange = (nextStateCode: string) => {
    const selectedState = states.find((item) => item.iso2 === nextStateCode);
    setStateCode(nextStateCode);
    setState(selectedState?.name ?? "");
    setCity("");
    setCities([]);
    setLocationError("");
    setLocationLoading((current) => ({
      ...current,
      cities: Boolean(countryCode && nextStateCode),
    }));
  };

  const handleSave = async () => {
    try {
      await onSave({
        name,
        profession,
        bio,
        country,
        state,
        city,
        postal,
        skills,
        githubUrl: github,
        linkedinUrl: linkedin,
        portfolioUrl: portfolio,
      });
    } catch {
      // Parent save handler already handles toast + panel state.
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-[rgba(26,23,20,0.55)] dark:bg-[rgba(0,0,0,0.70)] backdrop-blur transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[101] w-[min(520px,100vw)] bg-[#fdf8f5] dark:bg-[#1e1c19] border-l border-[#e0d0c5] dark:border-white/[0.09] shadow-[-8px_0_48px_rgba(26,23,20,0.14)] flex flex-col overflow-hidden transition-transform duration-[360ms] ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Head */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-[22px] py-[18px] border-b border-[#e0d0c5] dark:border-white/[0.09] bg-[#fdf8f5] dark:bg-[#1e1c19]">
          <span className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb] tracking-[-0.4px]">
            Edit Profile
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-[34px] h-[34px] rounded-[9px] border-[1.5px] border-[#e0d0c5] dark:border-white/[0.09] flex items-center justify-center text-[#6b5f58] dark:text-[#9b9a92] hover:border-[#e8816a] hover:text-[#b84c2b] hover:bg-[rgba(184,76,43,0.08)] transition"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className={cn(
            "flex-1 overflow-y-auto px-[22px] py-6 flex flex-col gap-[22px]",
            themedScrollbar,
          )}
        >
          {/* Basic Info */}
          <div>
            <div className="font-['DM_Mono',monospace] text-[8px] tracking-[0.18em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-55 pb-2.5 border-b border-[#e0d0c5] dark:border-white/[0.09] mb-3.5">
              Basic Information
            </div>
            <div className="grid grid-cols-2 gap-[13px]">
              <div className="flex flex-col">
                <label className={labelCls}>Full Name</label>
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>Profession</label>
                <input
                  className={inputCls}
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Your role"
                />
              </div>
              <div className="col-span-2 flex flex-col">
                <label className={labelCls}>Bio</label>
                <textarea
                  className={cn(
                    inputCls,
                    "resize-y min-h-[80px] leading-[1.6]",
                  )}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="mb-3.5 border-b border-[#e0d0c5] pb-2.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.18em] text-[#6b5f58] opacity-55 dark:border-white/[0.09] dark:text-[#9b9a92]">
              Location
            </div>
            <div className="grid grid-cols-2 gap-[13px] max-[640px]:grid-cols-1">
              <div className="flex flex-col">
                <label className={labelCls}>Country</label>
                <select
                  className={inputCls}
                  value={countryCode}
                  onChange={(event) => handleCountryChange(event.target.value)}
                  disabled={locationLoading.countries}
                >
                  <option value="">
                    {locationLoading.countries
                      ? "Loading countries…"
                      : "Select country"}
                  </option>
                  {countries.map((item) => (
                    <option key={item.iso2} value={item.iso2}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>State / Province</label>
                <select
                  className={inputCls}
                  value={stateCode}
                  onChange={(event) => handleStateChange(event.target.value)}
                  disabled={!countryCode || locationLoading.states}
                >
                  <option value="">
                    {locationLoading.states
                      ? "Loading states…"
                      : "Select state"}
                  </option>
                  {states.map((item) => (
                    <option
                      key={`${countryCode}-${item.iso2}-${item.name}`}
                      value={item.iso2}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>City</label>
                <select
                  className={inputCls}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  disabled={!stateCode || locationLoading.cities}
                >
                  <option value="">
                    {locationLoading.cities ? "Loading cities…" : "Select city"}
                  </option>
                  {cities.map((item) => (
                    <option key={`${item.id}-${item.name}`} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>PIN Code</label>
                <input
                  className={inputCls}
                  value={postal}
                  onChange={(event) => setPostal(event.target.value)}
                  placeholder="682001"
                />
              </div>
            </div>
            {locationError && (
              <p className="mt-2 text-[11px] font-medium text-[#b84c2b] dark:text-[#e8816a]">
                {locationError}
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <div className="font-['DM_Mono',monospace] text-[8px] tracking-[0.18em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-55 pb-2.5 border-b border-[#e0d0c5] dark:border-white/[0.09] mb-3.5">
              Skills
            </div>
            <div
              className="min-h-[46px] flex flex-wrap gap-1.5 items-center px-2.5 py-2 border-[1.5px] border-[#e0d0c5] dark:border-white/[0.09] rounded-[9px] bg-white dark:bg-[#252320] cursor-text focus-within:border-[#b84c2b] dark:focus-within:border-[#e8816a] focus-within:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] transition"
              onClick={() => document.getElementById("skill-input")?.focus()}
            >
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-[5px] px-2.5 py-[3px] rounded-full bg-[rgba(184,76,43,0.07)] dark:bg-[rgba(232,129,106,0.09)] border border-[rgba(184,76,43,0.18)] dark:border-[rgba(232,129,106,0.22)] text-[12px] font-medium text-[#1a1714] dark:text-[#f2f0eb] whitespace-nowrap"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, j) => j !== i))}
                    className="text-[#6b5f58] dark:text-[#9b9a92] hover:text-[#b84c2b] transition text-[14px] leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="skill-input"
                className="border-none bg-transparent outline-none text-[12.5px] font-['DM_Sans',sans-serif] text-[#1a1714] dark:text-[#f2f0eb] min-w-[90px] flex-1 placeholder:text-[#9f8f86] dark:placeholder:text-[#7a756e]"
                placeholder="+ Add skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeydown}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#6b5f58] dark:text-[#9b9a92] opacity-60">
              Press Enter or comma to add
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="mb-3.5 border-b border-[#e0d0c5] pb-2.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.18em] text-[#6b5f58] opacity-55 dark:border-white/[0.09] dark:text-[#9b9a92]">
              Links
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                {
                  value: github,
                  setter: setGithub,
                  placeholder: "github.com/username",
                  icon: "github",
                },
                {
                  value: linkedin,
                  setter: setLinkedin,
                  placeholder: "linkedin.com/in/username",
                  icon: "linkedin",
                },
                {
                  value: portfolio,
                  setter: setPortfolio,
                  placeholder: "yourportfolio.com",
                  icon: "portfolio",
                },
              ].map((item) => (
                <label
                  key={item.icon}
                  className="flex items-center gap-2.5 rounded-[9px] border-[1.5px] border-[#e0d0c5] bg-white px-3 py-2.5 text-[#6b5f58] transition focus-within:border-[#b84c2b] focus-within:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/[0.09] dark:bg-[#252320] dark:text-[#9b9a92] dark:focus-within:border-[#e8816a]"
                >
                  {item.icon === "github" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  ) : item.icon === "linkedin" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  )}
                  <input
                    type="url"
                    value={item.value}
                    onChange={(event) => item.setter(event.target.value)}
                    placeholder={item.placeholder}
                    className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[#1a1714] outline-none placeholder:text-[#9f8f86] dark:text-[#f2f0eb] dark:placeholder:text-[#7a756e]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Open To */}
          <div>
            <div className="mb-3.5 border-b border-[#e0d0c5] pb-2.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.18em] text-[#6b5f58] opacity-55 dark:border-white/[0.09] dark:text-[#9b9a92]">
              Open To
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["collaboration", "Collaboration"],
                ["mockInterviews", "Mock Interviews"],
                ["trackerSharing", "Tracker Sharing"],
                ["mentoring", "Mentoring"],
              ].map(([key, label]) => {
                const active = openTo[key as keyof typeof openTo];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setOpenTo((current) => ({ ...current, [key]: !active }))
                    }
                    className={cn(
                      "rounded-full border-[1.5px] px-3.5 py-2 text-[12px] font-semibold transition",
                      active
                        ? "border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.10)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.26)] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]"
                        : "border-[#e0d0c5] bg-transparent text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/[0.09] dark:text-[#9b9a92]",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-[22px] py-4 border-t border-[#e0d0c5] dark:border-white/[0.09] bg-[#fdf8f5] dark:bg-[#1e1c19]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] dark:border-white/[0.09] text-[13px] font-semibold text-[#6b5f58] dark:text-[#9b9a92] hover:border-[#e8816a] hover:text-[#b84c2b] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-[22px] py-2.5 rounded-[10px] bg-[#b84c2b] dark:bg-[#e8816a] text-[#fdf8f5] dark:text-[#141412] text-[13px] font-bold transition hover:-translate-y-px hover:bg-[#963d22] dark:hover:bg-[#d4705a] hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Cover Banner Modal ─── */
interface BannerModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void | Promise<void>;
  onToast: (message: string) => void;
}

type BannerTab = "defaults" | "upload" | "ai";

const bannerPresets = [
  {
    name: "Scholar Rust",
    palette: "from-[#0e0c0a] via-[#6f2d1b] to-[#b84c2b]",
    dataUrl: svgBannerDataUrl("#0e0c0a", "#6f2d1b", "#b84c2b"),
  },
  {
    name: "Midnight Blue",
    palette: "from-[#07111f] via-[#17315c] to-[#3b6cb7]",
    dataUrl: svgBannerDataUrl("#07111f", "#17315c", "#3b6cb7"),
  },
  {
    name: "Forest Mentor",
    palette: "from-[#07150f] via-[#16452e] to-[#4caf7d]",
    dataUrl: svgBannerDataUrl("#07150f", "#16452e", "#4caf7d"),
  },
  {
    name: "Amber Prestige",
    palette: "from-[#171005] via-[#634200] to-[#c98000]",
    dataUrl: svgBannerDataUrl("#171005", "#634200", "#c98000"),
  },
];

const defaultCustomBannerColors = {
  start: "#120d0b",
  mid: "#8c3f29",
  end: "#e8816a",
};

function svgBannerDataUrl(start: string, mid: string, end: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="400" viewBox="0 0 1600 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}"/>
          <stop offset="55%" stop-color="${mid}"/>
          <stop offset="100%" stop-color="${end}"/>
        </linearGradient>
        <radialGradient id="r" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.32)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="1600" height="400" fill="url(#g)"/>
      <rect width="1600" height="400" fill="url(#grid)" opacity="0.6"/>
      <circle cx="800" cy="170" r="270" fill="url(#r)"/>
    </svg>
  `;

  const encodedBytes = new TextEncoder().encode(svg);
  let binary = "";

  encodedBytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

function BannerModal({ open, onClose, onApply, onToast }: BannerModalProps) {
  const generateAiBannerPreviewMutation = useGenerateAiBannerPreview();
  const [tab, setTab] = useState<BannerTab>("defaults");
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeImageSource, setActiveImageSource] = useState<
    "upload" | "ai" | null
  >(null);
  const [selectedPreset, setSelectedPreset] = useState(
    bannerPresets[0].dataUrl,
  );
  const [customSelected, setCustomSelected] = useState(false);
  const [customBannerColors, setCustomBannerColors] = useState(
    defaultCustomBannerColors,
  );
  const customBannerDataUrl = useMemo(
    () =>
      svgBannerDataUrl(
        customBannerColors.start,
        customBannerColors.mid,
        customBannerColors.end,
      ),
    [customBannerColors],
  );
  const selectedBannerDataUrl = customSelected
    ? customBannerDataUrl
    : selectedPreset;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      onToast("File too large — max 8MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      setImageSrc(result);
      setActiveImageSource("upload");
      setOffset({ x: 0, y: 0 });
      setScale(1);
      setCustomSelected(false);
      setTab("upload");
      const img = new Image();
      img.src = result;
      img.onload = () => {
        imageRef.current = img;
      };
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleGenerateAiBanner = async () => {
    const cleanedPrompt = aiPrompt.trim();

    if (cleanedPrompt.length < 5) {
      onToast("Write at least 5 characters for the banner prompt.");
      return;
    }

    try {
      const response = await generateAiBannerPreviewMutation.mutateAsync({
        prompt: cleanedPrompt,
      });

      const generatedImageUrl = response.data?.imageUrl;

      if (!generatedImageUrl) {
        onToast("AI banner generation returned no image. Please try again.");
        return;
      }

      setImageSrc(generatedImageUrl);
      setActiveImageSource("ai");
      setOffset({ x: 0, y: 0 });
      setScale(1);
      setCustomSelected(false);

      const image = new Image();
      image.src = generatedImageUrl;
      image.onload = () => {
        imageRef.current = image;
      };

      onToast("AI banner generated. Adjust the crop and apply it.");
    } catch {
      onToast("Unable to generate AI banner. Please try again.");
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageSrc) return;
    setDragging(true);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.ox + (event.clientX - dragStart.x),
      y: dragStart.oy + (event.clientY - dragStart.y),
    });
  };

  const handlePointerUp = () => setDragging(false);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!imageSrc) return;
    event.preventDefault();
    setScale((current) =>
      Math.min(
        4,
        Math.max(
          1,
          Number((current + (event.deltaY < 0 ? 0.08 : -0.08)).toFixed(2)),
        ),
      ),
    );
  };

  const applyUploadedBanner = async () => {
    if (!imageSrc || !previewRef.current) {
      onToast(
        tab === "ai"
          ? "Generate an AI banner first"
          : "Upload a banner image first",
      );
      return;
    }

    const image = imageRef.current ?? (await loadImage(imageSrc));
    const width = 1600;
    const height = 400;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const preview = previewRef.current.getBoundingClientRect();
    const fitScale = Math.max(
      width / image.naturalWidth,
      height / image.naturalHeight,
    );
    const renderScale = fitScale * scale;
    const drawWidth = image.naturalWidth * renderScale;
    const drawHeight = image.naturalHeight * renderScale;
    const ratioX = width / Math.max(preview.width, 1);
    const ratioY = height / Math.max(preview.height, 1);
    const drawX = (width - drawWidth) / 2 + offset.x * ratioX;
    const drawY = (height - drawHeight) / 2 + offset.y * ratioY;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    await onApply(canvas.toDataURL("image/png"));
  };

  return (
    <div
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      className={cn(
        "fixed inset-0 z-140 flex items-center justify-center bg-[rgba(26,23,20,0.72)] p-4 backdrop-blur-sm transition",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="w-[min(860px,100%)] overflow-hidden rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_20px_70px_rgba(0,0,0,0.32)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="flex items-center justify-between border-b border-[#e0d0c5] px-6 py-5 dark:border-white/9">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
              Change Cover Banner
            </h2>
            <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
              Choose a template, upload your own image, or preview an AI option.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-[#e0d0c5] text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="border-b border-[#e0d0c5] px-6 pt-4 dark:border-white/9">
          <div className="flex flex-wrap gap-2">
            {(["defaults", "upload", "ai"] as BannerTab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn(
                  "rounded-t-[10px] border border-b-0 px-4 py-2.5 text-[12px] font-semibold capitalize transition",
                  tab === item
                    ? "border-[#e0d0c5] bg-[#f5ede4] text-[#b84c2b] dark:border-white/9 dark:bg-[#252320] dark:text-[#e8816a]"
                    : "border-transparent text-[#6b5f58] hover:text-[#b84c2b] dark:text-[#9b9a92]",
                )}
              >
                {item === "ai" ? "AI Generate" : item}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn("max-h-[70vh] overflow-y-auto p-6", themedScrollbar)}
        >
          {tab === "defaults" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                {bannerPresets.map((preset) => {
                  const active =
                    !customSelected && selectedPreset === preset.dataUrl;

                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setCustomSelected(false);
                        setSelectedPreset(preset.dataUrl);
                      }}
                      className={cn(
                        "overflow-hidden rounded-2xl border-2 text-left transition",
                        active
                          ? "border-[#b84c2b] shadow-[0_0_0_4px_rgba(184,76,43,0.14)] dark:border-[#e8816a]"
                          : "border-[#e0d0c5] hover:border-[#e8816a] dark:border-white/9",
                      )}
                    >
                      <div
                        className={cn(
                          "aspect-4/1 bg-linear-to-br",
                          preset.palette,
                        )}
                      />
                      <div className="flex items-center justify-between px-3.5 py-3 text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                        {preset.name}
                        {active && (
                          <span className="rounded-full bg-[#b84c2b] px-2 py-0.5 text-[10px] font-bold text-white dark:bg-[#e8816a] dark:text-[#141412]">
                            Selected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-white/70 p-4 dark:border-white/9 dark:bg-[#252320]/70">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.18em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
                      Custom Banner
                    </div>
                    <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                      Build your own gradient
                    </div>
                  </div>

                  {customSelected && (
                    <span className="rounded-full bg-[#b84c2b] px-2.5 py-1 text-[10px] font-bold text-white dark:bg-[#e8816a] dark:text-[#141412]">
                      Selected
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCustomSelected(true)}
                  className={cn(
                    "relative mb-4 block w-full overflow-hidden rounded-2xl border-2 transition",
                    customSelected
                      ? "border-[#b84c2b] shadow-[0_0_0_4px_rgba(184,76,43,0.14)] dark:border-[#e8816a]"
                      : "border-[#e0d0c5] hover:border-[#e8816a] dark:border-white/9",
                  )}
                >
                  <img
                    src={customBannerDataUrl}
                    alt="Custom banner preview"
                    className="aspect-4/1 h-auto w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.16),rgba(255,255,255,0.02))]" />
                </button>

                <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
                  {[
                    {
                      key: "start",
                      label: "Start",
                    },
                    {
                      key: "mid",
                      label: "Middle",
                    },
                    {
                      key: "end",
                      label: "End",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex flex-col gap-2 rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] p-3 dark:border-white/9 dark:bg-[#1e1c19]"
                    >
                      <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
                        {item.label} Color
                      </span>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            customBannerColors[
                              item.key as keyof typeof customBannerColors
                            ]
                          }
                          onChange={(event) => {
                            setCustomBannerColors((current) => ({
                              ...current,
                              [item.key]: event.target.value,
                            }));
                            setCustomSelected(true);
                          }}
                          className="h-9 w-12 cursor-pointer rounded-lg border border-[#e0d0c5] bg-transparent p-1 dark:border-white/9"
                        />

                        <span className="truncate font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.06em] text-[#6b5f58] dark:text-[#9b9a92]">
                          {
                            customBannerColors[
                              item.key as keyof typeof customBannerColors
                            ]
                          }
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "upload" && (
            <div className="flex flex-col gap-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-[#e0d0c5] bg-white/65 px-6 py-8 text-center transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.04)] dark:border-white/12 dark:bg-[#252320]/55">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-[#b84c2b] dark:text-[#e8816a]"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-[14px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                  Upload a cover image
                </span>
                <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
                  PNG or JPG, up to 8MB. Drag inside the crop frame and scroll
                  to zoom.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>

              {imageSrc && (
                <>
                  <div
                    ref={previewRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onWheel={handleWheel}
                    className={cn(
                      "relative aspect-4/1 touch-none overflow-hidden rounded-2xl border-2 border-[#b84c2b] bg-[#0e0c0a] dark:border-[#e8816a]",
                      dragging && "cursor-grabbing",
                    )}
                  >
                    <img
                      src={imageSrc}
                      alt="Banner crop preview"
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transformOrigin: "center center",
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 border border-white/20" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Zoom
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.01"
                      value={scale}
                      onChange={(event) => setScale(Number(event.target.value))}
                      className="w-full accent-[#b84c2b] dark:accent-[#e8816a]"
                    />
                    <span className="w-12 text-right font-['DM_Mono',monospace] text-[10px] text-[#b84c2b] dark:text-[#e8816a]">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "ai" && (
            <div className="flex flex-col gap-5">
              <div className="rounded-[18px] border-[1.5px] border-[rgba(99,65,168,0.24)] bg-[linear-gradient(135deg,rgba(99,65,168,0.12),rgba(59,108,183,0.10))] p-5">
                <div className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-[#6b9fe8]"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate a custom AI cover banner
                </div>

                <p className="mb-4 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                  Describe the banner mood, scene, or theme. Imminiq will generate
                  a preview, then you can drag and zoom it before applying.
                </p>

                <label className="mb-3 block">
                  <span className="mb-2 block font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.16em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
                    Banner Prompt
                  </span>
                  <textarea
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    placeholder="A premium dark developer workspace with subtle neon green lighting, elegant depth, cinematic composition..."
                    rows={4}
                    maxLength={500}
                    className="min-h-26 w-full resize-y rounded-xl border-[1.5px] border-[rgba(99,65,168,0.26)] bg-white/85 px-3.5 py-3 text-[13px] leading-[1.6] text-[#1a1714] outline-none transition placeholder:text-[#9f8f86] focus:border-[#6341a8] focus:shadow-[0_0_0_3px_rgba(99,65,168,0.14)] dark:bg-[#252320]/85 dark:text-[#f2f0eb] dark:placeholder:text-[#7a756e]"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
                    {aiPrompt.trim().length}/500 characters
                  </span>

                  <button
                    type="button"
                    onClick={handleGenerateAiBanner}
                    disabled={generateAiBannerPreviewMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#6341a8,#3b6cb7)] px-4 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:opacity-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                  >
                    {generateAiBannerPreviewMutation.isPending ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                        Generating...
                      </>
                    ) : (
                      "Generate Banner"
                    )}
                  </button>
                </div>
              </div>

              {activeImageSource === "ai" && imageSrc && (
                <>
                  <div
                    ref={previewRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onWheel={handleWheel}
                    className={cn(
                      "relative aspect-4/1 touch-none overflow-hidden rounded-2xl border-2 border-[#6341a8] bg-[#0e0c0a] dark:border-[#6b9fe8]",
                      dragging && "cursor-grabbing",
                    )}
                  >
                    <img
                      src={imageSrc}
                      alt="AI banner crop preview"
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transformOrigin: "center center",
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 border border-white/20" />
                    <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                      AI preview · drag to reposition
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Zoom
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.01"
                      value={scale}
                      onChange={(event) => setScale(Number(event.target.value))}
                      className="w-full accent-[#6341a8] dark:accent-[#6b9fe8]"
                    />
                    <span className="w-12 text-right font-['DM_Mono',monospace] text-[10px] text-[#6341a8] dark:text-[#6b9fe8]">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#e0d0c5] px-6 py-4 dark:border-white/9">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-5 py-2.5 text-[13px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]"
          >
            Cancel
          </button>
          {tab === "defaults" ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  const pngBannerDataUrl =
                    await bannerDataUrlToPng(selectedBannerDataUrl);

                  await onApply(pngBannerDataUrl);
                } catch {
                  onToast("Unable to prepare this banner. Please try again.");
                }
              }}
              className="rounded-[10px] bg-[#b84c2b] px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
            >
              Apply Selected
            </button>
          ) : tab === "upload" ? (
            <button
              type="button"
              onClick={applyUploadedBanner}
              disabled={activeImageSource !== "upload" || !imageSrc}
              className="rounded-[10px] bg-[#b84c2b] px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
            >
              {activeImageSource === "upload" && imageSrc
                ? "Apply Banner"
                : "Upload First"}
            </button>
          ) : (
            <button
              type="button"
              onClick={applyUploadedBanner}
              disabled={activeImageSource !== "ai" || !imageSrc}
              className="rounded-[10px] bg-[#6341a8] px-5.5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#543591] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:bg-[#6b9fe8] dark:text-[#141412] dark:hover:bg-[#5c8fd7]"
            >
              {activeImageSource === "ai" && imageSrc
                ? "Apply AI Banner"
                : "Generate First"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Avatar Crop Modal ─── */
interface AvatarCropModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void | Promise<void>;
  onToast: (message: string) => void;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = src;
  });
}

async function bannerDataUrlToPng(dataUrl: string) {
  const image = await loadImage(dataUrl);
  const width = 1600;
  const height = 400;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not prepare banner canvas");
  }

  ctx.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/png");
}

const AVATAR_INITIAL_ZOOM = 0.8;
const AVATAR_MIN_ZOOM = 0.6;
const AVATAR_MAX_ZOOM = 4;

function AvatarCropModal({
  open,
  onClose,
  onApply,
  onToast,
}: AvatarCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(AVATAR_INITIAL_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onToast("File too large — max 5MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      setImageSrc(result);
      setScale(AVATAR_INITIAL_ZOOM);
      setOffset({ x: 0, y: 0 });
      const img = new Image();
      img.src = result;
      img.onload = () => {
        imageRef.current = img;
      };
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageSrc) return;
    setDragging(true);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.ox + (event.clientX - dragStart.x),
      y: dragStart.oy + (event.clientY - dragStart.y),
    });
  };

  const handlePointerUp = () => setDragging(false);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!imageSrc) return;
    event.preventDefault();
    setScale((current) =>
      Math.min(
        AVATAR_MAX_ZOOM,
        Math.max(
          AVATAR_MIN_ZOOM,
          Number((current + (event.deltaY < 0 ? 0.08 : -0.08)).toFixed(2)),
        ),
      ),
    );
  };

  const applyAvatar = async () => {
    if (!imageSrc || !previewRef.current) {
      onToast("Upload a profile image first");
      return;
    }

    const image = imageRef.current ?? (await loadImage(imageSrc));
    const size = 640;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const preview = previewRef.current.getBoundingClientRect();
    const fitScale = Math.max(
      size / image.naturalWidth,
      size / image.naturalHeight,
    );
    const renderScale = fitScale * scale;
    const drawWidth = image.naturalWidth * renderScale;
    const drawHeight = image.naturalHeight * renderScale;
    const ratioX = size / Math.max(preview.width, 1);
    const ratioY = size / Math.max(preview.height, 1);
    const drawX = (size - drawWidth) / 2 + offset.x * ratioX;
    const drawY = (size - drawHeight) / 2 + offset.y * ratioY;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    await onApply(canvas.toDataURL("image/png"));
  };

  return (
    <div
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      className={cn(
        "fixed inset-0 z-150 flex items-center justify-center bg-[rgba(26,23,20,0.72)] p-4 backdrop-blur-sm transition",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="w-[min(620px,100%)] overflow-hidden rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_20px_70px_rgba(0,0,0,0.32)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="flex items-center justify-between border-b border-[#e0d0c5] px-6 py-5 dark:border-white/9">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
              Crop Profile Photo
            </h2>
            <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
              Upload, drag to reposition, and zoom before saving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-[#e0d0c5] text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-[#e0d0c5] bg-white/65 px-6 py-6 text-center transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.04)] dark:border-white/12 dark:bg-[#252320]/55">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-[#b84c2b] dark:text-[#e8816a]"
            >
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-[14px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
              Upload profile image
            </span>
            <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
              PNG or JPG, up to 5MB.
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          <div className="flex justify-center">
            <div
              ref={previewRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className={cn(
                "relative h-80 w-[320px] touch-none overflow-hidden rounded-full border-[3px] border-[#b84c2b] bg-[#0e0c0a] shadow-[0_14px_34px_rgba(0,0,0,0.20)] dark:border-[#e8816a] max-[420px]:h-65 max-[420px]:w-65",
                dragging && "cursor-grabbing",
              )}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Avatar crop preview"
                  className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-[13px] font-medium text-white/70">
                  Upload an image to begin
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
              Zoom
            </span>
            <input
              type="range"
              min={AVATAR_MIN_ZOOM}
              max={AVATAR_MAX_ZOOM}
              step="0.01"
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="w-full accent-[#b84c2b] dark:accent-[#e8816a]"
            />
            <span className="w-12 text-right font-['DM_Mono',monospace] text-[10px] text-[#b84c2b] dark:text-[#e8816a]">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#e0d0c5] px-6 py-4 dark:border-white/9">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-5 py-2.5 text-[13px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyAvatar}
            className="rounded-[10px] bg-[#b84c2b] px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tracker Card ─── */
interface TrackerCardProps {
  title: string;
  desc: string;
  rating: number;
  clones: string;
  thumbClass: string;
  onClone: () => void;
  onClick: () => void;
}

function TrackerCard({
  title,
  desc,
  rating,
  clones,
  thumbClass,
  onClone,
  onClick,
}: TrackerCardProps) {
  return (
    <div
      className="bg-[#fdf8f5] dark:bg-[#1e1c19] border-[1.5px] border-[#e0d0c5] dark:border-white/9 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(26,23,20,0.06)] cursor-pointer transition hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] hover:-translate-y-0.75 duration-200"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    >
      <div
        className={cn(
          "h-35 relative overflow-hidden flex items-center justify-center",
          thumbClass,
        )}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.04) 28px,rgba(255,255,255,0.04) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,0.04) 28px,rgba(255,255,255,0.04) 29px)",
          }}
        />
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.25 py-1 rounded-full bg-[rgba(0,0,0,0.55)] backdrop-blur-sm font-['DM_Mono',monospace] text-[9px] text-white tracking-[0.06em]">
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="#f0a842"
            stroke="none"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {rating.toFixed(1)}
        </div>
      </div>
      <div className="p-4">
        <div className="font-['Playfair_Display',serif] text-[16px] font-bold text-[#1a1714] dark:text-[#f2f0eb] tracking-[-0.3px] leading-tight mb-1.25">
          {title}
        </div>
        <p className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92] leading-normal mb-3 min-h-9">
          {desc}
        </p>
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="text-[11.5px] text-[#6b5f58] dark:text-[#9b9a92] flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {clones} Clones
          </div>
          <button
            type="button"
            className="px-4 py-1.75 rounded-lg bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.09)] border-[1.5px] border-[rgba(184,76,43,0.16)] dark:border-[rgba(232,129,106,0.22)] text-[12px] font-semibold text-[#b84c2b] dark:text-[#e8816a] transition hover:bg-[#b84c2b] hover:text-[#fdf8f5] hover:border-[#b84c2b] hover:-translate-y-px"
            onClick={(e) => {
              e.stopPropagation();
              onClone();
            }}
          >
            Clone
          </button>
        </div>
      </div>
    </div>
  );
}

const formatCompactNumber = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "0";

  return new Intl.NumberFormat(undefined, {
    notation: numeric >= 1000 ? "compact" : "standard",
    maximumFractionDigits: numeric >= 1000 ? 1 : 0,
  }).format(numeric);
};

const formatRelativeTime = (value: string | Date) => {
  const date = new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) return "Recently";

  const diffMs = Date.now() - time;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5)
    return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* ─── Main ProfilePage ─── */
export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isPublicView = Boolean(username);
  const isOwnView = !isPublicView;
  const showSidebar = isOwnView || isAuthenticated;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("imminiq_sb") === "closed",
  );

  const editOpen = useProfileStore((state) => state.editPanelOpen);
  const openEditPanel = useProfileStore((state) => state.openEditPanel);
  const closeEditPanel = useProfileStore((state) => state.closeEditPanel);

  const bannerModalOpen = useProfileStore((state) => state.bannerModalOpen);
  const openBannerModal = useProfileStore((state) => state.openBannerModal);
  const closeBannerModal = useProfileStore((state) => state.closeBannerModal);

  const avatarModalOpen = useProfileStore((state) => state.avatarCropModalOpen);
  const openAvatarCropModal = useProfileStore(
    (state) => state.openAvatarCropModal,
  );
  const closeAvatarCropModal = useProfileStore(
    (state) => state.closeAvatarCropModal,
  );

  const selectedBadgeId = useProfileStore((state) => state.selectedBadgeId);
  const setSelectedBadgeId = useProfileStore(
    (state) => state.setSelectedBadgeId,
  );

  const selectedHeatmapYear = useProfileStore(
    (state) => state.selectedHeatmapYear,
  );
  const setSelectedHeatmapYear = useProfileStore(
    (state) => state.setSelectedHeatmapYear,
  );

  const {
    message: toastMsg,
    visible: toastVisible,
    tone: toastTone,
    show: showToast,
    showLoading: showLoadingToast,
  } = useToast();

  const submitRateLimit = useSubmitRateLimit(1800);

  const badgesCardRef = useRef<HTMLDivElement>(null);

  const profileQuery = useProfile({ enabled: isOwnView });
  const statsQuery = useProfileStats({ enabled: isOwnView });
  const badgesQuery = useProfileBadges(1, 12, { enabled: isOwnView });
  const trackersQuery = usePublishedTrackers(
    { page: 1, limit: 3 },
    { enabled: isOwnView },
  );
  const streakQuery = useStreak(selectedHeatmapYear, { enabled: isOwnView });
  const activityQuery = useRecentActivity(5, { enabled: isOwnView });

  const publicProfileQuery = usePublicProfile(
    username ?? "",
    { page: 1, limit: 3, sort: "publishedAt" },
    { enabled: isPublicView },
  );

  const activeProfileData = isPublicView
    ? publicProfileQuery.data
    : profileQuery.data;

  const activeStats = isPublicView
    ? (publicProfileQuery.data?.stats ?? undefined)
    : statsQuery.data;

  const activeStreak = isPublicView
    ? (publicProfileQuery.data?.streak ?? undefined)
    : streakQuery.data;

  const activeTrackerData = isPublicView
    ? publicProfileQuery.data?.publishedTrackers
    : trackersQuery.data;

  const activeActivityItems = isPublicView
    ? (publicProfileQuery.data?.recentActivity ?? [])
    : (activityQuery.data?.items ?? []);

  const activeBadgeItems = isPublicView
    ? (publicProfileQuery.data?.badges?.items ?? [])
    : (badgesQuery.data?.items ?? []);

  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const uploadBannerMutation = useUploadBanner();

  const profile = useMemo<ProfileData | null>(() => {
    if (!activeProfileData) return null;

    const parsedLocation = parseLocation(activeProfileData.profile.location);

    return {
      name:
        activeProfileData.profile.fullName ||
        activeProfileData.user.fullName ||
        "Imminiq Learner",
      username: activeProfileData.user.username || "",
      profession: activeProfileData.profile.headline || "",
      bio: activeProfileData.profile.bio || "",
      city: parsedLocation.city,
      state: parsedLocation.state,
      country: parsedLocation.country,
      postal: parsedLocation.postal,
      skills: activeProfileData.profile.skills ?? [],
      avatarUrl: activeProfileData.user.avatarUrl || null,
      bannerDataUrl: activeProfileData.profile.profileBannerUrl || null,
      githubUrl: activeProfileData.profile.githubUrl || "",
      linkedinUrl: activeProfileData.profile.linkedinUrl || "",
      portfolioUrl: activeProfileData.profile.portfolioUrl || "",
    };
  }, [activeProfileData]);

  const locationStr = profile
    ? [profile.city, profile.state, profile.country]
        .filter(Boolean)
        .join(", ") + (profile.postal ? ` — ${profile.postal}` : "")
    : "";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (avatarModalOpen) closeAvatarCropModal();
      else if (bannerModalOpen) closeBannerModal();
      else if (editOpen) closeEditPanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    avatarModalOpen,
    bannerModalOpen,
    closeAvatarCropModal,
    closeBannerModal,
    closeEditPanel,
    editOpen,
  ]);

  useEffect(() => {
    if (!selectedBadgeId) return;

    const handleOutsideBadgePopup = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (badgesCardRef.current && !badgesCardRef.current.contains(target)) {
        setSelectedBadgeId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideBadgePopup);
    document.addEventListener("touchstart", handleOutsideBadgePopup);

    return () => {
      document.removeEventListener("mousedown", handleOutsideBadgePopup);
      document.removeEventListener("touchstart", handleOutsideBadgePopup);
    };
  }, [selectedBadgeId, setSelectedBadgeId]);

  useEffect(() => {
    localStorage.setItem("imminiq_sb", sidebarCollapsed ? "closed" : "open");
  }, [sidebarCollapsed]);

  const redirectGuestToLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const handleProtectedPublicAction = (successMessage: string) => {
    if (!isAuthenticated) {
      redirectGuestToLogin();
      return;
    }

    showToast(successMessage, "info");
  };

  const handleSave = async (data: Partial<ProfileData>) => {
    if (!isOwnView) return;

    if (!submitRateLimit.canStart("profile-save")) {
      showToast("Please wait before saving profile again.", "info");
      return;
    }

    closeEditPanel();
    showLoadingToast("Saving profile changes…");

    try {
      await updateProfileMutation.mutateAsync({
        fullName: data.name?.trim(),
        headline: data.profession?.trim(),
        bio: data.bio?.trim(),
        location: formatLocation({
          city: data.city,
          state: data.state,
          country: data.country,
          postal: data.postal,
        }),
        skills: data.skills?.map((skill) => skill.trim()).filter(Boolean),
        githubUrl: normalizeOptionalUrl(data.githubUrl ?? ""),
        linkedinUrl: normalizeOptionalUrl(data.linkedinUrl ?? ""),
        portfolioUrl: normalizeOptionalUrl(data.portfolioUrl ?? ""),
      });

      await profileQuery.refetch();
      showToast("Profile saved!", "success");
    } catch {
      showToast("Unable to save profile. Please try again.", "error");
    } finally {
      submitRateLimit.finish("profile-save");
    }
  };

  const trackerThumbClasses = [
    "bg-gradient-to-br from-[#1a3a6b] via-[#2d5da8] to-[#1e4a8a]",
    "bg-gradient-to-[160deg] from-[#0a0a12] via-[#1a1a2e] to-[#16213e]",
    "bg-gradient-to-br from-[#0d3b3b] via-[#1a5c5c] to-[#0e4a4a]",
  ];

  const trackers = (activeTrackerData?.items ?? []).map(
    (tracker: PublishedTracker, index: number) => ({
      title: tracker.title,
      desc: tracker.description || "Published tracker",
      rating: Number(tracker.ratingAverage ?? 0),
      clones: formatCompactNumber(tracker.cloneCount),
      thumbClass: trackerThumbClasses[index % trackerThumbClasses.length],
      slug: tracker.slug,
    }),
  );

  const activityVisual = (item: ActivityFeedItem) => {
    if (item.module.includes("tracker")) {
      return {
        dot: "rust",
        iconColor: "rust",
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
      };
    }

    if (item.module.includes("streak") || item.action.includes("streak")) {
      return {
        dot: "amber",
        iconColor: "amber",
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
          </svg>
        ),
      };
    }

    if (item.module.includes("social") || item.module.includes("friend")) {
      return {
        dot: "blue",
        iconColor: "blue",
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      };
    }

    return {
      dot: "green",
      iconColor: "green",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    };
  };

  const activityFeed = activeActivityItems.map((item: ActivityFeedItem) => {
    const visual = activityVisual(item);

    return {
      ...visual,
      text: item.description,
      time: formatRelativeTime(item.createdAt),
    };
  });

  const badges = activeBadgeItems.map(
    (badge: ProfileBadge): Badge => ({
      id: badge._id,
      emoji: badgeEmojiByType[badge.badgeType] ?? "🏅",
      name: badge.name,
      desc: badge.description,
      color: badgeColorByType[badge.badgeType] ?? "blue",
      earned: true,
      tier: badgeTierByType[badge.badgeType] ?? "Badge",
      iconUrl: badge.iconUrl,
    }),
  );

  const dotClasses: Record<string, string> = {
    rust: "bg-[#b84c2b]",
    green: "bg-[#4caf7d]",
    amber: "bg-[#c98000]",
    blue: "bg-[#3b6cb7]",
  };
  const iconBoxClasses: Record<string, string> = {
    rust: "bg-[rgba(184,76,43,0.08)] border-[rgba(184,76,43,0.16)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.09)] dark:border-[rgba(232,129,106,0.22)] dark:text-[#e8816a]",
    green:
      "bg-[rgba(45,106,71,0.08)] border-[rgba(45,106,71,0.20)] text-[#4caf7d] dark:bg-[rgba(92,201,138,0.10)] dark:border-[rgba(92,201,138,0.22)] dark:text-[#5cc98a]",
    amber:
      "bg-[rgba(138,98,0,0.08)] border-[rgba(138,98,0,0.20)] text-[#c98000] dark:bg-[rgba(240,168,66,0.10)] dark:border-[rgba(240,168,66,0.24)] dark:text-[#f0a842]",
    blue: "bg-[rgba(59,108,183,0.08)] border-[rgba(59,108,183,0.20)] text-[#3b6cb7] dark:bg-[rgba(107,159,232,0.10)] dark:border-[rgba(107,159,232,0.22)] dark:text-[#6b9fe8]",
  };

  const profileLevelLabel = formatProfileLevel(
    activeStats?.studentLevel ?? activeProfileData?.user.level,
  );

  const accountCreatedAt = activeProfileData?.user.createdAt ?? null;

  const activeProfileQueryError = isPublicView
    ? publicProfileQuery.isError
    : profileQuery.isError;

  const activeProfileQueryLoading = isPublicView
    ? publicProfileQuery.isLoading
    : profileQuery.isLoading;

  if (activeProfileQueryError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
        <div className="max-w-105 rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-6 py-5 text-center shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
          <div className="font-['Playfair_Display',serif] text-[20px] font-extrabold">
            Profile unavailable
          </div>
          <p className="mt-2 text-[13px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
            {isPublicView
              ? "This public profile is unavailable or could not be loaded right now."
              : "We could not load your profile right now. Refresh the page after the backend is running."}
          </p>
        </div>
      </div> 
    );
  }

  if (activeProfileQueryLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
        <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-6 py-5 text-[14px] font-semibold shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
          Loading your profile…
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <style>{`
        html,
        body {
          background: #f5ede4;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: rgba(184, 76, 43, 0.42) transparent;
        }

        html.dark,
        html.dark body {
          background: #141412;
          scrollbar-color: rgba(232, 129, 106, 0.48) transparent;
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
          background: transparent;
        }

        html::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track,
        html::-webkit-scrollbar-track-piece,
        body::-webkit-scrollbar-track-piece,
        html::-webkit-scrollbar-corner,
        body::-webkit-scrollbar-corner {
          background: transparent;
        }

        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb {
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
          background-color: rgba(184, 76, 43, 0.42);
        }

        html::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover {
          background-color: rgba(184, 76, 43, 0.62);
        }

        html.dark::-webkit-scrollbar-thumb,
        html.dark body::-webkit-scrollbar-thumb {
          background-color: rgba(232, 129, 106, 0.48);
        }

        html.dark::-webkit-scrollbar-thumb:hover,
        html.dark body::-webkit-scrollbar-thumb:hover {
          background-color: rgba(232, 129, 106, 0.70);
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "180px",
        }}
      />
      {/* Bottom-right request/status toast */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed bottom-[calc(72px+env(safe-area-inset-bottom,0))] right-4 z-200 flex max-w-[min(360px,calc(100vw-32px))] items-center gap-2.5 rounded-[14px] border px-4 py-3 text-[13px] font-semibold shadow-[0_18px_56px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all duration-250 lg:bottom-7 lg:right-7",
          toastTone === "error"
            ? "border-[rgba(224,82,82,0.22)] bg-[#2c1717]/95 text-[#ffd5d5] dark:bg-[#2c1717]/95 dark:text-[#ffd5d5]"
            : toastTone === "success"
              ? "border-[rgba(76,175,125,0.24)] bg-[#173022]/95 text-[#dbffe8] dark:bg-[#173022]/95 dark:text-[#dbffe8]"
              : "border-[rgba(184,76,43,0.22)] bg-[#1a1714]/95 text-[#f5ede4] dark:border-[rgba(232,129,106,0.28)] dark:bg-[#f2f0eb]/95 dark:text-[#1a1714]",
          toastVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-5 opacity-0",
        )}
      >
        {toastTone === "loading" && (
          <span className="h-3.75 w-3.75 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        <span className="min-w-0 leading-[1.4]">{toastMsg}</span>
      </div>

      <div className="flex min-h-screen w-full overflow-x-clip">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            mobileOpen={sidebarOpen}
            collapsed={sidebarCollapsed}
            onCloseMobile={() => setSidebarOpen(false)}
            onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
          />
        )}

        {/* Main */}
        <main
          className={cn(
            "flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300",
            showSidebar
              ? sidebarCollapsed
                ? "min-[901px]:ml-0"
                : "min-[901px]:ml-56"
              : "ml-0",
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={
              activeStreak?.currentStreak ?? activeStats?.streakCount ?? 0
            }
            userName={profile.name}
            userInitials={profile.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
            userAvatarUrl={profile.avatarUrl || undefined}
            userLevel={profileLevelLabel}
            isGuest={isPublicView && !isAuthenticated}
          />

          <div className="profile-page flex min-w-0 flex-1 flex-col overflow-x-clip">
            {/* Framed content */}
            <div className="mx-auto mt-5.5 w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              {/* Hero Banner */}
              <div
                className="group/banner relative overflow-hidden rounded-t-[22px] max-[640px]:rounded-t-2xl bg-[#0e0c0a]"
                style={{ aspectRatio: "4 / 1" }}
              >
                {profile.bannerDataUrl && (
                  <img
                    src={profile.bannerDataUrl}
                    alt="Profile banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                )}
                {/* Glow / grid decorations */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-60%] w-95 h-95 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28)_0%,transparent_70%)] pointer-events-none z-1 animate-pulse" />
                <div
                  className="absolute inset-0 opacity-[0.04] z-1"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                    backgroundSize: "180px",
                  }}
                />
                <svg
                  className="absolute inset-0 w-full h-full opacity-[0.04] z-1"
                  viewBox="0 0 800 200"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="800" height="200" fill="url(#grid)" />
                </svg>
                {/* Hover overlay */}
                {isOwnView && (
                  <div className="pointer-events-none absolute inset-0 z-5 flex items-end justify-end p-3.5 transition-[background] group-hover/banner:bg-[rgba(0,0,0,0.28)] max-[900px]:bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.42)_100%)] [@media(hover:none)]:bg-[linear-gradient(180deg,transparent_26%,rgba(0,0,0,0.46)_100%)]">
                    <div className="pointer-events-auto flex gap-2 opacity-0 transition-all duration-220 translate-y-1 group-hover/banner:opacity-100 group-hover/banner:translate-y-0 max-[900px]:opacity-100 max-[900px]:translate-y-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0">
                      <button
                        type="button"
                        onClick={() => openBannerModal()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] bg-[rgba(0,0,0,0.62)] border border-[rgba(255,255,255,0.22)] text-white text-[12px] font-semibold backdrop-blur-md hover:bg-[rgba(0,0,0,0.82)] hover:border-[rgba(255,255,255,0.4)] transition"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Change Banner
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Header */}
              <div className="bg-[#fdf8f5] dark:bg-[#1e1c19] border-l border-r border-b border-[#e0d0c5] dark:border-white/9 px-7 pb-5.5 max-[640px]:px-4 animate-[fadeUp_0.38s_ease_0.05s_both]">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1 max-[640px]:gap-3 max-[640px]:flex-col">
                    {/* Avatar */}
                    <div className="relative z-20 shrink-0 -mt-18 max-[640px]:-mt-13.5">
                      <div
                        onClick={() => isOwnView && openAvatarCropModal()}
                        className={cn(
                          "w-25 h-25 max-[640px]:w-23 max-[640px]:h-23 rounded-full border-4 border-[#fdf8f5] dark:border-[#1e1c19] shadow-[0_4px_24px_rgba(26,23,20,0.18),0_0_0_1px_rgba(26,23,20,0.06)] bg-linear-to-br from-[#b84c2b] via-[#e8816a] to-[#c98000] flex items-center justify-center relative overflow-hidden transition-shadow group",
                          isOwnView
                            ? "cursor-pointer hover:shadow-[0_6px_32px_rgba(26,23,20,0.22),0_0_0_2px_#e8816a]"
                            : "cursor-default",
                        )}
                      >
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            width="52"
                            height="52"
                            viewBox="0 0 52 52"
                            fill="none"
                            aria-hidden="true"
                          >
                            <text
                              x="9"
                              y="36"
                              fontFamily="Georgia,serif"
                              fontSize="26"
                              fontWeight="700"
                              fill="rgba(255,255,255,0.9)"
                            >
                              {profile.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </text>
                          </svg>
                        )}
                        {isOwnView && (
                          <div className="absolute inset-0 rounded-full bg-[rgba(0,0,0,0.52)] backdrop-blur-[2px] flex flex-col items-center justify-center gap-0.75 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                            >
                              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                            <span className="text-[9px] font-bold text-white font-['DM_Mono',monospace] tracking-[0.12em] uppercase leading-none">
                              Change
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0.75 left-1/2 -translate-x-1/2 bg-[#b84c2b] dark:bg-[#e8816a] text-white dark:text-[#141412] font-['DM_Mono',monospace] text-[8px] font-medium tracking-[0.12em] px-1.75 py-0.5 rounded-sm whitespace-nowrap z-3">
                        PRO
                      </div>
                    </div>
                    {/* Name block */}
                    <div className="pt-2 max-[640px]:pt-0 min-w-0 flex-1">
                      <h1 className="font-['Playfair_Display',serif] text-[clamp(22px,3.5vw,32px)] font-extrabold tracking-[-0.6px] text-[#1a1714] dark:text-[#f2f0eb] leading-[1.15] wrap-break-word">
                        {profile.name}
                      </h1>

                      {profile.username && (
                        <div className="mt-1 font-['DM_Mono',monospace] text-[11px] tracking-[0.08em] text-[#b84c2b] dark:text-[#e8816a] wrap-break-word">
                          @{profile.username}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 mt-1.25 text-[13px] text-[#6b5f58] dark:text-[#9b9a92] flex-wrap">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="2" y="7" width="20" height="14" rx="2" />
                          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                        </svg>
                        <span>{profile.profession}</span>
                        <span className="opacity-40">·</span>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{locationStr}</span>
                      </div>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex self-center translate-y-1.5 items-center gap-2 flex-wrap max-[900px]:w-full max-[900px]:self-auto max-[900px]:translate-y-0 max-[640px]:gap-2">
                    {isPublicView ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleProtectedPublicAction(
                              "Friend request flow is ready to connect.",
                            )
                          }
                          className="inline-flex items-center gap-1.75 px-5.5 py-2.5 rounded-[10px] bg-[#b84c2b] dark:bg-[#e8816a] text-[#fdf8f5] dark:text-[#141412] text-[13px] font-bold transition hover:-translate-y-px hover:bg-[#963d22] dark:hover:bg-[#d4705a] hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] max-[640px]:flex-[1_1_150px] max-[640px]:justify-center whitespace-nowrap"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Send Request
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleProtectedPublicAction(
                              "Messaging flow is ready to connect.",
                            )
                          }
                          className="inline-flex items-center gap-1.75 px-5.5 py-2.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] dark:border-white/9 text-[#1a1714] dark:text-[#f2f0eb] text-[13px] font-semibold transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] max-[640px]:flex-[1_1_150px] max-[640px]:justify-center whitespace-nowrap"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                          Message
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEditPanel()}
                        className="inline-flex items-center gap-1.75 px-4.5 py-2.5 rounded-[10px] bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.09)] border-[1.5px] border-[rgba(184,76,43,0.16)] dark:border-[rgba(232,129,106,0.22)] text-[#b84c2b] dark:text-[#e8816a] text-[13px] font-semibold transition hover:bg-[#b84c2b] hover:text-[#fdf8f5] hover:border-[#b84c2b] hover:-translate-y-px max-[640px]:flex-[1_1_150px] max-[640px]:justify-center whitespace-nowrap"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Profile
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => showToast("Link copied!")}
                      aria-label="Share profile"
                      className="w-9.5 h-9.5 max-[640px]:flex-[0_0_38px] rounded-[10px] border-[1.5px] border-[#e0d0c5] dark:border-white/9 flex items-center justify-center text-[#6b5f58] dark:text-[#9b9a92] hover:border-[#e8816a] hover:text-[#b84c2b] transition"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex items-center gap-1.75 flex-wrap mt-4">
                  {[
                    {
                      cls: "bg-[rgba(184,76,43,0.08)] border-[rgba(184,76,43,0.16)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:border-[rgba(232,129,106,0.22)] dark:text-[#e8816a]",
                      label: `${activeStreak?.currentStreak ?? activeStats?.streakCount ?? 0} Day Streak`,
                      icon: (
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
                        </svg>
                      ),
                    },
                    {
                      cls: "bg-[rgba(138,98,0,0.08)] border-[rgba(138,98,0,0.20)] text-[#8a6200] dark:bg-[rgba(240,168,66,0.10)] dark:border-[rgba(240,168,66,0.24)] dark:text-[#f0a842]",
                      label: `${formatCompactNumber(activeStats?.xp ?? 0)} XP`,
                      icon: (
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ),
                    },
                    {
                      cls: "bg-[rgba(59,108,183,0.08)] border-[rgba(59,108,183,0.20)] text-[#3b6cb7] dark:bg-[rgba(107,159,232,0.10)] dark:border-[rgba(107,159,232,0.22)] dark:text-[#6b9fe8]",
                      label: `Student Level ${activeStats?.studentLevel ?? 0}`,
                      icon: (
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                      ),
                    },
                    {
                      cls: "bg-[rgba(45,106,71,0.08)] border-[rgba(45,106,71,0.20)] text-[#2d6a47] dark:bg-[rgba(92,201,138,0.10)] dark:border-[rgba(92,201,138,0.22)] dark:text-[#5cc98a]",
                      label: `Rating ${Number(activeStats?.ratingAverage ?? 0).toFixed(1)}`,
                      icon: (
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
                        </svg>
                      ),
                    },
                  ].map((chip) => (
                    <span
                      key={chip.label}
                      className={cn(
                        'inline-flex items-center gap-1.25 px-3 py-1.25 rounded-full font-["DM_Mono",monospace] text-[9px] tracking-widest uppercase whitespace-nowrap border',
                        chip.cls,
                      )}
                    >
                      {chip.icon}
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className="flex flex-col gap-6 py-6 max-[640px]:py-5 max-[900px]:pb-[calc(80px+env(safe-area-inset-bottom,0))]">
                {/* Stats bento */}
                <div className="grid grid-cols-4 max-[860px]:grid-cols-2 max-[420px]:grid-cols-1 gap-2.5 animate-[fadeUp_0.38s_ease_0.1s_both]">
                  {/* Streak */}
                  <StatCard accent="rust" label="Current Streak">
                    <div className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,36px)] font-extrabold text-[#b84c2b] dark:text-[#e8816a] tracking-[-2px] leading-none">
                      {activeStreak?.currentStreak ??
                        activeStats?.streakCount ??
                        0}{" "}
                      <span className="text-[14px] font-['DM_Sans',sans-serif] font-medium opacity-60">
                        days
                      </span>
                    </div>
                    <div className="flex items-end gap-0.75 h-8 mt-1">
                      {[20, 55, 35, 80, 60, 90, 100, 70, 85, 50, 95, 42].map(
                        (h, i) => (
                          <div
                            key={i}
                            className={cn(
                              "rounded-[2px 2px 0 0] flex-1 rounded-sm",
                              i === 11
                                ? "bg-[#b84c2b] dark:bg-[#e8816a] opacity-70"
                                : "bg-[#b84c2b] dark:bg-[#e8816a] opacity-18",
                            )}
                            style={{ height: `${h}%` }}
                          />
                        ),
                      )}
                    </div>
                  </StatCard>

                  {/* Student Level */}
                  <StatCard accent="green" label="Student Level">
                    <div className="flex items-baseline gap-2">
                      <div className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,36px)] font-extrabold text-[#4caf7d] dark:text-[#5cc98a] tracking-[-2px] leading-none">
                        {activeStats?.studentLevel ?? 0}
                      </div>
                      <div className="font-['DM_Mono',monospace] text-[11px] text-[#4caf7d] dark:text-[#5cc98a] opacity-80 tracking-[0.06em]">
                        Level
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between rounded-[10px] border border-[rgba(45,106,71,0.16)] bg-[rgba(45,106,71,0.06)] px-2.5 py-2 dark:border-[rgba(92,201,138,0.18)] dark:bg-[rgba(92,201,138,0.08)]">
                      <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
                        Experience
                      </span>
                      <span className="font-['DM_Mono',monospace] text-[10px] font-medium text-[#4caf7d] dark:text-[#5cc98a]">
                        {formatCompactNumber(activeStats?.xp ?? 0)} XP
                      </span>
                    </div>
                  </StatCard>

                  {/* Coins Balance */}
                  <StatCard accent="amber" label="Coins Balance">
                    <div className="flex items-baseline gap-2">
                      <div className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,36px)] font-extrabold text-[#c98000] dark:text-[#f0a842] tracking-[-2px] leading-none">
                        {formatCompactNumber(activeStats?.coins ?? 0)}
                      </div>
                      <div className="font-['DM_Mono',monospace] text-[11px] text-[#c98000] dark:text-[#f0a842] opacity-80 tracking-[0.06em]">
                        Coins
                      </div>
                    </div>
                    <div className="mt-2 rounded-[10px] border border-[rgba(138,98,0,0.18)] bg-[rgba(138,98,0,0.06)] px-2.5 py-2 text-[11px] font-medium leading-[1.35] text-[#6b5f58] dark:border-[rgba(240,168,66,0.20)] dark:bg-[rgba(240,168,66,0.08)] dark:text-[#9b9a92]">
                      Reward balance available for store and powerups.
                    </div>
                  </StatCard>

                  {/* Impact */}
                  <StatCard accent="blue" label="Impact">
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {[
                        {
                          val: formatCompactNumber(
                            activeStats?.publishedCount ?? 0,
                          ),
                          lbl: "Published",
                        },
                        {
                          val: formatCompactNumber(
                            activeStats?.cloneCount ?? 0,
                          ),
                          lbl: "Clones",
                        },
                        {
                          val: Number(activeStats?.ratingAverage ?? 0).toFixed(
                            1,
                          ),
                          lbl: "Rating",
                          cls: "text-[#c98000] dark:text-[#f0a842]",
                        },
                        {
                          val: formatCompactNumber(activeStats?.likeCount ?? 0),
                          lbl: "Likes",
                          cls: "text-[#b84c2b] dark:text-[#e8816a]",
                        },
                      ].map((item) => (
                        <div key={item.lbl}>
                          <div
                            className={cn(
                              'font-["Playfair_Display",serif] text-[20px] font-extrabold tracking-[-1px] leading-none text-[#1a1714] dark:text-[#f2f0eb]',
                              item.cls,
                            )}
                          >
                            {item.val}
                          </div>
                          <div className="font-['DM_Mono',monospace] text-[7.5px] tracking-[0.14em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-50 mt-px">
                            {item.lbl}
                          </div>
                        </div>
                      ))}
                    </div>
                  </StatCard>
                </div>

                {/* Two-col: About + Badges */}
                <div className="grid grid-cols-[1fr_320px] max-[860px]:grid-cols-1 gap-4 animate-[fadeUp_0.38s_ease_0.18s_both]">
                  {/* About */}
                  <div className="bg-[#fdf8f5] dark:bg-[#1e1c19] border-[1.5px] border-[#e0d0c5] dark:border-white/9 rounded-[18px] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)]">
                    <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb] tracking-[-0.4px] mb-3">
                      About {profile.name.split(" ")[0]}
                    </h2>
                    <p className="text-[13.5px] text-[#6b5f58] dark:text-[#9b9a92] leading-[1.65] mb-5">
                      {profile.bio}
                    </p>
                    <div className="font-['DM_Mono',monospace] text-[8px] tracking-[0.16em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-50 mb-2">
                      Skills
                    </div>
                    <div className="flex gap-1.5 flex-wrap mb-5">
                      {profile.skills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.25 rounded-[7px] bg-[rgba(26,23,20,0.09)] dark:bg-[rgba(242,240,235,0.09)] text-[12px] font-medium text-[#1a1714] dark:text-[#f2f0eb] border border-[#e0d0c5] dark:border-white/9"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="font-['DM_Mono',monospace] text-[8px] tracking-[0.16em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-50 mb-2">
                      Intentions
                    </div>
                    <div className="flex flex-col gap-1.75 mb-5">
                      {["Open to Collaboration", "Mentoring Beginners"].map(
                        (intention) => (
                          <div
                            key={intention}
                            className="flex items-center gap-2 text-[13px] text-[#6b5f58] dark:text-[#9b9a92]"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#4caf7d"
                              strokeWidth="2.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {intention}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="font-['DM_Mono',monospace] text-[8px] tracking-[0.16em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-50 mb-2">
                      Links
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        {
                          label: "GitHub",
                          url: profile.githubUrl,
                          icon: (
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                            </svg>
                          ),
                        },
                        {
                          label: "LinkedIn",
                          url: profile.linkedinUrl,
                          icon: (
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                              <rect x="2" y="9" width="4" height="12" />
                              <circle cx="4" cy="4" r="2" />
                            </svg>
                          ),
                        },
                        {
                          label: "Portfolio",
                          url: profile.portfolioUrl,
                          icon: (
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                            </svg>
                          ),
                        },
                      ].map((link) => (
                        <a
                          key={link.label}
                          href={link.url || "#"}
                          target={link.url ? "_blank" : undefined}
                          rel={link.url ? "noreferrer" : undefined}
                          onClick={(event) => {
                            if (link.url) return;
                            event.preventDefault();
                            showToast(
                              `${link.label} link has not been added yet.`,
                            );
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3.5 py-1.75 rounded-lg border-[1.5px] border-[#e0d0c5] dark:border-white/9 text-[12px] font-medium text-[#6b5f58] dark:text-[#9b9a92] hover:border-[#e8816a] hover:text-[#b84c2b] hover:bg-[rgba(184,76,43,0.08)] transition",
                            !link.url && "opacity-55",
                          )}
                        >
                          {link.icon}
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                  {/* Badges */}
                  <div
                    ref={badgesCardRef}
                    className="relative min-w-0 overflow-visible rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5.5 shadow-[0_14px_42px_rgba(26,23,20,0.10),0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] dark:shadow-[0_18px_52px_rgba(0,0,0,0.36)]"
                  >
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]">
                      <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.16),transparent_68%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(232,129,106,0.20),transparent_68%)]" />
                      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(59,108,183,0.13),transparent_68%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(107,159,232,0.18),transparent_68%)]" />
                      <div className="absolute inset-0 rounded-[20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.48),transparent_40%,rgba(184,76,43,0.03))] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_40%,rgba(232,129,106,0.04))]" />
                    </div>

                    <div className="relative z-1 mb-4 flex items-center justify-between gap-3">
                      <div>
                        <span className="block font-['Playfair_Display',serif] text-[19px] font-extrabold tracking-[-0.35px] text-[#1a1714] dark:text-[#f2f0eb]">
                          Badges
                        </span>
                        <span className="mt-1 block font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                          Tap a badge for details
                        </span>
                      </div>
                      <div className="flex min-w-19.5 flex-col items-end rounded-[13px] border border-[#e0d0c5] bg-white/72 px-3 py-2 text-right dark:border-white/9 dark:bg-white/4">
                        <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
                          Earned
                        </span>
                        <span className="font-['Playfair_Display',serif] text-[19px] font-extrabold leading-none text-[#b84c2b] dark:text-[#e8816a]">
                          {badges.length}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-1 grid grid-cols-3 gap-2.5 max-[420px]:grid-cols-2">
                      {badges.map((badge, i) => {
                        const tone = badgeToneClasses[badge.color];
                        const selected = selectedBadgeId === badge.id;
                        const popupPlacement =
                          i >= 3
                            ? "bottom-[calc(100%+11px)]"
                            : "top-[calc(100%+11px)]";

                        return (
                          <div key={badge.id} className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedBadgeId(selected ? null : badge.id)
                              }
                              className={cn(
                                "group relative flex aspect-square min-h-22 w-full items-center justify-center overflow-hidden rounded-[18px] border transition-all duration-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[rgba(184,76,43,0.18)] dark:focus-visible:ring-[rgba(232,129,106,0.22)]",
                                tone.tile,
                                badge.earned
                                  ? "hover:-translate-y-0.75 hover:shadow-[0_14px_30px_rgba(26,23,20,0.14)] dark:hover:shadow-[0_18px_34px_rgba(0,0,0,0.40)]"
                                  : "grayscale opacity-65 hover:opacity-85",
                                selected &&
                                  "-translate-y-0.5 ring-[3px] ring-[rgba(184,76,43,0.20)] dark:ring-[rgba(232,129,106,0.26)]",
                                "animate-[badgePop_0.4s_cubic-bezier(0.34,1.2,0.64,1)_both]",
                              )}
                              style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                              aria-pressed={selected}
                              aria-label={`${badge.name} badge`}
                              title={badge.name}
                            >
                              <div
                                className={cn(
                                  "pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full blur-xl transition-opacity duration-300 group-hover:opacity-100",
                                  tone.aura,
                                  badge.earned ? "opacity-70" : "opacity-30",
                                )}
                              />
                              <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-white/75 to-transparent opacity-70 dark:via-white/20" />
                              <div
                                className={cn(
                                  "relative z-1 flex h-14.5 w-14.5 items-center justify-center rounded-full border text-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.60),0_10px_24px_rgba(26,23,20,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_26px_rgba(0,0,0,0.30)]",
                                  tone.icon,
                                )}
                              >
                                {badge.iconUrl ? (
                                  <img
                                    src={badge.iconUrl}
                                    alt=""
                                    className="h-7 w-7 object-contain"
                                  />
                                ) : (
                                  badge.emoji
                                )}
                              </div>
                              {badge.earned ? (
                                <span
                                  className={cn(
                                    "absolute bottom-3 right-3 z-2 h-2.25 w-2.25 rounded-full",
                                    tone.dot,
                                  )}
                                />
                              ) : (
                                <span className="absolute bottom-2.5 right-2.5 z-2 flex h-5.5 w-5.5 items-center justify-center rounded-full border border-[#e0d0c5] bg-white/80 text-[#6b5f58] dark:border-white/9 dark:bg-white/5 dark:text-[#9b9a92]">
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                  >
                                    <rect
                                      x="3"
                                      y="11"
                                      width="18"
                                      height="11"
                                      rx="2"
                                    />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                  </svg>
                                </span>
                              )}
                            </button>

                            {selected && (
                              <div
                                role="dialog"
                                aria-label={`${badge.name} details`}
                                className={cn(
                                  "absolute left-1/2 z-35 w-55 -translate-x-1/2 rounded-2xl border border-[#e0d0c5] bg-[#fffaf5]/98 p-3.5 shadow-[0_22px_60px_rgba(26,23,20,0.20)] backdrop-blur-xl animate-[fadeUp_0.22s_ease_both] dark:border-white/12 dark:bg-[#23201d]/98 dark:shadow-[0_26px_70px_rgba(0,0,0,0.52)] max-[420px]:w-49.5",
                                  popupPlacement,
                                )}
                              >
                                <div className="flex items-start justify-between gap-2.5">
                                  <div className="flex min-w-0 items-center gap-2.5">
                                    <div
                                      className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[20px]",
                                        tone.icon,
                                      )}
                                    >
                                      {badge.iconUrl ? (
                                        <img
                                          src={badge.iconUrl}
                                          alt=""
                                          className="h-7 w-7 object-contain"
                                        />
                                      ) : (
                                        badge.emoji
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="truncate font-['Playfair_Display',serif] text-[14.5px] font-extrabold tracking-[-0.2px] text-[#1a1714] dark:text-[#f2f0eb]">
                                        {badge.name}
                                      </div>
                                      <div className="mt-0.5 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.13em] text-[#6b5f58] opacity-65 dark:text-[#9b9a92]">
                                        {badge.earned ? "Unlocked" : "Locked"}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedBadgeId(null)}
                                    aria-label="Close badge details"
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e0d0c5] bg-white/80 text-[13px] leading-none text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/10 dark:bg-white/5 dark:text-[#9b9a92]"
                                  >
                                    ×
                                  </button>
                                </div>

                                <div className="mt-2.5 flex items-center justify-between gap-2">
                                  <span
                                    className={cn(
                                      'inline-flex rounded-full border px-2 py-1 font-["DM_Mono",monospace] text-[7px] font-medium uppercase tracking-[0.12em]',
                                      tone.chip,
                                    )}
                                  >
                                    {badge.tier}
                                  </span>
                                </div>

                                <p className="mt-2.5 text-[11.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                                  {badge.desc}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="animate-[fadeUp_0.38s_ease_0.26s_both]">
                  <HeapTile
                    streak={activeStreak}
                    year={
                      isPublicView
                        ? new Date().getFullYear()
                        : selectedHeatmapYear
                    }
                    onYearChange={
                      isPublicView ? () => undefined : setSelectedHeatmapYear
                    }
                    isLoading={
                      isPublicView
                        ? publicProfileQuery.isLoading
                        : streakQuery.isLoading
                    }
                    accountCreatedAt={accountCreatedAt}
                  />
                </div>

                {/* Published Trackers */}
                <div>
                  <div className="flex items-center justify-between mb-3.5 animate-[fadeUp_0.38s_ease_0.32s_both]">
                    <h2 className="font-['Playfair_Display',serif] text-[clamp(20px,3vw,24px)] font-extrabold text-[#1a1714] dark:text-[#f2f0eb] tracking-[-0.4px]">
                      Published Trackers
                    </h2>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast("Viewing all trackers…");
                      }}
                      className="font-['DM_Mono',monospace] text-[10px] tracking-widest uppercase text-[#b84c2b] dark:text-[#e8816a] hover:opacity-70 transition"
                    >
                      View All →
                    </a>
                  </div>
                  <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[640px]:grid-cols-1 gap-3.5 animate-[fadeUp_0.38s_ease_0.36s_both]">
                    {trackers.map((t) => (
                      <TrackerCard
                        key={t.title}
                        {...t}
                        onClone={() => showToast("Tracker cloned!")}
                        onClick={() => showToast(`Opening ${t.title}…`)}
                      />
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-0 animate-[fadeUp_0.38s_ease_0.4s_both]">
                  <div className="flex-1 h-px bg-[#e0d0c5] dark:bg-white/9" />
                  <span className="font-['DM_Mono',monospace] text-[8px] tracking-[0.18em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-45 px-3 py-1 border border-[#e0d0c5] dark:border-white/9 rounded-full whitespace-nowrap">
                    Recent activity
                  </span>
                  <div className="flex-1 h-px bg-[#e0d0c5] dark:bg-white/9" />
                </div>

                {/* Activity Feed */}
                <div className="bg-[#fdf8f5] dark:bg-[#1e1c19] border-[1.5px] border-[#e0d0c5] dark:border-white/9 rounded-[18px] overflow-hidden shadow-[0_2px_16px_rgba(26,23,20,0.06)] animate-[fadeUp_0.38s_ease_0.44s_both]">
                  <div className="p-5 max-[640px]:p-4.5">
                    <h2 className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb] tracking-[-0.3px] mb-4.5">
                      Recent Activity
                    </h2>
                    <div className="flex flex-col">
                      {activityFeed.map((item, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-3.5 py-3.5",
                            i < activityFeed.length - 1
                              ? "border-b border-[#e0d0c5] dark:border-white/9"
                              : "",
                          )}
                        >
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className={cn(
                                "w-2.5 h-2.5 rounded-full mt-1 shrink-0",
                                dotClasses[item.dot],
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13.5px] font-medium text-[#1a1714] dark:text-[#f2f0eb] leading-[1.4]">
                              {item.text}
                            </div>
                            <div className="font-['DM_Mono',monospace] text-[8.5px] tracking-[0.08em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-50 mt-0.75">
                              {item.time}
                            </div>
                          </div>
                          <div
                            className={cn(
                              "w-8 h-8 rounded-[9px] border flex items-center justify-center shrink-0",
                              iconBoxClasses[item.iconColor],
                            )}
                          >
                            {item.icon}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AppFooter />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {isOwnView && bannerModalOpen && (
        <BannerModal
          open={bannerModalOpen}
          onClose={closeBannerModal}
          onApply={async (bannerDataUrl) => {
            if (!submitRateLimit.canStart("banner-upload")) {
              showToast("Please wait before uploading another banner.", "info");
              return;
            }

            closeBannerModal();
            showLoadingToast("Uploading banner…");

            try {
              const file = dataUrlToFile(
                bannerDataUrl,
                `profile-banner-${Date.now()}.png`,
              );

              await uploadBannerMutation.mutateAsync(file);
              await profileQuery.refetch();
              showToast("Banner updated!", "success");
            } catch {
              showToast("Unable to upload banner. Please try again.", "error");
            } finally {
              submitRateLimit.finish("banner-upload");
            }
          }}
          onToast={showToast}
        />
      )}

      {isOwnView && avatarModalOpen && (
        <AvatarCropModal
          open={avatarModalOpen}
          onClose={closeAvatarCropModal}
          onApply={async (avatarUrl) => {
            if (!submitRateLimit.canStart("avatar-upload")) {
              showToast(
                "Please wait before uploading another profile photo.",
                "info",
              );
              return;
            }

            closeAvatarCropModal();
            showLoadingToast("Uploading profile photo…");

            try {
              const file = dataUrlToFile(
                avatarUrl,
                `profile-avatar-${Date.now()}.png`,
              );

              await uploadAvatarMutation.mutateAsync(file);
              await profileQuery.refetch();
              showToast("Profile photo updated!", "success");
            } catch {
              showToast(
                "Unable to upload profile photo. Please try again.",
                "error",
              );
            } finally {
              submitRateLimit.finish("avatar-upload");
            }
          }}
          onToast={showToast}
        />
      )}

      {/* Edit Panel */}
      {isOwnView && editOpen && (
        <EditPanel
          profile={profile}
          open={editOpen}
          onClose={closeEditPanel}
          onSave={handleSave}
          isSaving={updateProfileMutation.isPending}
        />
      )}
    </div>
  );
}
