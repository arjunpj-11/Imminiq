import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'
import HeapTile from '../../../components/layout/HeapTile'
import PageLoadingScreen from '../../../components/ui/PageLoadingScreen'

import { useProfile } from '../hooks/useProfile'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { useProfileStats } from '../hooks/useProfileStats'
import { useProfileBadges } from '../hooks/useProfileBadges'
import { usePublishedTrackers } from '../hooks/usePublishedTrackers'
import { useUploadAvatar } from '../hooks/useUploadAvatar'
import { useUploadBanner } from '../hooks/useUploadBanner'
import { useStreak } from '../../../hooks/progress/useStreak'
import { useRecentActivity } from '../../../hooks/activity/useRecentActivity'
import { usePublicProfile } from '../hooks/public/usePublicProfile'
import { useSendFriendRequest } from '../../../hooks/friends/useSendFriendRequest'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { useProfileStore } from '../store/useProfileStore'
import type { ActivityFeedItem, ProfileBadge, PublishedTracker } from '../types/profile.types'

import AvatarCropModal from '../components/AvatarCropModal'
import BannerModal from '../components/BannerModal'
import EditProfilePanel from '../components/EditProfilePanel'
import ProfileToast from '../components/ProfileToast'
import StatCard from '../components/StatCard'
import TrackerCard from '../components/TrackerCard'
import { badgeColorByType, badgeEmojiByType, badgeTierByType, badgeToneClasses } from '../constants/profile-badges.constants'
import { dotClasses, iconBoxClasses, trackerThumbClasses } from '../constants/profile-style.constants'
import { useProfileToast } from '../hooks/useProfileToast'
import { useSubmitRateLimit } from '../hooks/useSubmitRateLimit'
import type { ActivityVisualViewModel, ProfileData, ProfileBadgeViewModel } from '../types/profile.types'
import { dataUrlToFile, formatLocation, normalizeOptionalUrl, parseLocation } from '../utils/profile-data'
import { fallbackCopyText } from '../utils/profile-clipboard'
import { formatCompactNumber, formatProfileLevel, formatRelativeTime } from '../utils/profile-formatters'
import { cn } from '../utils/profile-ui.utils'

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
  } = useProfileToast();

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

  const shareUsername =
    activeProfileData?.user?.username || username || "";

  const profileShareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";

    if (!shareUsername) {
      return window.location.href;
    }

    return `${window.location.origin}/profile/${shareUsername}`;
  }, [shareUsername]);

  const copyProfileLink = async () => {
    if (!profileShareUrl) {
      showToast("Profile URL is unavailable.", "error");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileShareUrl);
      } else {
        const copied = fallbackCopyText(profileShareUrl);

        if (!copied) {
          throw new Error("Clipboard fallback failed");
        }
      }

      showToast("Profile URL copied!", "success");
    } catch {
      try {
        const copied = fallbackCopyText(profileShareUrl);

        if (!copied) {
          throw new Error("Clipboard fallback failed");
        }

        showToast("Profile URL copied!", "success");
      } catch {
        showToast("Unable to copy profile URL.", "error");
      }
    }
  };

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
  const sendFriendRequestMutation = useSendFriendRequest();
const [friendRequestSent, setFriendRequestSent] = useState(false);

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


  const handleSendFriendRequest = async () => {
  if (!isAuthenticated) {
    redirectGuestToLogin();
    return;
  }

  const receiverId = activeProfileData?.user?._id;

  if (!receiverId) {
    showToast("Unable to find this user.", "error");
    return;
  }

  if (!submitRateLimit.canStart("friend-request")) {
    showToast("Please wait before sending another request.", "info");
    return;
  }

  showLoadingToast("Sending friend request…");

  try {
    await sendFriendRequestMutation.mutateAsync({
      receiverId,
    });

    setFriendRequestSent(true);
    showToast("Friend request sent!", "success");
   } catch (error: unknown) {
  const message = isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message ||
      "Unable to send friend request right now."
    : "Unable to send friend request right now.";

  showToast(message, "error");
} finally {
    submitRateLimit.finish("friend-request");
  }
};

const handleOpenChats = () => {
  if (!isAuthenticated) {
    redirectGuestToLogin();
    return;
  }

  navigate("/chats");
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


  const trackers: Array<{
    title: string
    desc: string
    rating: number
    clones: string
    thumbClass: string
    slug: string
  }> = (activeTrackerData?.items ?? []).map(
    (tracker: PublishedTracker, index: number) => ({
      title: tracker.title,
      desc: tracker.description || "Published tracker",
      rating: Number(tracker.ratingAverage ?? 0),
      clones: formatCompactNumber(tracker.cloneCount),
      thumbClass: trackerThumbClasses[index % trackerThumbClasses.length],
      slug: tracker.slug,
    }),
  );

  const activityVisual = (item: ActivityFeedItem): ActivityVisualViewModel => {
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

  const activityFeed: Array<ActivityVisualViewModel & {
    text: string
    time: string
  }> = activeActivityItems.map((item: ActivityFeedItem) => {
    const visual = activityVisual(item);

    return {
      ...visual,
      text: item.description,
      time: formatRelativeTime(item.createdAt),
    };
  });

  const badges: ProfileBadgeViewModel[] = activeBadgeItems.map(
    (badge: ProfileBadge): ProfileBadgeViewModel => ({
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
      <PageLoadingScreen
        eyebrow="Loading Profile"
        title="Preparing your profile"
        description="Fetching your details, progress, and profile activity."
      />
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
      <ProfileToast message={toastMsg} visible={toastVisible} tone={toastTone} />

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
  onClick={handleSendFriendRequest}
  disabled={
    sendFriendRequestMutation.isPending ||
    friendRequestSent
  }
  className={cn(
    "inline-flex items-center gap-1.75 px-5.5 py-2.5 rounded-[10px] text-[13px] font-bold transition max-[640px]:flex-[1_1_150px] max-[640px]:justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70",
    friendRequestSent
      ? "border-[1.5px] border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]"
      : "bg-[#b84c2b] dark:bg-[#e8816a] text-[#fdf8f5] dark:text-[#141412] hover:-translate-y-px hover:bg-[#963d22] dark:hover:bg-[#d4705a] hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)]",
  )}
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

  {sendFriendRequestMutation.isPending
    ? "Sending..."
    : friendRequestSent
      ? "Request Sent"
      : "Send Request"}
</button>

                      <button
  type="button"
  onClick={handleOpenChats}
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
                      onClick={copyProfileLink}
                      className="inline-flex items-center gap-1.75 px-4.5 py-2.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] dark:border-white/9 text-[#1a1714] dark:text-[#f2f0eb] text-[13px] font-semibold transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] max-[640px]:flex-[1_1_170px] max-[640px]:justify-center whitespace-nowrap"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Copy Profile URL
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
                   <button
  type="button"
  onClick={() => navigate("/community")}
  className="font-['DM_Mono',monospace] text-[10px] tracking-widest uppercase text-[#b84c2b] dark:text-[#e8816a] hover:opacity-70 transition"
>
  View All →
</button>
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
        <EditProfilePanel
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
