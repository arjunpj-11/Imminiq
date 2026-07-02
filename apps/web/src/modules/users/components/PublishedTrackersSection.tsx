import EmptyState from '../../../components/feedback/EmptyState'
import TrackerCard from './TrackerCard'

export interface PublishedTrackerCardViewModel {
  title: string
  desc: string
  rating: number
  clones: string
  thumbClass: string
  slug: string
}

interface PublishedTrackersSectionProps {
  trackers: PublishedTrackerCardViewModel[]
  onClone: (tracker: PublishedTrackerCardViewModel) => void
  onOpen: (tracker: PublishedTrackerCardViewModel) => void
}

export default function PublishedTrackersSection({
  trackers,
  onClone,
  onOpen,
}: PublishedTrackersSectionProps) {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between animate-[fadeUp_0.38s_ease_0.32s_both]">
        <h2 className="font-['Playfair_Display',serif] text-[clamp(20px,3vw,24px)] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
          Published Trackers
        </h2>
      </div>

      {trackers.length > 0 ? (
        <div className="grid grid-cols-3 gap-3.5 animate-[fadeUp_0.38s_ease_0.36s_both] max-[860px]:grid-cols-2 max-[640px]:grid-cols-1">
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker.slug || tracker.title}
              {...tracker}
              onClone={() => onClone(tracker)}
              onClick={() => onOpen(tracker)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No published trackers"
          description="Published learning paths will appear here."
        />
      )}
    </section>
  )
}
