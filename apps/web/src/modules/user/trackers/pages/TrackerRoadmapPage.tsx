import { cn } from '../../../../lib/cn';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { ROUTES } from '../../../../routes/config/route-paths';
import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { AppPageSkeleton } from '../../../../components/feedback/RouteSkeleton';
import { triggerConfetti } from '../../../../components/ui/ConfettiCanvas';
import { playUiSound } from '../../../../lib/ui-sound';
import { useTrackerDetails, useTrackerRoadmap } from '../hooks/useTrackers';
import TrackerModerationNotice from '../components/TrackerModerationNotice';
import {
  CheckIcon,
  CompassIcon,
  FlowConnector,
  LayersIcon,
  RoadmapFlowNode,
  StarIcon,
} from '../components/roadmap/RoadmapFlow';
import type { BreadcrumbItem, RoadmapLocationState, RoadmapNode } from '../utils/roadmap.types';
import {
  findFreshNodes,
  getNodeState,
  mapTopicToNode,
  readSavedRoadmapStack,
  saveRoadmapStack,
} from '../utils/roadmap.utils';

export default function TrackerRoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackerId } = useParams<{ trackerId: string }>();

  const [breadcrumbStack, setBreadcrumbStack] = useState<BreadcrumbItem[]>(() => {
    const state = location.state as RoadmapLocationState | null;
    if (state?.roadmapBreadcrumbStack) return state.roadmapBreadcrumbStack;
    return readSavedRoadmapStack(trackerId);
  });

  const trackerDetailsQuery = useTrackerDetails(trackerId);
  const trackerIsModerated = Boolean(
    trackerDetailsQuery.data?.moderationStatus &&
    trackerDetailsQuery.data.moderationStatus !== 'active'
  );
  const roadmapQuery = useTrackerRoadmap(
    trackerId || '',
    Boolean(trackerDetailsQuery.data && !trackerIsModerated)
  );

  const roadmapData = roadmapQuery.data;

  const topLevelNodes = useMemo(
    () => (roadmapData?.roadmap || []).map(mapTopicToNode),
    [roadmapData?.roadmap]
  );

  const syncedBreadcrumbStack = useMemo(() => {
    if (breadcrumbStack.length === 0 || topLevelNodes.length === 0) {
      return breadcrumbStack;
    }

    return breadcrumbStack.map((crumb) => {
      const freshNodes = findFreshNodes(topLevelNodes, crumb.id);
      return freshNodes ? { ...crumb, nodes: freshNodes } : crumb;
    });
  }, [topLevelNodes, breadcrumbStack]);

  const currentNodes =
    syncedBreadcrumbStack.length > 0
      ? syncedBreadcrumbStack[syncedBreadcrumbStack.length - 1].nodes
      : topLevelNodes;

  const currentTitle =
    syncedBreadcrumbStack.length > 0
      ? syncedBreadcrumbStack[syncedBreadcrumbStack.length - 1].title
      : roadmapData?.tracker.title || 'Study Roadmap';

  const isFirstLevel = syncedBreadcrumbStack.length === 0;

  const completedCount = currentNodes.filter(
    (node) => getNodeState(node, isFirstLevel) === 'completed'
  ).length;

  const progress =
    currentNodes.length === 0 ? 0 : Math.round((completedCount / currentNodes.length) * 100);
  const nextActionNode =
    currentNodes.find((node) => getNodeState(node, isFirstLevel) === 'active') ??
    currentNodes.find((node) => getNodeState(node, isFirstLevel) === 'available');

  useEffect(() => {
    if (progress === 100 && currentNodes.length > 0) {
      triggerConfetti();
      playUiSound('complete');
    }
  }, [progress, currentNodes.length]);

  const isMainLoading =
    trackerDetailsQuery.isLoading || (!trackerIsModerated && roadmapQuery.isLoading);

  const hasMainError = !trackerId || roadmapQuery.isError;

  const handleNodeClick = (node: RoadmapNode) => {
    const firstLevel = breadcrumbStack.length === 0;
    if (firstLevel && (node.isLocked || node.status === 'locked')) return;

    if (node.children.length > 0) {
      setBreadcrumbStack((current) => {
        const nextStack = [...current, { id: node._id, title: node.title, nodes: node.children }];
        saveRoadmapStack(trackerId, nextStack);
        return nextStack;
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (node.nodeType === 'subtopic') {
      saveRoadmapStack(trackerId, breadcrumbStack);

      navigate(`/trackers/${trackerId}/lessons/${node._id}`, {
        state: { returnToRoadmapStack: breadcrumbStack },
      });
    }
  };

  const goToBreadcrumb = (index: number) => {
    if (index === -1) {
      saveRoadmapStack(trackerId, []);
      setBreadcrumbStack([]);
      return;
    }

    setBreadcrumbStack((current) => {
      const nextStack = current.slice(0, index + 1);
      saveRoadmapStack(trackerId, nextStack);
      return nextStack;
    });
  };

  const goBackOneLevel = () => {
    setBreadcrumbStack((current) => {
      const nextStack = current.slice(0, -1);
      saveRoadmapStack(trackerId, nextStack);
      return nextStack;
    });
  };

  return (
    <AppShellBoundary>
      {isMainLoading ? (
        <AppPageSkeleton kind="roadmap" label="Preparing your roadmap" />
      ) : trackerIsModerated && trackerDetailsQuery.data ? (
        <TrackerModerationNotice tracker={trackerDetailsQuery.data} />
      ) : hasMainError || !roadmapData ? (
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-(--surface-card) p-6 text-center shadow-(--shadow-2) dark:bg-(--surface-card)">
            <h1 className="font-ui text-[22px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
              Roadmap unavailable
            </h1>
            <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
              This tracker could not be found, or its roadmap is temporarily unavailable.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  void trackerDetailsQuery.refetch();
                  void roadmapQuery.refetch();
                }}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-elevated) px-4 py-2.5 text-[13px] font-bold text-(--text-primary) transition hover:border-(--brand-500)"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.trackers)}
                className="rounded-xl bg-(--brand-500) px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-(--brand-600)"
              >
                Back to trackers
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-5.5 flex w-[min(900px,calc(100%-48px))] max-w-full min-w-0 flex-col pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
          <section className="mb-7 border-b border-(--border-subtle) pb-6 dark:border-(--border-subtle)">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(ROUTES.trackers)}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) transition hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
              >
                Trackers
              </button>

              <span className="text-(--text-secondary)/40 dark:text-(--text-secondary)/40">/</span>

              <button
                type="button"
                onClick={() => goToBreadcrumb(-1)}
                className={cn(
                  'font-mono text-[10px] uppercase tracking-[0.14em] transition',
                  syncedBreadcrumbStack.length === 0
                    ? 'text-(--brand-500) dark:text-(--brand-500)'
                    : 'text-(--text-secondary) hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)'
                )}
              >
                {roadmapData.tracker.title}
              </button>

              {syncedBreadcrumbStack.map((item, index) => (
                <span key={item.id} className="flex items-center gap-2">
                  <span className="text-(--text-secondary)/40 dark:text-(--text-secondary)/40">
                    /
                  </span>
                  <button
                    type="button"
                    onClick={() => goToBreadcrumb(index)}
                    className={cn(
                      'max-w-42 truncate font-mono text-[10px] uppercase tracking-[0.14em] transition',
                      index === syncedBreadcrumbStack.length - 1
                        ? 'text-(--brand-500) dark:text-(--brand-500)'
                        : 'text-(--text-secondary) hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)'
                    )}
                  >
                    {item.title}
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-ui text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.8px] text-(--text-primary) dark:text-(--text-primary)">
                  {currentTitle}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
                  <span>
                    {currentNodes.length} node
                    {currentNodes.length === 1 ? '' : 's'}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-[#6b5f58]/40 dark:bg-[#9b9a92]/40" />
                  <span>
                    {isFirstLevel
                      ? 'Complete each topic to unlock the next'
                      : 'Choose any available lesson'}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-[#6b5f58]/40 dark:bg-[#9b9a92]/40" />
                  <span>Your current step is highlighted</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {nextActionNode && (
                  <button
                    type="button"
                    onClick={() => handleNodeClick(nextActionNode)}
                    className="min-h-11 rounded-xl bg-(--brand-500) px-4 py-2.5 text-[13px] font-extrabold text-white shadow-[0_8px_24px_rgba(184,76,43,0.20)] transition hover:-translate-y-px hover:bg-(--brand-600) dark:text-[#141412]"
                  >
                    {nextActionNode.children.length > 0
                      ? 'Continue current topic'
                      : 'Start next lesson'}{' '}
                    →
                  </button>
                )}
                {roadmapData.tracker.clonedFrom && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/community/trackers/${roadmapData.tracker.clonedFrom?.trackerId}`)
                    }
                    className="cursor-pointer text-[12.5px] font-semibold text-(--text-secondary) transition hover:text-(--text-primary) hover:underline"
                    title="Open the original published tracker"
                  >
                    Cloned
                  </button>
                )}
                {syncedBreadcrumbStack.length > 0 && (
                  <button
                    type="button"
                    onClick={goBackOneLevel}
                    className="rounded-md border-[1.5px] border-(--border-subtle) px-4 py-2.5 text-[12.5px] font-semibold text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
                  >
                    ← Back
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="mb-7 grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
            <div className="flex items-center gap-3 rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                <CompassIcon />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
                  Current Level
                </div>
                <div className="font-ui text-[22px] font-extrabold leading-none text-(--text-primary) dark:text-(--text-primary)">
                  {syncedBreadcrumbStack.length + 1}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(45,106,71,0.08)] text-(--success) dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)">
                <CheckIcon size={18} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
                  Completed Here
                </div>
                <div className="font-ui text-[22px] font-extrabold leading-none text-(--text-primary) dark:text-(--text-primary)">
                  {completedCount}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(138,98,0,0.08)] text-[#8a6200] dark:bg-[rgba(240,168,66,0.10)] dark:text-(--warning)">
                <StarIcon />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
                  Level Mastery
                </div>
                <div className="font-ui text-[22px] font-extrabold leading-none text-(--text-primary) dark:text-(--text-primary)">
                  {progress}%
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                Current Node Progress
              </span>
              <span className="font-mono text-[11px] text-(--brand-500) dark:text-(--brand-500)">
                {progress} / 100 pts
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9">
              <div
                className="h-full rounded-full bg-linear-to-r from-(--brand-500) to-(--brand-500) transition-all duration-700 dark:from-[#f5a090] dark:to-(--brand-500)"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          <section className="flex flex-col items-center">
            <div className="mb-2 flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--brand-500) text-white shadow-[0_0_0_6px_rgba(184,76,43,0.08),0_0_0_12px_#f5ede4,0_8px_40px_rgba(184,76,43,0.18)] dark:bg-(--brand-500) dark:text-[#141412] dark:shadow-[0_0_0_6px_rgba(232,129,106,0.10),0_0_0_12px_#141412,0_8px_40px_rgba(232,129,106,0.18)]">
                <LayersIcon />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
                Start Here
              </span>
            </div>

            {currentNodes.length > 0 ? (
              <div className="flex w-full flex-col items-center">
                <FlowConnector direction="down" />

                {currentNodes.map((node, index) => (
                  <div key={node._id} className="flex w-full flex-col items-center">
                    <RoadmapFlowNode
                      node={node}
                      index={index}
                      isFirstLevel={isFirstLevel}
                      onClick={() => handleNodeClick(node)}
                    />
                    {index < currentNodes.length - 1 && (
                      <FlowConnector direction={index % 2 === 0 ? 'right' : 'left'} />
                    )}
                  </div>
                ))}

                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-(--border-subtle) bg-[rgba(26,23,20,0.05)] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/6 dark:text-(--text-secondary)">
                    <CheckIcon size={20} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-65 dark:text-(--text-secondary)">
                    End of this level
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-xl border-[1.5px] border-dashed border-(--border-subtle) bg-(--surface-card) p-8 text-center dark:border-(--border-subtle) dark:bg-(--surface-card)">
                <h2 className="font-ui text-[22px] font-extrabold">No nodes found</h2>
                <p className="mt-2 text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
                  This part of the roadmap has no child nodes yet.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </AppShellBoundary>
  );
}
