// import { useState, type Dispatch, type SetStateAction } from 'react'
// import { useNavigate } from 'react-router-dom'

// import Sidebar from '../../../components/layout/Sidebar'
// import TopBar from '../../../components/layout/TopBar'
// import AppFooter from '../../../components/layout/Footer'
// import BottomNav from '../../../components/layout/BottomNav'

// // ── Helpers ───────────────────────────────────────────────────────────────

// const cn = (...classes: Array<string | false | null | undefined>) =>
//   classes.filter(Boolean).join(' ')

// const getInitials = (name: string) =>
//   name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

// const formatLevelLabel = (isPremium: boolean) =>
//   isPremium ? 'Imminiq Pro' : 'Free Scholar'

// // ── Types ─────────────────────────────────────────────────────────────────

// type LeaderboardScope   = 'Global' | 'Friends' | 'Weekly'
// type LeaderboardSection = 'students' | 'trainers'

// interface LeaderEntry {
//   rank: number
//   name: string
//   handle: string
//   track: string
//   xp: number
//   streak: number
//   trend: number
//   avatarColor: string
//   initials: string
//   isMe?: boolean
// }

// interface TopThreeEntry {
//   rank: 1 | 2 | 3
//   name: string
//   xp: number
//   streakDays: number
//   avatarColor: string
//   initials: string
//   isChampion?: boolean
// }

// interface StreakChampion {
//   initials: string
//   name: string
//   streak: number
//   avatarColor: string
// }

// interface DashboardUser {
//   fullName: string
//   avatarUrl: string | null
//   isPremium: boolean
// }

// interface DashboardSummaryData {
//   user: DashboardUser
//   streak: { current: number }
// }

// // ── SVG Icon system ───────────────────────────────────────────────────────
// // All icons are hand-crafted SVGs — no emojis anywhere

// const Icon = {
//   Fire: ({ size = 14, className = '' }: { size?: number; className?: string }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
//       <path d="M12 2s-4.5 4.5-4.5 9a4.5 4.5 0 0 0 9 0C16.5 6.5 12 2 12 2Z" fill="currentColor" />
//       <path d="M9.5 14.5C9.5 13.12 10.62 12 12 12s2.5 1.12 2.5 2.5c0 .83-.4 1.56-1.01 2.02" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".5" />
//     </svg>
//   ),
//   TrendUp: ({ size = 12 }: { size?: number }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M3 17l5-5 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//       <path d="M14 8h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   ),
//   TrendDown: ({ size = 12 }: { size?: number }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M3 7l5 5 4-4 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//       <path d="M14 16h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   ),
//   TrendFlat: () => (
//     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//     </svg>
//   ),
//   Search: () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
//       <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
//     </svg>
//   ),
//   ChevronDown: () => (
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   ),
//   Sparkles: ({ size = 14 }: { size?: number }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" fill="currentColor" />
//       <path d="M5 15l.9 3.1L9 19l-3.1.9L5 23l-.9-3.1L1 19l3.1-.9L5 15Z" fill="currentColor" opacity=".5" />
//       <path d="M19 2l.6 2.4L22 5l-2.4.6L19 8l-.6-2.4L16 5l2.4-.6L19 2Z" fill="currentColor" opacity=".5" />
//     </svg>
//   ),
//   Trophy: ({ size = 14 }: { size?: number }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//       <path d="M6 5h12v5a6 6 0 01-12 0V5z" stroke="currentColor" strokeWidth="1.5" />
//       <path d="M12 16v4M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//     </svg>
//   ),
//   Star: ({ size = 13 }: { size?: number }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
//       <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
//     </svg>
//   ),
//   // Replaces student emoji
//   GraduationCap: ({ size = 15 }: { size?: number }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M12 3L1 9l11 6 9-4.91V17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
//       <path d="M5 12.5V17c0 0 2.5 3 7 3s7-3 7-3v-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   ),
//   // Replaces trainer emoji
//   ChalkBoard: ({ size = 15 }: { size?: number }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <rect x="2" y="3" width="20" height="13" rx="1" stroke="currentColor" strokeWidth="1.75" />
//       <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
//       <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//     </svg>
//   ),
//   // Rank crown for #1
//   Crown: ({ size = 14 }: { size?: number }) => (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M3 17h18l-2-9-4.5 4.5L12 5l-2.5 7.5L5 8l-2 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" opacity=".15" />
//       <path d="M3 17h18l-2-9-4.5 4.5L12 5l-2.5 7.5L5 8l-2 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
//       <path d="M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
//     </svg>
//   ),
//   // Medal for podium
//   Medal: ({ rank }: { rank: 1 | 2 | 3 }) => {
//     const colors: Record<number, { ring: string; fill: string; text: string }> = {
//       1: { ring: '#c49a2c', fill: '#fdf0c2', text: '#7c5a1e' },
//       2: { ring: '#9b9a92', fill: '#f0efeb', text: '#4a4a42' },
//       3: { ring: '#b87333', fill: '#f5e8d8', text: '#6b3a1e' },
//     }
//     const c = colors[rank]
//     return (
//       <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
//         <circle cx="11" cy="11" r="10" fill={c.fill} stroke={c.ring} strokeWidth="1.5" />
//         <text x="11" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill={c.text} fontFamily="DM Mono, monospace">
//           {rank}
//         </text>
//       </svg>
//     )
//   },
//   // Compete live dot
//   LiveDot: () => (
//     <svg width="7" height="7" viewBox="0 0 7 7" aria-hidden="true">
//       <circle cx="3.5" cy="3.5" r="3.5" fill="#4caf7d" />
//     </svg>
//   ),
//   // Divider rule
//   ChevronRight: () => (
//     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   ),
// }

// // ── Noise overlay ─────────────────────────────────────────────────────────

// const NoiseOverlay = () => (
//   <div
//     className="pointer-events-none fixed inset-0 z-0 opacity-[0.022] dark:opacity-[0.04]"
//     style={{
//       backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
//       backgroundSize: '180px',
//     }}
//   />
// )

// // ── Skeleton ──────────────────────────────────────────────────────────────

// const SkeletonBlock = ({ className }: { className?: string }) => (
//   <div className={cn('animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10', className)} />
// )

// const RowSkeleton = () => (
//   <div className="animate-pulse flex items-center gap-4 px-5 py-3.5 border-b border-[#e8ddd6] dark:border-white/8 last:border-b-0">
//     <div className="w-8 h-3 rounded bg-[#e8ddd6] dark:bg-white/10 flex-shrink-0" />
//     <div className="h-9 w-9 rounded-full bg-[#e8ddd6] dark:bg-white/10 flex-shrink-0" />
//     <div className="flex-1 space-y-1.5 min-w-0">
//       <div className="h-3.5 w-1/3 rounded bg-[#e8ddd6] dark:bg-white/10" />
//       <div className="h-3 w-1/4 rounded bg-[#e8ddd6] dark:bg-white/10" />
//     </div>
//     <div className="h-3 w-12 rounded bg-[#e8ddd6] dark:bg-white/10" />
//     <div className="h-3 w-8 rounded bg-[#e8ddd6] dark:bg-white/10" />
//   </div>
// )

// const PageSkeleton = ({
//   sidebarOpen, sidebarCollapsed, setSidebarOpen, setSidebarCollapsed,
// }: {
//   sidebarOpen: boolean
//   sidebarCollapsed: boolean
//   setSidebarOpen: (v: boolean) => void
//   setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
// }) => (
//   <div
//     className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]"
//     role="status" aria-live="polite" aria-label="Loading leaderboard"
//   >
//     <NoiseOverlay />
//     <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
//       <Sidebar
//         mobileOpen={sidebarOpen}
//         collapsed={sidebarCollapsed}
//         onCloseMobile={() => setSidebarOpen(false)}
//         onToggleCollapsed={() => setSidebarCollapsed((v) => { const n = !v; localStorage.setItem('imminiq_sb', n ? 'closed' : 'open'); return n })}
//       />
//       <main className={cn('flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300', sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56')}>
//         <TopBar onMenuClick={() => setSidebarOpen(true)} streakDays={0} userName="Loading" userInitials="IM" userLevel="Loading" isGuest={false} />
//         <div className="flex min-w-0 flex-1 flex-col">
//           <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-32">
//             <div className="flex flex-wrap items-start justify-between gap-4">
//               <div className="space-y-3 flex-1 min-w-0">
//                 <SkeletonBlock className="h-4 w-16" />
//                 <SkeletonBlock className="h-10 w-72 rounded-2xl" />
//                 <SkeletonBlock className="h-4 w-96" />
//               </div>
//               <SkeletonBlock className="h-20 w-56 rounded-[18px]" />
//             </div>
//             <div className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] dark:border-white/9 dark:bg-[#1e1c19]">
//               {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
//             </div>
//           </div>
//           <AppFooter />
//         </div>
//       </main>
//     </div>
//     <BottomNav />
//   </div>
// )

// // ── Avatar ────────────────────────────────────────────────────────────────

// const Avatar = ({
//   initials, color, size = 'md',
// }: {
//   initials: string; color: string; size?: 'sm' | 'md' | 'lg' | 'xl'
// }) => {
//   const sizes = {
//     sm:  'h-7 w-7 text-[10px]',
//     md:  'h-[38px] w-[38px] text-[12px]',
//     lg:  'h-[52px] w-[52px] text-[15px]',
//     xl:  'h-[76px] w-[76px] text-[21px]',
//   }
//   return (
//     <div
//       className={cn(
//         'flex flex-shrink-0 items-center justify-center rounded-full font-[700] tracking-tight text-white',
//         "font-['DM_Mono',monospace]",
//         sizes[size],
//       )}
//       style={{ background: color }}
//     >
//       {initials}
//     </div>
//   )
// }

// // ── Trend badge ───────────────────────────────────────────────────────────

// const TrendBadge = ({ trend }: { trend: number }) => {
//   if (trend > 0) return (
//     <span className="inline-flex items-center gap-0.5 text-[#2d6a47] dark:text-[#5cc98a] font-['DM_Mono',monospace] text-[11px] font-bold tabular-nums">
//       <Icon.TrendUp /> {trend}
//     </span>
//   )
//   if (trend < 0) return (
//     <span className="inline-flex items-center gap-0.5 text-[#b84c2b] dark:text-[#e8816a] font-['DM_Mono',monospace] text-[11px] font-bold tabular-nums">
//       <Icon.TrendDown /> {Math.abs(trend)}
//     </span>
//   )
//   return (
//     <span className="inline-flex items-center gap-0.5 text-[#9b9a92] font-['DM_Mono',monospace] text-[11px] tabular-nums">
//       <Icon.TrendFlat /> 0
//     </span>
//   )
// }

// // ── Track badge ───────────────────────────────────────────────────────────

// const TRACK_COLORS: Record<string, string> = {
//   Logic:     'bg-[rgba(184,76,43,0.07)] text-[#b84c2b] border-[rgba(184,76,43,0.18)] dark:text-[#e8816a]',
//   History:   'bg-[rgba(45,106,71,0.07)] text-[#2d6a47] border-[rgba(45,106,71,0.18)] dark:text-[#5cc98a]',
//   Astrology: 'bg-[rgba(124,90,30,0.07)] text-[#7c5a1e] border-[rgba(124,90,30,0.2)] dark:text-[#c49a2c]',
//   CompSci:   'bg-[rgba(184,76,43,0.07)] text-[#b84c2b] border-[rgba(184,76,43,0.18)] dark:text-[#e8816a]',
//   Economics: 'bg-[rgba(45,106,71,0.07)] text-[#2d6a47] border-[rgba(45,106,71,0.18)] dark:text-[#5cc98a]',
//   Physics:   'bg-[rgba(124,90,30,0.07)] text-[#7c5a1e] border-[rgba(124,90,30,0.2)] dark:text-[#c49a2c]',
//   Biology:   'bg-[rgba(45,106,71,0.07)] text-[#2d6a47] border-[rgba(45,106,71,0.18)] dark:text-[#5cc98a]',
//   Design:    'bg-[rgba(184,76,43,0.07)] text-[#b84c2b] border-[rgba(184,76,43,0.18)] dark:text-[#e8816a]',
// }

// const TrackBadge = ({ track }: { track: string }) => (
//   <span className={cn(
//     "font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.1em] px-2 py-[2.5px] rounded-full border leading-none",
//     TRACK_COLORS[track] ?? 'bg-[rgba(26,23,20,0.05)] text-[#9b9a92] border-[#e0d0c5] dark:border-white/9',
//   )}>
//     {track}
//   </span>
// )

// // ── Podium ─────────────────────────────────────────────────────────────────

// const PodiumCard = ({
//   entry, section,
// }: {
//   entry: TopThreeEntry; section: LeaderboardSection
// }) => {
//   const isFirst     = entry.rank === 1
//   const accentColor = section === 'students' ? '#b84c2b' : '#2d6a47'
//   const darkAccent  = section === 'students' ? '#e8816a' : '#5cc98a'

//   return (
//     <div className={cn(
//       'group relative flex flex-col items-center rounded-[20px] border-[1.5px] bg-[#fdf8f5] px-5 pb-6 pt-6 transition-all duration-200 dark:bg-[#1e1c19]',
//       isFirst
//         ? 'border-[rgba(184,76,43,0.30)] shadow-[0_8px_32px_rgba(184,76,43,0.09)] dark:border-[rgba(232,129,106,0.24)]'
//         : 'border-[#e0d0c5] dark:border-white/9',
//     )}>

//       {/* #1 crown badge floats above */}
//       {isFirst && (
//         <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
//           <span
//             className="inline-flex items-center gap-1.5 rounded-full border px-3 py-[3.5px] font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.13em] text-white whitespace-nowrap"
//             style={{ background: accentColor, borderColor: `${accentColor}44` }}
//           >
//             <Icon.Crown size={11} />
//             {section === 'students' ? 'Champion' : 'Top Trainer'}
//           </span>
//         </div>
//       )}

//       {/* Avatar + medal badge */}
//       <div className="relative mb-3 mt-1.5">
//         <Avatar
//           initials={entry.initials}
//           color={entry.avatarColor}
//           size={isFirst ? 'xl' : 'lg'}
//         />
//         {/* Rank medal sits on bottom-right of avatar */}
//         <div className="absolute -bottom-2 -right-2 rounded-full border-[2.5px] border-[#fdf8f5] dark:border-[#1e1c19]">
//           <Icon.Medal rank={entry.rank} />
//         </div>
//       </div>

//       {/* Name */}
//       <h3 className={cn(
//         "font-['Playfair_Display',serif] font-[900] leading-[1.2] text-center text-[#1a1714] dark:text-[#f2f0eb] mt-1",
//         isFirst ? 'text-[19px]' : 'text-[14.5px]',
//       )}>
//         {entry.name}
//       </h3>

//       {/* XP */}
//       <span
//         className="mt-1 font-['DM_Mono',monospace] text-[12px] font-bold tabular-nums"
//         style={{ color: accentColor }}
//       >
//         {entry.xp.toLocaleString()} XP
//       </span>

//       {/* Streak */}
//       {isFirst ? (
//         <div
//           className="mt-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-['DM_Mono',monospace] text-[9.5px] font-bold uppercase tracking-[0.06em]"
//           style={{
//             color: accentColor,
//             background: `${accentColor}12`,
//             borderColor: `${accentColor}30`,
//           }}
//         >
//           <Icon.Fire size={11} />
//           {entry.streakDays}-day streak
//         </div>
//       ) : (
//         <div className="mt-2 flex items-center gap-1 text-[11px] text-[#9b9a92]">
//           <Icon.Fire size={11} className="text-[#9b9a92]" />
//           {entry.streakDays} days
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Divider ───────────────────────────────────────────────────────────────

// const SectionDivider = ({ label }: { label: string }) => (
//   <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[#e8ddd6] dark:border-white/8 bg-[rgba(26,23,20,0.018)] dark:bg-white/[0.018]">
//     <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] select-none">
//       {label}
//     </span>
//     <div className="flex-1 h-px bg-[#e8ddd6] dark:bg-white/8" />
//   </div>
// )

// // ── Table header ──────────────────────────────────────────────────────────

// const TableHeader = ({ isStudents }: { isStudents: boolean }) => (
//   <div className="flex items-center gap-4 px-5 py-[9px] border-b border-[#e8ddd6] dark:border-white/8 bg-[rgba(26,23,20,0.02)] dark:bg-white/[0.02]">
//     <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] w-9 text-center flex-shrink-0">
//       #
//     </span>
//     {/* Avatar placeholder col */}
//     <span className="w-[38px] flex-shrink-0" />
//     <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] flex-1">
//       {isStudents ? 'Scholar' : 'Trainer'}
//     </span>
//     <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] w-[68px] text-right flex-shrink-0 hidden min-[480px]:block">
//       Score
//     </span>
//     <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] w-14 text-right flex-shrink-0 hidden min-[560px]:block">
//       Streak
//     </span>
//     <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] w-10 text-right flex-shrink-0">
//       Δ
//     </span>
//   </div>
// )

// // ── Leaderboard row ───────────────────────────────────────────────────────

// const LeaderRow = ({ entry }: { entry: LeaderEntry }) => (
//   <div className={cn(
//     'flex items-center gap-4 px-5 py-[11px] border-b border-[#ece3db] last:border-b-0 transition-colors duration-100 dark:border-white/[0.06]',
//     entry.isMe
//       ? 'bg-[rgba(184,76,43,0.032)] dark:bg-[rgba(232,129,106,0.045)]'
//       : 'hover:bg-[rgba(26,23,20,0.015)] dark:hover:bg-white/[0.015]',
//   )}>

//     {/* Rank */}
//     <span className={cn(
//       "font-['DM_Mono',monospace] text-[12.5px] font-bold w-9 flex-shrink-0 text-center tabular-nums",
//       entry.isMe ? 'text-[#b84c2b] dark:text-[#e8816a]' : 'text-[#c4b8b0] dark:text-[#5a5550]',
//     )}>
//       {entry.rank}
//     </span>

//     {/* Avatar */}
//     <Avatar initials={entry.initials} color={entry.avatarColor} size="md" />

//     {/* Info */}
//     <div className="flex-1 min-w-0">
//       <div className="flex flex-wrap items-center gap-1.5">
//         <span className={cn(
//           'font-semibold text-[13px] truncate',
//           entry.isMe
//             ? 'text-[#1a1714] dark:text-[#f2f0eb]'
//             : 'text-[#2a2420] dark:text-[#dedad5]',
//         )}>
//           {entry.name}
//           {entry.isMe && (
//             <span className="ml-1.5 font-['DM_Mono',monospace] text-[10px] font-normal text-[#b84c2b] dark:text-[#e8816a]">
//               you
//             </span>
//           )}
//         </span>
//         <TrackBadge track={entry.track} />
//       </div>
//       <div className="text-[11px] text-[#b0a097] dark:text-[#6b6460] mt-[1px]">{entry.handle}</div>
//     </div>

//     {/* Score */}
//     <div className="text-right flex-shrink-0 w-[68px] hidden min-[480px]:block">
//       <div className="font-['DM_Mono',monospace] text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb] tabular-nums">
//         {entry.xp.toLocaleString()}
//       </div>
//       <div className="text-[9px] text-[#b0a097] dark:text-[#6b6460] uppercase tracking-wider mt-[1px]">XP</div>
//     </div>

//     {/* Streak */}
//     <div className="flex items-center justify-end gap-1 text-[11px] text-[#b0a097] dark:text-[#6b6460] flex-shrink-0 w-14 hidden min-[560px]:flex">
//       <Icon.Fire size={11} />
//       {entry.streak}d
//     </div>

//     {/* Trend */}
//     <div className="flex-shrink-0 w-10 text-right">
//       <TrendBadge trend={entry.trend} />
//     </div>
//   </div>
// )

// // ── My rank bar ───────────────────────────────────────────────────────────

// const MyRankBar = ({ entry }: { entry: LeaderEntry }) => (
//   <div className="flex items-center gap-4 px-5 py-4 rounded-[16px] border-[1.5px] border-[rgba(184,76,43,0.2)] bg-[#fdf8f5] dark:border-[rgba(232,129,106,0.2)] dark:bg-[#1e1c19]">
//     {/* Big rank */}
//     <div className="flex-shrink-0 w-[52px]">
//       <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#b0a097] dark:text-[#6b6460] mb-0.5">Rank</div>
//       <div className="font-['Playfair_Display',serif] text-[28px] font-[900] text-[#b84c2b] dark:text-[#e8816a] leading-none tabular-nums">
//         {entry.rank}
//       </div>
//     </div>

//     {/* Divider */}
//     <div className="w-px h-10 bg-[#e0d0c5] dark:bg-white/10 flex-shrink-0" />

//     <Avatar initials={entry.initials} color={entry.avatarColor} size="md" />

//     <div className="flex-1 min-w-0">
//       <div className="font-semibold text-[13px] text-[#1a1714] dark:text-[#f2f0eb] truncate">
//         {entry.name}
//         <span className="ml-1.5 font-['DM_Mono',monospace] text-[10px] font-normal text-[#b84c2b] dark:text-[#e8816a]">you</span>
//       </div>
//       <div className="text-[11px] text-[#b0a097] dark:text-[#6b6460] mt-[2px]">320 XP away from Top 100</div>
//     </div>

//     <div className="text-right flex-shrink-0 hidden min-[480px]:block">
//       <div className="font-['DM_Mono',monospace] text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb] tabular-nums">
//         {entry.xp.toLocaleString()}
//       </div>
//       <div className="text-[9.5px] text-[#b0a097] dark:text-[#6b6460] uppercase tracking-wider mt-[1px]">Total XP</div>
//     </div>

//     <div className="flex-shrink-0">
//       <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-[rgba(184,76,43,0.08)] border border-[rgba(184,76,43,0.16)] px-2.5 py-1.5 font-['DM_Mono',monospace] text-[10px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
//         <Icon.TrendUp size={10} />
//         {entry.trend > 0 ? `+${entry.trend}` : entry.trend}
//       </span>
//     </div>
//   </div>
// )

// // ── Sidebar scoring row ───────────────────────────────────────────────────

// const ScoringRow = ({ label, xp }: { label: string; xp: string }) => (
//   <div className="flex items-center justify-between py-2 border-b border-[#ece3db] last:border-b-0 dark:border-white/[0.07]">
//     <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">{label}</span>
//     <span className="font-['DM_Mono',monospace] text-[12px] font-bold text-[#b84c2b] dark:text-[#e8816a] tabular-nums">{xp}</span>
//   </div>
// )

// // ── Sidebar card shell ────────────────────────────────────────────────────

// const SidebarCard = ({
//   children, className,
// }: { children: React.ReactNode; className?: string }) => (
//   <div className={cn(
//     'rounded-[16px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/[0.09] dark:bg-[#1e1c19]',
//     className,
//   )}>
//     {children}
//   </div>
// )

// const SidebarCardHeader = ({
//   icon, title,
// }: { icon: React.ReactNode; title: string }) => (
//   <div className="flex items-center gap-2 mb-4">
//     {icon}
//     <span className="font-['Playfair_Display',serif] text-[14.5px] font-[800] text-[#1a1714] dark:text-[#f2f0eb]">
//       {title}
//     </span>
//   </div>
// )

// // ── Mock data ─────────────────────────────────────────────────────────────

// const STUDENT_TOP3: TopThreeEntry[] = [
//   { rank: 1, name: 'Riya Sharma',  xp: 24890, streakDays: 32, avatarColor: '#b84c2b', initials: 'RS', isChampion: true },
//   { rank: 2, name: 'Arjun Kumar',  xp: 22410, streakDays: 26, avatarColor: '#c49a2c', initials: 'AK' },
//   { rank: 3, name: 'Meera Nair',   xp: 21760, streakDays: 21, avatarColor: '#2d6a47', initials: 'MN' },
// ]

// const STUDENT_ROWS: LeaderEntry[] = [
//   { rank: 4,   name: 'Siddharth V', handle: '@sid_scribe', track: 'Logic',     xp: 19840, streak: 18, trend:  2, avatarColor: '#5c4a3a', initials: 'SV' },
//   { rank: 5,   name: 'Aisha Khan',  handle: '@aisha_k',    track: 'History',   xp: 18220, streak: 12, trend:  0, avatarColor: '#3a4a5c', initials: 'AK' },
//   { rank: 6,   name: 'Dev Patel',   handle: '@patel_dev',  track: 'Astrology', xp: 17450, streak:  9, trend: -1, avatarColor: '#4a5c3a', initials: 'DP' },
//   { rank: 7,   name: 'Priya Menon', handle: '@priya_m',    track: 'CompSci',   xp: 16980, streak: 22, trend:  3, avatarColor: '#7c3a2d', initials: 'PM' },
//   { rank: 8,   name: 'Kiran Rao',   handle: '@kiran_r',    track: 'Economics', xp: 15600, streak:  7, trend: -2, avatarColor: '#2d5c7c', initials: 'KR' },
//   { rank: 128, name: 'Arjun Kumar', handle: '@arjun_you',  track: 'Logic',     xp:  8920, streak: 14, trend: 12, avatarColor: '#b84c2b', initials: 'AK', isMe: true },
// ]

// const TRAINER_TOP3: TopThreeEntry[] = [
//   { rank: 1, name: 'Dr. Elias Vance',  xp: 31200, streakDays: 45, avatarColor: '#2d6a47', initials: 'EV', isChampion: true },
//   { rank: 2, name: 'Prof. Lena Wu',    xp: 28750, streakDays: 38, avatarColor: '#7c5a1e', initials: 'LW' },
//   { rank: 3, name: 'Dr. Amos Osei',    xp: 26400, streakDays: 29, avatarColor: '#b84c2b', initials: 'AO' },
// ]

// const TRAINER_ROWS: LeaderEntry[] = [
//   { rank: 4, name: 'Prof. Sara Kim',   handle: '@sara_kim', track: 'Physics',  xp: 23100, streak: 20, trend:  1, avatarColor: '#5c3a6b', initials: 'SK' },
//   { rank: 5, name: 'Dr. Raj Nair',     handle: '@raj_nair', track: 'Biology',  xp: 21800, streak: 15, trend: -1, avatarColor: '#3a5c4b', initials: 'RN' },
//   { rank: 6, name: 'Prof. Mia Torres', handle: '@mia_t',    track: 'Design',   xp: 20400, streak: 11, trend:  2, avatarColor: '#6b3a2d', initials: 'MT' },
//   { rank: 7, name: 'Dr. Shen Li',      handle: '@shen_li',  track: 'CompSci',  xp: 19100, streak: 18, trend:  0, avatarColor: '#2d3a6b', initials: 'SL' },
//   { rank: 8, name: 'Prof. Nina Patel', handle: '@nina_p',   track: 'History',  xp: 17900, streak:  8, trend: -2, avatarColor: '#6b5a2d', initials: 'NP' },
// ]

// const STUDENT_STREAK_CHAMPS: StreakChampion[] = [
//   { initials: 'RS', name: 'Riya Sharma', streak: 142, avatarColor: '#b84c2b' },
//   { initials: 'AK', name: 'Arjun Kumar', streak: 98,  avatarColor: '#c49a2c' },
//   { initials: 'MN', name: 'Meera Nair',  streak: 84,  avatarColor: '#2d6a47' },
// ]

// const TRAINER_STREAK_CHAMPS: StreakChampion[] = [
//   { initials: 'EV', name: 'Dr. Elias Vance', streak: 187, avatarColor: '#2d6a47' },
//   { initials: 'LW', name: 'Prof. Lena Wu',   streak: 121, avatarColor: '#7c5a1e' },
//   { initials: 'AO', name: 'Dr. Amos Osei',   streak: 95,  avatarColor: '#b84c2b' },
// ]

// const SCOPES: LeaderboardScope[] = ['Global', 'Friends', 'Weekly']
// const TRACKS       = ['All tracks', 'Logic', 'History', 'CompSci', 'Economics', 'Physics', 'Biology']
// const TIME_FILTERS = ['This week', 'This month', 'All time']

// // ── Section tab switcher ──────────────────────────────────────────────────

// const SectionTabSwitcher = ({
//   active, onChange,
// }: {
//   active: LeaderboardSection
//   onChange: (s: LeaderboardSection) => void
// }) => (
//   <div
//     className="relative flex items-center rounded-[12px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-[3px] gap-[3px] dark:border-white/9 dark:bg-[#1e1c19]"
//     role="tablist"
//     aria-label="Leaderboard section"
//   >
//     {/* Sliding pill */}
//     <div
//       className="absolute top-[3px] bottom-[3px] rounded-[9px] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
//       style={{
//         background: active === 'students' ? '#b84c2b' : '#2d6a47',
//         left:  active === 'students' ? '3px' : 'calc(50%)',
//         width: 'calc(50% - 3px)',
//       }}
//     />
//     {(['students', 'trainers'] as const).map((s) => (
//       <button
//         key={s}
//         type="button"
//         role="tab"
//         aria-selected={active === s}
//         onClick={() => onChange(s)}
//         className={cn(
//           "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[9px] px-5 py-2 font-['DM_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 select-none",
//           active === s ? 'text-white' : 'text-[#8a7d75] dark:text-[#6b6460]',
//         )}
//       >
//         {s === 'students'
//           ? <Icon.GraduationCap size={14} />
//           : <Icon.ChalkBoard size={14} />
//         }
//         {s === 'students' ? 'Students' : 'Trainers'}
//       </button>
//     ))}
//   </div>
// )

// // ── Leaderboard section view ──────────────────────────────────────────────

// const LeaderboardSectionView = ({
//   section, search, trackFilter,
// }: {
//   section: LeaderboardSection
//   scope: LeaderboardScope
//   search: string
//   trackFilter: string
// }) => {
//   const navigate = useNavigate()

//   const top3         = section === 'students' ? STUDENT_TOP3          : TRAINER_TOP3
//   const rows         = section === 'students' ? STUDENT_ROWS          : TRAINER_ROWS
//   const myEntry      = section === 'students' ? STUDENT_ROWS.find((r) => r.isMe) : undefined
//   const streakChamps = section === 'students' ? STUDENT_STREAK_CHAMPS : TRAINER_STREAK_CHAMPS

//   const isStudents  = section === 'students'
//   const accentColor = isStudents ? '#b84c2b' : '#2d6a47'
//   const barColor    = accentColor

//   const filteredRows = rows.filter((r) => {
//     const matchTrack  = trackFilter === 'All tracks' || r.track === trackFilter
//     const matchSearch = !search
//       || r.name.toLowerCase().includes(search.toLowerCase())
//       || r.handle.toLowerCase().includes(search.toLowerCase())
//     return matchTrack && matchSearch
//   })

//   const myRank   = myEntry?.rank ?? 128
//   const weeklyXp = isStudents ? 1240 : 3180

//   return (
//     <div className="flex gap-5 items-start max-[860px]:flex-col">

//       {/* ── Main column ── */}
//       <div className="flex-1 min-w-0 flex flex-col gap-4">

//         {/* Podium — 2nd | 1st | 3rd */}
//         <div className="grid grid-cols-3 gap-3 items-end max-[540px]:grid-cols-1">
//           {([top3[1], top3[0], top3[2]] as TopThreeEntry[]).map((entry) => (
//             <PodiumCard key={entry.rank} entry={entry} section={section} />
//           ))}
//         </div>

//         {/* Table card */}
//         <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] overflow-hidden dark:border-white/[0.09] dark:bg-[#1e1c19]">
//           <TableHeader isStudents={isStudents} />

//           {filteredRows.filter((r) => !r.isMe).length > 0
//             ? filteredRows.filter((r) => !r.isMe).map((entry, i, arr) => (
//                 <LeaderRow key={entry.rank} entry={entry} />
//               ))
//             : (
//               <div className="py-12 text-center text-[13px] text-[#b0a097] dark:text-[#6b6460]">
//                 No results match your filters.
//               </div>
//             )
//           }

//           {/* My row lives at bottom of the table, separated */}
//           {isStudents && myEntry && (
//             <>
//               <SectionDivider label="Your position" />
//               <LeaderRow entry={myEntry} />
//             </>
//           )}
//         </div>

//         {/* My rank summary bar */}
//         {isStudents && myEntry && (
//           <MyRankBar entry={myEntry} />
//         )}
//       </div>

//       {/* ── Sidebar ── */}
//       <aside className="w-[248px] flex-shrink-0 flex flex-col gap-3 max-[860px]:w-full">

//         {/* Rank + progress card */}
//         <SidebarCard>
//           <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] mb-1.5">
//             {isStudents ? 'Your rank' : 'Community rank'}
//           </div>

//           <div className="flex items-end gap-2 mb-[18px]">
//             <span
//               className="font-['Playfair_Display',serif] text-[44px] font-[900] leading-none tabular-nums"
//               style={{ color: accentColor }}
//             >
//               #{myRank}
//             </span>
//             <span className="mb-1.5 inline-flex items-center gap-1 rounded-[6px] border border-[rgba(45,106,71,0.2)] bg-[rgba(45,106,71,0.07)] px-2 py-0.5 font-['DM_Mono',monospace] text-[9px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
//               <Icon.TrendUp size={9} /> {isStudents ? '12' : '5'}
//             </span>
//           </div>

//           {/* Divider */}
//           <div className="h-px bg-[#e8ddd6] dark:bg-white/[0.07] mb-4" />

//           <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] mb-2">
//             Weekly XP
//           </div>
//           <div className="flex items-baseline gap-2 mb-2.5">
//             <span className="font-['Playfair_Display',serif] text-[26px] font-[900] text-[#1a1714] dark:text-[#f2f0eb] leading-none tabular-nums">
//               {weeklyXp.toLocaleString()}
//             </span>
//             <span className="text-[11px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">↑ 12%</span>
//           </div>

//           {/* Progress bar */}
//           <div className="h-[4px] rounded-full bg-[rgba(26,23,20,0.07)] dark:bg-white/[0.08] mb-2 overflow-hidden">
//             <div
//               className="h-full rounded-full"
//               style={{ width: `${Math.round((weeklyXp / 5000) * 100)}%`, background: barColor }}
//             />
//           </div>
//           <div className="text-[10.5px] text-[#b0a097] dark:text-[#6b6460]">
//             {(5000 - weeklyXp).toLocaleString()} XP to next tier
//           </div>
//         </SidebarCard>

//         {/* Scoring */}
//         <SidebarCard>
//           <SidebarCardHeader
//             icon={<span style={{ color: accentColor }}><Icon.Sparkles size={14} /></span>}
//             title="Scoring"
//           />
//           {isStudents ? (
//             <>
//               <ScoringRow label="Subtopic mastery"    xp="+20 XP"  />
//               <ScoringRow label="Mock test — perfect" xp="+100 XP" />
//               <ScoringRow label="Daily inquiry"       xp="+15 XP"  />
//               <ScoringRow label="Peer review"         xp="+50 XP"  />
//             </>
//           ) : (
//             <>
//               <ScoringRow label="Tracker published"   xp="+80 XP"  />
//               <ScoringRow label="Tracker verified"    xp="+50 XP"  />
//               <ScoringRow label="Student milestone"   xp="+30 XP"  />
//               <ScoringRow label="Community vote"      xp="+25 XP"  />
//             </>
//           )}
//         </SidebarCard>

//         {/* Streak champions */}
//         <SidebarCard>
//           <SidebarCardHeader
//             icon={<span className="text-[#c49a2c]"><Icon.Trophy size={14} /></span>}
//             title="Streak champions"
//           />
//           {streakChamps.map(({ initials, name, streak, avatarColor }) => (
//             <div key={name} className="flex items-center gap-2.5 py-[9px] border-b border-[#ece3db] last:border-b-0 dark:border-white/[0.07]">
//               <Avatar initials={initials} color={avatarColor} size="sm" />
//               <span className="flex-1 text-[12.5px] text-[#1a1714] dark:text-[#f2f0eb] truncate">{name}</span>
//               <span className="flex items-center gap-1 font-['DM_Mono',monospace] text-[11px] text-[#b0a097] dark:text-[#6b6460] tabular-nums">
//                 <Icon.Fire size={11} /> {streak}
//               </span>
//             </div>
//           ))}
//         </SidebarCard>

//         {/* Elite distinction CTA */}
//         <div
//           className="rounded-[16px] p-5"
//           style={{ background: accentColor }}
//         >
//           <div className="flex items-center gap-2 mb-2.5">
//             <span className="text-[rgba(255,255,255,0.75)]"><Icon.Star size={13} /></span>
//             <span className="font-['Playfair_Display',serif] text-[14.5px] font-[800] text-white">
//               Elite Distinction
//             </span>
//           </div>
//           <p className="text-[11.5px] text-[rgba(255,255,255,0.8)] leading-[1.6] mb-4">
//             Reach the Top 100 this week to unlock the "Centurion Scholar" badge and 500 gold coins.
//           </p>
//           <button
//             type="button"
//             onClick={() => navigate('/leaderboard/rewards')}
//             className="w-full flex items-center justify-center gap-1.5 rounded-[9px] border border-white/20 bg-white/12 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-white/22 active:scale-[0.98]"
//           >
//             View rewards <Icon.ChevronRight />
//           </button>
//         </div>

//       </aside>
//     </div>
//   )
// }

// // ── Main page ─────────────────────────────────────────────────────────────

// export default function LeaderboardPage() {

//   const [sidebarOpen,      setSidebarOpen]      = useState(false)
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(
//     () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed',
//   )

//   const [activeSection, setActiveSection] = useState<LeaderboardSection>('students')
//   const [scope,         setScope]         = useState<LeaderboardScope>('Global')
//   const [trackFilter,   setTrackFilter]   = useState('All tracks')
//   const [timeFilter,    setTimeFilter]    = useState('This week')
//   const [search,        setSearch]        = useState('')

//   // Replace with real hook: const dashboardSummaryQuery = useDashboardSummary()
//   const dashboardSummaryQuery = {
//     data: {
//       user:   { fullName: 'Arjun Reddy', avatarUrl: null, isPremium: false },
//       streak: { current: 14 },
//     } as DashboardSummaryData,
//     isLoading: false,
//     isError:   false,
//   }

//   const dashboardSummary = dashboardSummaryQuery.data
//   const isInitialLoad    = dashboardSummaryQuery.isLoading && !dashboardSummary
//   const hasError         = dashboardSummaryQuery.isError

//   const sidebarProps = {
//     mobileOpen:        sidebarOpen,
//     collapsed:         sidebarCollapsed,
//     onCloseMobile:     () => setSidebarOpen(false),
//     onToggleCollapsed: () =>
//       setSidebarCollapsed((v) => {
//         const next = !v
//         localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
//         return next
//       }),
//   }

//   if (isInitialLoad) {
//     return (
//       <PageSkeleton
//         sidebarOpen={sidebarOpen}
//         sidebarCollapsed={sidebarCollapsed}
//         setSidebarOpen={setSidebarOpen}
//         setSidebarCollapsed={setSidebarCollapsed}
//       />
//     )
//   }

//   if (hasError || !dashboardSummary) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
//         <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.2)] bg-[#fdf8f5] p-8 text-center dark:bg-[#1e1c19]">
//           <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
//             Leaderboard unavailable
//           </h1>
//           <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
//             Something went wrong loading the leaderboard data. Try refreshing the page.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   const userInitials = getInitials(dashboardSummary.user.fullName)

//   return (
//     <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
//       <NoiseOverlay />

//       <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
//         <Sidebar {...sidebarProps} />

//         <main className={cn(
//           'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
//           sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56',
//         )}>
//           <TopBar
//             onMenuClick={() => setSidebarOpen(true)}
//             streakDays={dashboardSummary.streak.current}
//             userName={dashboardSummary.user.fullName}
//             userInitials={userInitials}
//             userAvatarUrl={dashboardSummary.user.avatarUrl ?? undefined}
//             userLevel={formatLevelLabel(dashboardSummary.user.isPremium)}
//             isGuest={false}
//           />

//           <div className="flex min-w-0 flex-1 flex-col">
//             <div className="mx-auto mt-6 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-7 pb-[calc(80px+env(safe-area-inset-bottom,0)+24px)] max-[900px]:mt-5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-4 max-[640px]:w-[calc(100%-20px)]">

//               {/* ── Page header ── */}
//               <section className="flex flex-wrap items-start justify-between gap-5">
//                 <div>
//                   {/* Compete pill */}
//                   <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.15)] bg-[rgba(184,76,43,0.07)] px-3 py-[5px]">
//                     <Icon.LiveDot />
//                     <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.13em] text-[#b84c2b] dark:text-[#e8816a]">
//                       Compete
//                     </span>
//                   </div>

//                   <h1 className="font-['Playfair_Display',serif] text-[clamp(28px,3.5vw,40px)] font-[900] leading-[1.08] tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
//                     Arena{' '}
//                     <span className="text-[#b84c2b] dark:text-[#e8816a]">Leaderboard</span>
//                   </h1>
//                   <p className="mt-2.5 max-w-[420px] text-[13px] italic leading-[1.6] text-[#7a6e66] dark:text-[#9b9a92]">
//                     Track top learners, weekly streaks, and progress across the Imminiq community.
//                   </p>
//                 </div>

//                 {/* Rank hero */}
//                 <div className="flex items-stretch gap-0 rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] overflow-hidden dark:border-white/[0.09] dark:bg-[#1e1c19] max-[560px]:w-full">
//                   {/* Left: rank number */}
//                   <div className="px-5 py-4 flex flex-col justify-center">
//                     <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] mb-1">
//                       Global rank
//                     </div>
//                     <div className="font-['Playfair_Display',serif] text-[40px] font-[900] leading-none text-[#b84c2b] dark:text-[#e8816a] tabular-nums">
//                       #128
//                     </div>
//                   </div>
//                   {/* Divider */}
//                   <div className="w-px bg-[#e0d0c5] dark:bg-white/[0.09] self-stretch" />
//                   {/* Right: trend */}
//                   <div className="px-4 flex flex-col items-center justify-center gap-1">
//                     <div className="flex items-center gap-1 font-['DM_Mono',monospace] text-[11px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
//                       <Icon.TrendUp size={11} /> 12
//                     </div>
//                     <div className="font-['DM_Mono',monospace] text-[8px] text-[#b0a097] dark:text-[#6b6460] uppercase tracking-wider">
//                       this week
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               {/* ── Controls ── */}
//               <div className="flex flex-wrap items-center gap-2.5">
//                 <SectionTabSwitcher
//                   active={activeSection}
//                   onChange={(s) => { setActiveSection(s); setSearch('') }}
//                 />

//                 {/* Scope pills */}
//                 <div
//                   className="flex bg-[#fdf8f5] border-[1.5px] border-[#e0d0c5] rounded-[10px] p-[3px] gap-[2px] dark:bg-[#1e1c19] dark:border-white/9"
//                   role="group"
//                   aria-label="Leaderboard scope"
//                 >
//                   {SCOPES.map((s) => (
//                     <button
//                       key={s}
//                       type="button"
//                       onClick={() => setScope(s)}
//                       className={cn(
//                         "px-[14px] py-[5px] rounded-[7px] border-none cursor-pointer font-['DM_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.06em] transition-all select-none",
//                         scope === s
//                           ? 'bg-[#b84c2b] text-white dark:bg-[#e8816a] dark:text-[#141412]'
//                           : 'bg-transparent text-[#8a7d75] dark:text-[#6b6460]',
//                       )}
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Search */}
//                 <div className="relative flex-1 min-w-[160px] max-w-[260px]">
//                   <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a097]">
//                     <Icon.Search />
//                   </span>
//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder={activeSection === 'students' ? 'Search scholars…' : 'Search trainers…'}
//                     className="w-full rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-[7px] pl-8 pr-3 text-[12px] text-[#1a1714] outline-none placeholder:text-[#b0a097] focus:border-[rgba(184,76,43,0.32)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]"
//                   />
//                 </div>

//                 {/* Track filter */}
//                 <div className="relative">
//                   <select
//                     value={trackFilter}
//                     onChange={(e) => setTrackFilter(e.target.value)}
//                     aria-label="Filter by track"
//                     className="appearance-none cursor-pointer rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-[7px] pl-3 pr-8 text-[12px] text-[#7a6e66] outline-none dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]"
//                   >
//                     {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
//                   </select>
//                   <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b0a097]">
//                     <Icon.ChevronDown />
//                   </span>
//                 </div>

//                 {/* Time filter */}
//                 <div className="relative">
//                   <select
//                     value={timeFilter}
//                     onChange={(e) => setTimeFilter(e.target.value)}
//                     aria-label="Filter by time"
//                     className="appearance-none cursor-pointer rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-[7px] pl-3 pr-8 text-[12px] text-[#7a6e66] outline-none dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]"
//                   >
//                     {TIME_FILTERS.map((t) => <option key={t} value={t}>{t}</option>)}
//                   </select>
//                   <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b0a097]">
//                     <Icon.ChevronDown />
//                   </span>
//                 </div>
//               </div>

//               {/* ── Active section ── */}
//               <LeaderboardSectionView
//                 key={activeSection}
//                 section={activeSection}
//                 scope={scope}
//                 search={search}
//                 trackFilter={trackFilter}
//               />

//             </div>
//             <AppFooter />
//           </div>
//         </main>
//       </div>

//       <BottomNav />
//     </div>
//   )
// }