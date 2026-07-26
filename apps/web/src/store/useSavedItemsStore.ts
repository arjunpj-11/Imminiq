import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { safeLocalStateStorage } from '../lib/storage/safe-storage';

export type SavedTrackerItem = {
  id: string;
  title: string;
  description: string;
  savedAt: string;
};

export type SavedLessonItem = {
  trackerId: string;
  subtopicId: string;
  trackerTitle: string;
  lessonTitle: string;
  savedAt: string;
};

interface ISavedItemsStore {
  trackers: SavedTrackerItem[];
  lessons: SavedLessonItem[];
  toggleTracker: (item: Omit<SavedTrackerItem, 'savedAt'>) => void;
  toggleLesson: (item: Omit<SavedLessonItem, 'savedAt'>) => void;
}

export const useSavedItemsStore = create<ISavedItemsStore>()(
  persist(
    (set) => ({
      trackers: [],
      lessons: [],
      toggleTracker: (item) =>
        set((state) => ({
          trackers: state.trackers.some((saved) => saved.id === item.id)
            ? state.trackers.filter((saved) => saved.id !== item.id)
            : [{ ...item, savedAt: new Date().toISOString() }, ...state.trackers],
        })),
      toggleLesson: (item) =>
        set((state) => ({
          lessons: state.lessons.some(
            (saved) => saved.trackerId === item.trackerId && saved.subtopicId === item.subtopicId
          )
            ? state.lessons.filter(
                (saved) =>
                  saved.trackerId !== item.trackerId || saved.subtopicId !== item.subtopicId
              )
            : [{ ...item, savedAt: new Date().toISOString() }, ...state.lessons],
        })),
    }),
    {
      name: 'imminiq:saved-items',
      storage: createJSONStorage(() => safeLocalStateStorage),
    }
  )
);
