import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'

import { AppShellBoundary } from '../../../components/layout/AppShell'
import HeapTile from '../../../components/layout/HeapTile'

import { useProfile } from '../hooks/queries/useProfile'
import { useUpdateProfile } from '../hooks/mutations/useUpdateProfile'
import { useProfileStats } from '../hooks/queries/useProfileStats'
import { usePublishedTrackers } from '../hooks/queries/usePublishedTrackers'
import { useUploadAvatar } from '../hooks/mutations/useUploadAvatar'
import { useUploadBanner } from '../hooks/mutations/useUploadBanner'
import { useStreak } from '../../../hooks/progress/useStreak'
import { usePublicProfile } from '../hooks/public/usePublicProfile'
import { useSendFriendRequest } from '../../../hooks/friends/useSendFriendRequest'
import { useAuthStore } from '../../../store/useAuthStore'
import { useProfileStore } from '../store/useProfileStore'
import type { IPublishedTracker } from '../types/profile.types'

import AvatarCropModal from '../components/AvatarCropModal'
import BannerModal from '../components/BannerModal'
import EditProfilePanel from '../components/EditProfilePanel'
import ProfileToast from '../components/ProfileToast'
import { trackerThumbClasses } from '../constants/profile-style.constants'
import { useProfileToast } from '../hooks/ui/useProfileToast'
import { useSubmitRateLimit } from '../hooks/ui/useSubmitRateLimit'
import type { IProfileData } from '../types/profile.types'
import {
  dataUrlToFile,
  formatLocation,
  normalizeOptionalUrl,
  parseLocation,
} from '../utils/profile-data'
import { fallbackCopyText } from '../utils/profile-clipboard'
import {
  formatCompactNumber,
  formatProfileLevel,
} from '../utils/profile-formatters'

import ProfilePageSkeleton from '../components/ProfilePageSkeleton'
import ProfileHeader from '../components/ProfileHeader'
import ProfileDocumentStyles from '../components/ProfileDocumentStyles'
import ProfileStatsGrid from '../components/ProfileStatsGrid'
import ProfileAboutCard from '../components/ProfileAboutCard'
import PublishedTrackersSection, {
  type IPublishedTrackerCardViewModel,
} from '../components/PublishedTrackersSection'

/* ─── Main ProfilePage ─── */
export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const isPublicView = Boolean(username)
  const isOwnView = !isPublicView
  const showSidebar = isOwnView || isAuthenticated

  const editOpen = useProfileStore((state) => state.editPanelOpen)
  const openEditPanel = useProfileStore((state) => state.openEditPanel)
  const closeEditPanel = useProfileStore((state) => state.closeEditPanel)

  const bannerModalOpen = useProfileStore((state) => state.bannerModalOpen)
  const openBannerModal = useProfileStore((state) => state.openBannerModal)
  const closeBannerModal = useProfileStore((state) => state.closeBannerModal)

  const avatarModalOpen = useProfileStore((state) => state.avatarCropModalOpen)
  const openAvatarCropModal = useProfileStore(
    (state) => state.openAvatarCropModal,
  )
  const closeAvatarCropModal = useProfileStore(
    (state) => state.closeAvatarCropModal,
  )

  const selectedHeatmapYear = useProfileStore(
    (state) => state.selectedHeatmapYear,
  )
  const setSelectedHeatmapYear = useProfileStore(
    (state) => state.setSelectedHeatmapYear,
  )

  const {
    message: toastMsg,
    visible: toastVisible,
    tone: toastTone,
    show: showToast,
    showLoading: showLoadingToast,
  } = useProfileToast()

  const submitRateLimit = useSubmitRateLimit(1800)

  const profileQuery = useProfile({ enabled: isOwnView })
  const statsQuery = useProfileStats({ enabled: isOwnView })
  const trackersQuery = usePublishedTrackers(
    { page: 1, limit: 3 },
    { enabled: isOwnView },
  )
  const streakQuery = useStreak(selectedHeatmapYear, { enabled: isOwnView })

  const publicProfileQuery = usePublicProfile(
    username ?? '',
    { page: 1, limit: 3, sort: 'publishedAt' },
    { enabled: isPublicView },
  )

  const activeProfileData = isPublicView
    ? publicProfileQuery.data
    : profileQuery.data

  const shareUsername = activeProfileData?.user?.username || username || ''

  const profileShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''

    if (!shareUsername) {
      return window.location.href
    }

    return `${window.location.origin}/profile/${shareUsername}`
  }, [shareUsername])

  const copyProfileLink = async () => {
    if (!profileShareUrl) {
      showToast('Profile URL is unavailable.', 'error')
      return
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileShareUrl)
      } else {
        const copied = fallbackCopyText(profileShareUrl)

        if (!copied) {
          throw new Error('Clipboard fallback failed')
        }
      }

      showToast('Profile URL copied!', 'success')
    } catch {
      try {
        const copied = fallbackCopyText(profileShareUrl)

        if (!copied) {
          throw new Error('Clipboard fallback failed')
        }

        showToast('Profile URL copied!', 'success')
      } catch {
        showToast('Unable to copy profile URL.', 'error')
      }
    }
  }

  const activeStats = isPublicView
    ? (publicProfileQuery.data?.stats ?? undefined)
    : statsQuery.data

  const activeStreak = isPublicView
    ? (publicProfileQuery.data?.streak ?? undefined)
    : streakQuery.data

  const activeTrackerData = isPublicView
    ? publicProfileQuery.data?.publishedTrackers
    : trackersQuery.data

  const updateProfileMutation = useUpdateProfile()
  const uploadAvatarMutation = useUploadAvatar()
  const uploadBannerMutation = useUploadBanner()
  const sendFriendRequestMutation = useSendFriendRequest()
  const [friendRequestSent, setFriendRequestSent] = useState(false)

  const profile = useMemo<IProfileData | null>(() => {
    if (!activeProfileData) return null

    const parsedLocation = parseLocation(activeProfileData.profile.location)

    return {
      name:
        activeProfileData.profile.fullName ||
        activeProfileData.user.fullName ||
        'Imminiq Learner',
      username: activeProfileData.user.username || '',
      profession: activeProfileData.profile.headline || '',
      bio: activeProfileData.profile.bio || '',
      city: parsedLocation.city,
      state: parsedLocation.state,
      country: parsedLocation.country,
      postal: parsedLocation.postal,
      skills: activeProfileData.profile.skills ?? [],
      avatarUrl: activeProfileData.user.avatarUrl || null,
      bannerDataUrl: activeProfileData.profile.profileBannerUrl || null,
      githubUrl: activeProfileData.profile.githubUrl || '',
      linkedinUrl: activeProfileData.profile.linkedinUrl || '',
      portfolioUrl: activeProfileData.profile.portfolioUrl || '',
    }
  }, [activeProfileData])

  const locationStr = profile
    ? [profile.city, profile.state, profile.country]
        .filter(Boolean)
        .join(', ') + (profile.postal ? ` — ${profile.postal}` : '')
    : ''

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (avatarModalOpen) closeAvatarCropModal()
      else if (bannerModalOpen) closeBannerModal()
      else if (editOpen) closeEditPanel()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    avatarModalOpen,
    bannerModalOpen,
    closeAvatarCropModal,
    closeBannerModal,
    closeEditPanel,
    editOpen,
  ])

  const redirectGuestToLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
  }

  const handleSendFriendRequest = async () => {
    if (!isAuthenticated) {
      redirectGuestToLogin()
      return
    }

    const receiverId = activeProfileData?.user?._id

    if (!receiverId) {
      showToast('Unable to find this user.', 'error')
      return
    }

    if (!submitRateLimit.canStart('friend-request')) {
      showToast('Please wait before sending another request.', 'info')
      return
    }

    showLoadingToast('Sending friend request…')

    try {
      await sendFriendRequestMutation.mutateAsync({
        receiverId,
      })

      setFriendRequestSent(true)
      showToast('Friend request sent!', 'success')
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ||
          'Unable to send friend request right now.'
        : 'Unable to send friend request right now.'

      showToast(message, 'error')
    } finally {
      submitRateLimit.finish('friend-request')
    }
  }

  const handleOpenChats = () => {
    if (!isAuthenticated) {
      redirectGuestToLogin()
      return
    }

    navigate('/chats')
  }

  const handleSave = async (data: Partial<IProfileData>) => {
    if (!isOwnView) return

    if (!submitRateLimit.canStart('profile-save')) {
      showToast('Please wait before saving profile again.', 'info')
      return
    }

    closeEditPanel()
    showLoadingToast('Saving profile changes…')

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
        githubUrl: normalizeOptionalUrl(data.githubUrl ?? ''),
        linkedinUrl: normalizeOptionalUrl(data.linkedinUrl ?? ''),
        portfolioUrl: normalizeOptionalUrl(data.portfolioUrl ?? ''),
      })

      await profileQuery.refetch()
      showToast('Profile saved!', 'success')
    } catch {
      showToast('Unable to save profile. Please try again.', 'error')
    } finally {
      submitRateLimit.finish('profile-save')
    }
  }

  const trackers: IPublishedTrackerCardViewModel[] = (activeTrackerData?.items ?? []).map(
    (tracker: IPublishedTracker, index: number) => ({
      title: tracker.title,
      desc: tracker.description || 'Published tracker',
      rating: Number(tracker.ratingAverage ?? 0),
      clones: formatCompactNumber(tracker.cloneCount),
      thumbClass: trackerThumbClasses[index % trackerThumbClasses.length],
      slug: tracker.slug,
    }),
  )

  const profileLevelLabel = formatProfileLevel(
    activeStats?.studentLevel ?? activeProfileData?.user.level,
  )

  const accountCreatedAt = activeProfileData?.user.createdAt ?? null

  const activeProfileQueryError = isPublicView
    ? publicProfileQuery.isError
    : profileQuery.isError

  const activeProfileQueryLoading = isPublicView
    ? publicProfileQuery.isLoading
    : profileQuery.isLoading

  if (activeProfileQueryError) {
    return (
      <AppShellBoundary
        showSidebar={showSidebar}
        isGuest={isPublicView && !isAuthenticated}
      >
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4">
          <div className="max-w-105 rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-6 py-5 text-center shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
            <div className="font-ui text-[20px] font-extrabold">
              Profile unavailable
            </div>
            <p className="mt-2 text-[13px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
              {isPublicView
                ? 'This public profile is unavailable or could not be loaded right now.'
                : 'We could not load your profile right now. Refresh the page after the backend is running.'}
            </p>
          </div>
        </div>
      </AppShellBoundary>
    )
  }

  if (activeProfileQueryLoading || !profile) {
    return <ProfilePageSkeleton showSidebar={showSidebar} />
  }

  return (
    <AppShellBoundary
      showSidebar={showSidebar}
      isGuest={isPublicView && !isAuthenticated}
      viewer={{
        name: profile.name,
        initials: profile.name
          .split(' ')
          .map((word) => word[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        avatarUrl: profile.avatarUrl,
        streak: activeStreak?.currentStreak ?? activeStats?.streakCount ?? 0,
        levelLabel: profileLevelLabel,
      }}
    >
      <ProfileDocumentStyles />

      <ProfileToast message={toastMsg} visible={toastVisible} tone={toastTone} />

      <div className="profile-page flex min-w-0 flex-1 flex-col overflow-x-clip">
        <div className="mx-auto mt-5.5 w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
          <ProfileHeader
            profile={profile}
            stats={activeStats}
            streak={activeStreak}
            levelLabel={profileLevelLabel}
            location={locationStr}
            isOwnView={isOwnView}
            isPublicView={isPublicView}
            friendRequestSent={friendRequestSent}
            isSendingFriendRequest={sendFriendRequestMutation.isPending}
            onChangeBanner={openBannerModal}
            onChangeAvatar={openAvatarCropModal}
            onEdit={openEditPanel}
            onSendFriendRequest={handleSendFriendRequest}
            onMessage={handleOpenChats}
            onCopyProfileLink={copyProfileLink}
          />

          <div className="flex flex-col gap-6 py-6 max-[640px]:py-5 max-[900px]:pb-[calc(80px+env(safe-area-inset-bottom,0))]">
            <ProfileStatsGrid stats={activeStats} streak={activeStreak} />

            <ProfileAboutCard
              profile={profile}
              onMissingLink={(label) =>
                showToast(`${label} link has not been added yet.`)
              }
            />

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

            <PublishedTrackersSection
              trackers={trackers}
              onClone={() => showToast('Tracker cloned!')}
              onOpen={(tracker) => showToast(`Opening ${tracker.title}…`)}
            />
          </div>
        </div>
      </div>

      {isOwnView && bannerModalOpen && (
        <BannerModal
          open={bannerModalOpen}
          onClose={closeBannerModal}
          onApply={async (bannerDataUrl) => {
            if (!submitRateLimit.canStart('banner-upload')) {
              showToast('Please wait before uploading another banner.', 'info')
              return
            }

            closeBannerModal()
            showLoadingToast('Uploading banner…')

            try {
              const file = dataUrlToFile(
                bannerDataUrl,
                `profile-banner-${Date.now()}.png`,
              )

              await uploadBannerMutation.mutateAsync(file)
              await profileQuery.refetch()
              showToast('Banner updated!', 'success')
            } catch {
              showToast('Unable to upload banner. Please try again.', 'error')
            } finally {
              submitRateLimit.finish('banner-upload')
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
            if (!submitRateLimit.canStart('avatar-upload')) {
              showToast(
                'Please wait before uploading another profile photo.',
                'info',
              )
              return
            }

            closeAvatarCropModal()
            showLoadingToast('Uploading profile photo…')

            try {
              const file = dataUrlToFile(
                avatarUrl,
                `profile-avatar-${Date.now()}.png`,
              )

              await uploadAvatarMutation.mutateAsync(file)
              await profileQuery.refetch()
              showToast('Profile photo updated!', 'success')
            } catch {
              showToast(
                'Unable to upload profile photo. Please try again.',
                'error',
              )
            } finally {
              submitRateLimit.finish('avatar-upload')
            }
          }}
          onToast={showToast}
        />
      )}

      {isOwnView && editOpen && (
        <EditProfilePanel
          profile={profile}
          open={editOpen}
          onClose={closeEditPanel}
          onSave={handleSave}
          isSaving={updateProfileMutation.isPending}
        />
      )}
    </AppShellBoundary>
  )
}
