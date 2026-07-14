import EmptyState from '../../../../components/feedback/EmptyState';
import TrackerCard from './TrackerCard';

export interface IPublishedTrackerCardViewModel {
  id: string;
  title: string;
  desc: string;
  rating: number;
  clones: string;
  thumbClass: string;
  slug: string;
}

interface IPublishedTrackersSectionProps {
  trackers: IPublishedTrackerCardViewModel[];
  onOpen: (tracker: IPublishedTrackerCardViewModel) => void;
}

export default function PublishedTrackersSection({
  trackers,
  onOpen,
}: IPublishedTrackersSectionProps) {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between animate-[fadeUp_0.38s_ease_0.32s_both]">
        <h2 className="font-ui text-[clamp(20px,3vw,24px)] font-extrabold tracking-[-0.4px] text-(--text-primary) dark:text-(--text-primary)">
          Published Trackers
        </h2>
      </div>

      {trackers.length > 0 ? (
        <div className="grid grid-cols-3 gap-3.5 animate-[fadeUp_0.38s_ease_0.36s_both] max-[860px]:grid-cols-2 max-[640px]:grid-cols-1">
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker.slug || tracker.title}
              {...tracker}
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
  );
}
