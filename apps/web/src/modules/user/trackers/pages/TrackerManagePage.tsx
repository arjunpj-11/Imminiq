import { useMemo, useRef, useState } from 'react';

import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { useNavigate, useParams } from 'react-router';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { AppPageSkeleton } from '../../../../components/feedback/RouteSkeleton';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import TrackerModerationNotice from '../components/TrackerModerationNotice';
import { useUnsavedChangesGuard } from '../../../../hooks/useUnsavedChangesGuard';
import SubtopicTreeNode from '../components/manage/SubtopicTreeNode';
import OutlineSuggestionPicker from '../components/manage/OutlineSuggestionPicker';
import { TrackerManageEmptyState as EmptyPanel } from '../components/manage/TrackerManageStates';

import {
  useImportTrackerOutline,
  useCreateTopicContribution,
  useTrackerDetails,
  useTrackerRoadmap,
  useTrackerTopicContributions,
  useUpdateTracker,
  useTrackerClan,
  useUpdateTrackerTopic,
  useDeleteTrackerTopic,
  useDeleteTrackerSubtopic,
} from '../hooks/useTrackers';

import { useVerifyTrackerSubtopic, useVerifyTrackerTopic } from '../hooks/useTrackerAiVerification';

import {
  countNestedSubtopics,
  extractRoadmapTopics,
  extractRoadmapTracker,
  flattenSubtopics,
  getChildren,
  getVerificationMessageClass,
  type AiVerificationState,
  type SubtopicDifficulty,
  type TrackerRoadmapLike,
  type RoadmapSubtopicNode,
} from '../utils/tracker-roadmap-normalizers';
import {
  allOutlinePaths,
  parseTrackerOutlineJson,
  selectedOutline,
  trackerOutlineExample,
  type TrackerOutlineNode,
} from '../utils/tracker-outline';

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-[var(--radius-md)] border-[1.5px] border-[var(--border-subtle)] bg-[var(--surface-card)] px-3.5 py-3 text-[13px] font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)]/45 focus:border-[var(--brand-500)] focus:ring-3 focus:ring-[rgba(184,76,43,0.12)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-[var(--surface-canvas)] dark:text-[var(--text-primary)] dark:placeholder:text-[#9b9a92]/45 dark:focus:border-[var(--brand-500)]';

const labelClass =
  'mb-1.5 block font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--text-secondary)]/70 dark:text-[var(--text-secondary)]/70';

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#1a1714] px-4 py-3 text-[13px] font-bold text-[#f5ede4] transition hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(26,23,20,0.20)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-[#f2f0eb] dark:text-[#141412]';

const subtleButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-[13px] font-bold text-[var(--text-secondary)] transition hover:-translate-y-px hover:border-[var(--brand-500)] hover:bg-[rgba(184,76,43,0.08)] hover:text-[var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/15 dark:bg-[var(--surface-card)] dark:text-[var(--text-secondary)] dark:hover:border-[var(--brand-500)] dark:hover:text-[var(--brand-500)]';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackerManagePage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const navigate = useNavigate();

  // ── Data queries ──
  const trackerDetailsQuery = useTrackerDetails(trackerId);
  const trackerIsModerated = Boolean(
    trackerDetailsQuery.data?.moderationStatus &&
    trackerDetailsQuery.data.moderationStatus !== 'active'
  );
  const roadmapQuery = useTrackerRoadmap(
    trackerId,
    Boolean(trackerDetailsQuery.data && !trackerIsModerated)
  );

  const updateTrackerMutation = useUpdateTracker();
  const importOutlineMutation = useImportTrackerOutline();
  const verifyTopicMutation = useVerifyTrackerTopic();
  const verifySubtopicMutation = useVerifyTrackerSubtopic();
  const createContributionMutation = useCreateTopicContribution();
  const updateTopicMutation = useUpdateTrackerTopic();
  const deleteTopicMutation = useDeleteTrackerTopic();
  const deleteSubtopicMutation = useDeleteTrackerSubtopic();

  const roadmapData = roadmapQuery.data as TrackerRoadmapLike | undefined;
  const tracker = trackerDetailsQuery.data || extractRoadmapTracker(roadmapData);
  const isClonedTracker = Boolean(tracker?.sourceTrackerId);
  const isPublishedTracker = tracker?.visibility === 'public' || Boolean(tracker?.publishedAt);
  const clanQuery = useTrackerClan(trackerId, Boolean(trackerId && isPublishedTracker));
  const canManageTracker = isPublishedTracker
    ? Boolean(clanQuery.data?.canManage)
    : Boolean(tracker && !isClonedTracker);
  const canDeleteRoadmapContent = !isClonedTracker && canManageTracker;
  const contributionsQuery = useTrackerTopicContributions(
    trackerId,
    Boolean(tracker && isClonedTracker)
  );

  const topics = useMemo(() => extractRoadmapTopics(roadmapData), [roadmapData]);

  // ── UI state ──
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackerTitleDraft, setTrackerTitleDraft] = useState<string | null>(null);
  const [submittedTopicIds, setSubmittedTopicIds] = useState<Set<string>>(() => new Set());
  const [editingTopic, setEditingTopic] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);
  const [contentPendingDelete, setContentPendingDelete] = useState<{
    id: string;
    title: string;
    type: 'topic' | 'subtopic';
    nestedCount: number;
  } | null>(null);

  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [topicSuggestions, setTopicSuggestions] = useState<TrackerOutlineNode[]>([]);
  const [selectedTopicSuggestionPaths, setSelectedTopicSuggestionPaths] = useState<Set<string>>(
    () => new Set()
  );

  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [newSubtopicDescription, setNewSubtopicDescription] = useState('');
  const [newSubtopicDifficulty, setNewSubtopicDifficulty] =
    useState<SubtopicDifficulty>('beginner');
  const [newSubtopicParentId, setNewSubtopicParentId] = useState<string | null>(null);
  const [subtopicSuggestions, setSubtopicSuggestions] = useState<TrackerOutlineNode[]>([]);
  const [selectedSubtopicSuggestionPaths, setSelectedSubtopicSuggestionPaths] = useState<
    Set<string>
  >(() => new Set());
  const [importJson, setImportJson] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);

  const [topicVerification, setTopicVerification] = useState<AiVerificationState>({
    status: 'idle',
    message: null,
  });

  const [subtopicVerification, setSubtopicVerification] = useState<AiVerificationState>({
    status: 'idle',
    message: null,
  });

  // ── Mutation in-flight guards ──
  const subtopicCreating = useRef(false);
  const topicCreating = useRef(false);
  const trackerSaving = useRef(false);

  const activeTopic = useMemo(
    () => topics.find((topic) => topic._id === selectedTopicId) || topics[0],
    [selectedTopicId, topics]
  );
  const canEditActiveTopic = Boolean(
    canManageTracker &&
    activeTopic &&
    (!isClonedTracker || activeTopic.isCloneAddition || !activeTopic.sourceTopicId)
  );

  const activeSubtopics = useMemo(() => getChildren(activeTopic), [activeTopic]);

  // Flat list of all subtopics (including nested) for the parent selector
  const flatSubtopics = useMemo(() => flattenSubtopics(activeSubtopics), [activeSubtopics]);

  const totalSubtopics = useMemo(
    () => topics.reduce((total, topic) => total + countNestedSubtopics(getChildren(topic)), 0),
    [topics]
  );

  const cloneAdditions = useMemo(
    () => topics.filter((topic) => Boolean(topic.isCloneAddition)),
    [topics]
  );

  const contributionByTopicId = useMemo(
    () =>
      new Map(
        (contributionsQuery.data ?? []).map((contribution) => [
          contribution.cloneTopicId,
          contribution,
        ])
      ),
    [contributionsQuery.data]
  );

  const trackerTitle = trackerTitleDraft ?? tracker?.title ?? '';

  const hasUnsavedDrafts = Boolean(
    (trackerTitleDraft !== null && trackerTitleDraft.trim() !== (tracker?.title ?? '').trim()) ||
    newTopicTitle.trim() ||
    newTopicDescription.trim() ||
    newSubtopicTitle.trim() ||
    newSubtopicDescription.trim() ||
    importJson.trim() ||
    newSubtopicParentId ||
    newSubtopicDifficulty !== 'beginner'
  );

  const unsavedChangesGuard = useUnsavedChangesGuard({
    when: hasUnsavedDrafts,
  });

  const topicTitleReady = Boolean(newTopicTitle.trim());
  const subtopicTitleReady = Boolean(newSubtopicTitle.trim());

  const canAddTopic =
    topicTitleReady && topicVerification.status === 'approved' && !importOutlineMutation.isPending;

  const canAddSubtopic =
    Boolean(activeTopic?._id) &&
    subtopicTitleReady &&
    subtopicVerification.status === 'approved' &&
    !importOutlineMutation.isPending;

  // ── Helpers ──
  const clearMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const resetTopicVerification = () => {
    setTopicVerification({ status: 'idle', message: null });
    setTopicSuggestions([]);
    setSelectedTopicSuggestionPaths(new Set());
  };

  const resetSubtopicVerification = () => {
    setSubtopicVerification({ status: 'idle', message: null });
    setSubtopicSuggestions([]);
    setSelectedSubtopicSuggestionPaths(new Set());
  };

  // ── Handlers ──
  const handleTopicTitleChange = (value: string) => {
    setNewTopicTitle(value);
    resetTopicVerification();
  };

  const handleTopicDescriptionChange = (value: string) => {
    setNewTopicDescription(value);
    resetTopicVerification();
  };

  const handleSubtopicTitleChange = (value: string) => {
    setNewSubtopicTitle(value);
    resetSubtopicVerification();
  };

  const handleSubtopicDescriptionChange = (value: string) => {
    setNewSubtopicDescription(value);
    resetSubtopicVerification();
  };

  const handleSubtopicDifficultyChange = (value: SubtopicDifficulty) => {
    setNewSubtopicDifficulty(value);
    resetSubtopicVerification();
  };

  const handleSubtopicParentChange = (value: string) => {
    setNewSubtopicParentId(value || null);
    resetSubtopicVerification();
  };

  const handleSaveTracker = async () => {
    if (!trackerId || trackerSaving.current) return;

    clearMessages();

    if (!trackerTitle.trim()) {
      setErrorMessage('Tracker name is required.');
      return;
    }

    trackerSaving.current = true;

    try {
      await updateTrackerMutation.mutateAsync({
        trackerId,
        title: trackerTitle.trim(),
      } as Parameters<typeof updateTrackerMutation.mutateAsync>[0]);

      setTrackerTitleDraft(null);
      setStatusMessage('Tracker name updated.');
    } catch (error) {
      setErrorMessage(getUserFacingError(error, 'Unable to update tracker.'));
    } finally {
      trackerSaving.current = false;
    }
  };

  const handleVerifyTopic = async () => {
    if (!trackerId) return;

    clearMessages();

    if (!newTopicTitle.trim()) {
      setTopicVerification({
        status: 'rejected',
        message: 'Topic title is required before AI verification.',
      });
      return;
    }

    setTopicVerification({
      status: 'checking',
      message: 'AI is checking whether this topic belongs in this tracker...',
    });

    try {
      const result = await verifyTopicMutation.mutateAsync({
        trackerId,
        trackerTitle: trackerTitle.trim(),
        topicTitle: newTopicTitle.trim(),
        topicDescription: newTopicDescription.trim(),
        existingTopics: topics.map((topic) => ({
          id: topic._id,
          title: topic.title,
          description: topic.description || '',
        })),
      });

      setTopicVerification({
        status: result.verified ? 'approved' : 'rejected',
        message: result.message,
      });

      if (result.verified) {
        setNewTopicTitle(result.polishedTitle ?? newTopicTitle);
        setNewTopicDescription(result.polishedDescription ?? newTopicDescription);
        setTopicSuggestions(result.suggestedSubtopics);
        setSelectedTopicSuggestionPaths(new Set(allOutlinePaths(result.suggestedSubtopics)));
      }
    } catch (error) {
      setTopicVerification({
        status: 'rejected',
        message: getUserFacingError(error, 'AI verification failed. Please try again.'),
      });
    }
  };

  const handleVerifySubtopic = async () => {
    if (!trackerId || !activeTopic?._id) return;

    clearMessages();

    if (!newSubtopicTitle.trim()) {
      setSubtopicVerification({
        status: 'rejected',
        message: 'Subtopic title is required before AI verification.',
      });
      return;
    }

    setSubtopicVerification({
      status: 'checking',
      message: 'AI is checking whether this subtopic belongs under the selected topic...',
    });

    // If a parent subtopic is selected, include it in the topic context for AI
    const parentSubtopic = newSubtopicParentId
      ? flatSubtopics.find((s) => s.node._id === newSubtopicParentId)?.node
      : null;

    const effectiveTopicTitle = parentSubtopic
      ? `${activeTopic.title} > ${parentSubtopic.title}`
      : activeTopic.title;

    try {
      const result = await verifySubtopicMutation.mutateAsync({
        trackerId,
        trackerTitle: trackerTitle.trim(),
        topicId: activeTopic._id,
        topicTitle: effectiveTopicTitle,
        topicDescription: activeTopic.description || '',
        subtopicTitle: newSubtopicTitle.trim(),
        subtopicDescription: newSubtopicDescription.trim(),
        difficulty: newSubtopicDifficulty,
        existingSubtopics: activeSubtopics.map((subtopic) => ({
          id: subtopic._id,
          title: subtopic.title,
          description: subtopic.description || '',
          difficulty: subtopic.difficulty || subtopic.level || '',
        })),
      });

      setSubtopicVerification({
        status: result.verified ? 'approved' : 'rejected',
        message: result.message,
      });

      if (result.verified) {
        setNewSubtopicTitle(result.polishedTitle ?? newSubtopicTitle);
        setNewSubtopicDescription(result.polishedDescription ?? newSubtopicDescription);
        setSubtopicSuggestions(result.suggestedSubtopics);
        setSelectedSubtopicSuggestionPaths(new Set(allOutlinePaths(result.suggestedSubtopics)));
      }
    } catch (error) {
      setSubtopicVerification({
        status: 'rejected',
        message: getUserFacingError(error, 'AI verification failed. Please try again.'),
      });
    }
  };

  const handleCreateTopic = async () => {
    if (!trackerId || topicCreating.current) return;

    clearMessages();

    if (!newTopicTitle.trim()) {
      setErrorMessage('Topic title is required.');
      return;
    }

    if (topicVerification.status !== 'approved') {
      setErrorMessage('Please verify this topic with AI before adding it.');
      return;
    }

    topicCreating.current = true;

    try {
      await importOutlineMutation.mutateAsync({
        trackerId,
        kind: 'topics',
        topics: [
          {
            title: newTopicTitle.trim(),
            description: newTopicDescription.trim(),
            subtopics: selectedOutline(topicSuggestions, selectedTopicSuggestionPaths),
          },
        ],
      });

      setNewTopicTitle('');
      setNewTopicDescription('');
      resetTopicVerification();
      setStatusMessage('Topic and your selected AI suggestions were added.');
    } catch (error) {
      setErrorMessage(getUserFacingError(error, 'Unable to add topic.'));
    } finally {
      topicCreating.current = false;
    }
  };

  const handleCreateSubtopic = async () => {
    if (!trackerId || !activeTopic?._id || subtopicCreating.current) return;

    clearMessages();

    if (!newSubtopicTitle.trim()) {
      setErrorMessage('Subtopic title is required.');
      return;
    }

    if (subtopicVerification.status !== 'approved') {
      setErrorMessage('Please verify this subtopic with AI before adding it.');
      return;
    }

    subtopicCreating.current = true;

    try {
      await importOutlineMutation.mutateAsync({
        trackerId,
        kind: 'subtopics',
        topicId: activeTopic._id,
        parentSubtopicId: newSubtopicParentId || undefined,
        subtopics: [
          {
            title: newSubtopicTitle.trim(),
            description: newSubtopicDescription.trim(),
            subtopics: selectedOutline(subtopicSuggestions, selectedSubtopicSuggestionPaths),
          },
        ],
      });

      setNewSubtopicTitle('');
      setNewSubtopicDescription('');
      setNewSubtopicDifficulty('beginner');
      setNewSubtopicParentId(null);
      resetSubtopicVerification();
      setStatusMessage('Subtopic and your selected child suggestions were added.');
    } catch (error) {
      setErrorMessage(getUserFacingError(error, 'Unable to add subtopic.'));
    } finally {
      subtopicCreating.current = false;
    }
  };

  const handleImportJson = async () => {
    if (!trackerId || importOutlineMutation.isPending) return;
    clearMessages();

    let importedTopics: ReturnType<typeof parseTrackerOutlineJson>;
    try {
      importedTopics = parseTrackerOutlineJson(importJson);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to read this JSON outline. Check its structure and try again.'
      );
      return;
    }

    try {
      const result = await importOutlineMutation.mutateAsync({
        trackerId,
        kind: 'topics',
        topics: importedTopics,
      });
      setImportJson('');
      setShowJsonImport(false);
      setStatusMessage(
        `Imported ${result.topicsAdded} topic${result.topicsAdded === 1 ? '' : 's'} and ${result.subtopicsAdded} nested subtopic${result.subtopicsAdded === 1 ? '' : 's'}.`
      );
    } catch (error) {
      setErrorMessage(getUserFacingError(error, 'Unable to import this JSON outline.'));
    }
  };

  const handleCreateContribution = async (topicId: string, topicTitle: string) => {
    if (!trackerId || !topicId || createContributionMutation.isPending) return;
    clearMessages();
    try {
      await createContributionMutation.mutateAsync({ trackerId, topicId });
      setSubmittedTopicIds((current) => new Set(current).add(topicId));
      setStatusMessage(
        `“${topicTitle}” was sent to ${tracker?.clonedFrom?.name ?? 'the original author'} for review.`
      );
    } catch (error) {
      setErrorMessage(getUserFacingError(error, 'Unable to send this topic for review.'));
    }
  };

  const handleUpdateTopic = async () => {
    if (!trackerId || !editingTopic?.title.trim()) return;
    clearMessages();
    try {
      await updateTopicMutation.mutateAsync({
        trackerId,
        topicId: editingTopic.id,
        title: editingTopic.title.trim(),
        description: editingTopic.description.trim(),
      });
      setEditingTopic(null);
      setStatusMessage('Topic information updated.');
    } catch (error) {
      setErrorMessage(getUserFacingError(error, 'Unable to update this topic.'));
    }
  };

  const handleDeleteTopic = async () => {
    if (!trackerId || !contentPendingDelete || !canDeleteRoadmapContent) return;
    try {
      if (contentPendingDelete.type === 'topic') {
        await deleteTopicMutation.mutateAsync({ trackerId, topicId: contentPendingDelete.id });
        setSelectedTopicId(null);
      } else {
        await deleteSubtopicMutation.mutateAsync({
          trackerId,
          subtopicId: contentPendingDelete.id,
        });
      }
      setContentPendingDelete(null);
      setStatusMessage(
        contentPendingDelete.type === 'topic'
          ? 'Topic and all its subtopics were deleted.'
          : 'Subtopic branch deleted.'
      );
    } catch (error) {
      setContentPendingDelete(null);
      setErrorMessage(getUserFacingError(error, 'Unable to delete this roadmap item.'));
    }
  };

  const requestSubtopicDelete = (subtopic: RoadmapSubtopicNode) => {
    if (!canDeleteRoadmapContent) return;
    setContentPendingDelete({
      id: subtopic._id,
      title: subtopic.title,
      type: 'subtopic',
      nestedCount: countNestedSubtopics(getChildren(subtopic)),
    });
  };

  // ── Loading / error flags ──
  const isLoading =
    trackerDetailsQuery.isLoading || (!trackerIsModerated && roadmapQuery.isLoading);

  const hasError = !trackerId || trackerDetailsQuery.isError || roadmapQuery.isError;

  const savingTracker = updateTrackerMutation.isPending;
  const creatingTopic = importOutlineMutation.isPending;
  const creatingSubtopic = importOutlineMutation.isPending;

  const verifyingTopic = topicVerification.status === 'checking' || verifyTopicMutation.isPending;

  const verifyingSubtopic =
    subtopicVerification.status === 'checking' || verifySubtopicMutation.isPending;

  if (isLoading) {
    return (
      <AppShellBoundary>
        <AppPageSkeleton kind="editor" label="Loading tracker editor" />
      </AppShellBoundary>
    );
  }

  if (trackerIsModerated && trackerDetailsQuery.data) {
    return (
      <AppShellBoundary>
        <TrackerModerationNotice tracker={trackerDetailsQuery.data} />
      </AppShellBoundary>
    );
  }

  if (hasError || !tracker) {
    return (
      <AppShellBoundary>
        <div className="mx-auto flex w-full max-w-280 flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
          <EmptyPanel message="Unable to fetch this tracker for editing." />
        </div>
      </AppShellBoundary>
    );
  }

  return (
    <AppShellBoundary>
      <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 py-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] sm:px-6 sm:py-8 md:px-12 md:py-10">
        <section className="relative overflow-hidden rounded-lg bg-[#1a1714] px-5 py-6 text-[#fdf8f5] shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:bg-[#0f0e0c] sm:px-7 sm:py-7 md:px-9 md:py-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-55 w-55 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.20)_0%,transparent_70%)]" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.32)] bg-[rgba(184,76,43,0.20)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--brand-500)" />
                Manage Tracker
              </div>

              <h1 className="max-w-175 font-serif text-[clamp(24px,5vw,38px)] font-extrabold leading-[1.08] tracking-[-1px]">
                {trackerTitle || tracker.title}
              </h1>

              <p className="mt-3 max-w-175 text-sm leading-relaxed text-[#f2f0eb]/70">
                Edit tracker name, add AI-verified topics, and manage roadmap subtopics from one
                place.
              </p>
            </div>

            <div className="flex shrink-0 items-start gap-5">
              {tracker.clonedFrom && (
                <button
                  type="button"
                  onClick={() => navigate(`/community/trackers/${tracker.clonedFrom?.trackerId}`)}
                  className="cursor-pointer pt-1 text-xs font-semibold text-[#f2f0eb]/70 transition hover:text-[#fdf8f5] hover:underline"
                  title="Open the original published tracker"
                >
                  Cloned
                </button>
              )}
              <div className="flex flex-col sm:items-end">
                <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#f2f0eb]/40">
                  Topics
                </span>
                <span className="font-serif text-[34px] font-extrabold leading-none text-(--warning)">
                  {topics.length}
                </span>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#f2f0eb]/40">
                  Subtopics
                </span>
                <span className="font-serif text-[34px] font-extrabold leading-none text-[#fdf8f5]">
                  {totalSubtopics}
                </span>
              </div>
            </div>
          </div>
        </section>

        {isPublishedTracker && !isClonedTracker && clanQuery.data?.canManage && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#d6ad47]/30 bg-[linear-gradient(135deg,rgba(244,201,93,.12),rgba(184,76,43,.05))] px-5 py-4 dark:border-[#d6ad47]/20">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#171512] text-lg text-white">
                🛡
              </span>
              <div>
                <p className="font-mono text-[8px] font-bold uppercase tracking-[.16em] text-[#8a6509] dark:text-[#f4c95d]">
                  {clanQuery.data.role === 'owner' ? 'Guild owner' : 'Guild co-owner'} · shared
                  original
                </p>
                <p className="mt-1 text-[12px] text-(--text-secondary)">
                  Changes made here update the public guild tracker immediately for every member.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/trackers/${trackerId}/clan`)}
              className={subtleButtonClass}
            >
              Open guild &amp; merge requests
            </button>
          </section>
        )}

        {(statusMessage || errorMessage) && (
          <div
            className={cn(
              'rounded-md border px-4 py-3 text-[13px] font-semibold',
              statusMessage &&
                'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-(--success) dark:border-[rgba(92,201,138,0.25)] dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)',
              errorMessage &&
                'border-red-300 bg-red-50 text-red-600 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300'
            )}
          >
            {statusMessage || errorMessage}
          </div>
        )}

        {isClonedTracker && (
          <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-white/15 dark:bg-(--surface-card) sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
                  Clone changes
                </p>
                <h2 className="mt-1 font-serif text-2xl font-extrabold">Changes after cloning</h2>
                <p className="mt-2 text-[13px] text-(--text-secondary)">
                  Only topics added to your copy can be proposed to the original tracker.
                </p>
              </div>
              <span className="rounded-full border border-(--border-subtle) px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-(--text-secondary)">
                {cloneAdditions.length} added topic{cloneAdditions.length === 1 ? '' : 's'}
              </span>
            </div>

            {cloneAdditions.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-(--border-subtle) px-4 py-6 text-center text-[13px] text-(--text-secondary)">
                Topics you add after cloning will appear here.
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {cloneAdditions.map((topic) => {
                  const contribution = contributionByTopicId.get(topic._id);
                  const requestSent = submittedTopicIds.has(topic._id) || Boolean(contribution);
                  const nestedCount = countNestedSubtopics(getChildren(topic));

                  return (
                    <article
                      key={topic._id}
                      className="rounded-lg border border-(--border-subtle) bg-(--surface-canvas) p-4 dark:border-white/10"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-(--text-primary)">{topic.title}</h3>
                          {topic.description && (
                            <p className="mt-1 text-[12px] text-(--text-secondary)">
                              {topic.description}
                            </p>
                          )}
                          <p className="mt-2 font-mono text-[8px] uppercase tracking-wider text-(--text-secondary)/70">
                            {nestedCount} nested subtopic{nestedCount === 1 ? '' : 's'}
                          </p>
                        </div>
                        {contribution && (
                          <span className="rounded-full border border-(--border-subtle) px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider text-(--text-secondary)">
                            {contribution.status === 'pending'
                              ? 'Awaiting review'
                              : contribution.status}
                          </span>
                        )}
                      </div>

                      {contribution?.reviewNote && (
                        <div className="mt-3 rounded-md border border-(--border-subtle) bg-(--surface-card) px-3 py-2 text-[12px] text-(--text-secondary) dark:border-white/10">
                          <span className="font-semibold text-(--text-primary)">Owner review:</span>{' '}
                          {contribution.reviewNote}
                        </div>
                      )}

                      {!requestSent && (
                        <button
                          type="button"
                          onClick={() => void handleCreateContribution(topic._id, topic.title)}
                          disabled={createContributionMutation.isPending}
                          className={cn(buttonClass, 'mt-4')}
                        >
                          {createContributionMutation.isPending
                            ? 'Sending request...'
                            : 'Send topic request'}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <div className="flex min-w-0 flex-col gap-5">
            {/* ── Tracker name ── */}
            <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) sm:p-6">
              <div className="mb-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
                  Tracker Details
                </p>
                <h2 className="mt-1 font-serif text-2xl font-extrabold tracking-[-0.5px]">
                  Edit tracker name
                </h2>
              </div>

              <div>
                <label className={labelClass}>Tracker name</label>
                <input
                  value={trackerTitle}
                  onChange={(event) => setTrackerTitleDraft(event.target.value)}
                  className={inputClass}
                  placeholder="Example: MERN Stack Interview Roadmap"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveTracker}
                  disabled={savingTracker}
                  className={buttonClass}
                >
                  {savingTracker ? 'Saving...' : 'Save Name'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/trackers/${trackerId}/roadmap`)}
                  className={subtleButtonClass}
                >
                  Open Roadmap
                </button>
              </div>
            </section>

            {/* ── Topics & subtopics ── */}
            <section className="overflow-hidden rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card)">
              <div className="border-b border-(--border-subtle) p-5 dark:border-white/15 sm:p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
                  Current Roadmap
                </p>
                <h2 className="mt-1 font-serif text-2xl font-extrabold tracking-[-0.5px]">
                  Topics &amp; subtopics
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)">
                  Select a topic to view its subtopics. Nested subtopics are shown indented below
                  their parent.
                </p>
              </div>

              {topics.length ? (
                <>
                  <div className="flex flex-wrap gap-2 px-4 pt-4 sm:px-6 sm:pt-5">
                    {topics.map((topic) => {
                      const active = topic._id === activeTopic?._id;

                      return (
                        <button
                          key={topic._id}
                          type="button"
                          onClick={() => {
                            setSelectedTopicId(topic._id);
                            resetSubtopicVerification();
                            setNewSubtopicParentId(null);
                          }}
                          className={cn(
                            'rounded-full border-[1.5px] px-3 py-2 text-[12.5px] font-medium transition',
                            active
                              ? 'border-(--brand-500) bg-(--brand-500) text-[#fdf8f5] dark:border-(--brand-500) dark:bg-(--brand-500) dark:text-[#141412]'
                              : 'border-(--border-subtle) bg-transparent text-(--text-secondary) hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-white/15 dark:text-(--text-secondary)'
                          )}
                        >
                          {topic.title}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 border-y-[1.5px] border-(--border-subtle) px-4 py-4 dark:border-white/15 sm:px-6">
                    <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-(--text-secondary)/60 dark:text-(--text-secondary)/60">
                      Selected Topic
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-serif text-[clamp(18px,3vw,24px)] font-bold tracking-[-0.3px] text-(--brand-500) dark:text-(--brand-500)">
                        {activeTopic?.title || 'Roadmap Topic'}
                      </h3>
                      {canEditActiveTopic && activeTopic && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTopic({
                                id: activeTopic._id,
                                title: activeTopic.title,
                                description: activeTopic.description || '',
                              })
                            }
                            className={cn(subtleButtonClass, 'px-3 py-2 text-[11px]')}
                          >
                            Edit info
                          </button>
                          {canDeleteRoadmapContent && (
                            <button
                              type="button"
                              onClick={() =>
                                setContentPendingDelete({
                                  id: activeTopic._id,
                                  title: activeTopic.title,
                                  type: 'topic',
                                  nestedCount: countNestedSubtopics(getChildren(activeTopic)),
                                })
                              }
                              className={cn(
                                subtleButtonClass,
                                'px-3 py-2 text-[11px] hover:border-red-500 hover:text-red-500'
                              )}
                            >
                              Delete topic
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {activeTopic?.description && (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)">
                        {activeTopic.description}
                      </p>
                    )}

                    {editingTopic?.id === activeTopic?._id && (
                      <div className="mt-4 grid gap-3 rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4 dark:border-white/15">
                        <input
                          value={editingTopic.title}
                          onChange={(event) =>
                            setEditingTopic((current) =>
                              current ? { ...current, title: event.target.value } : current
                            )
                          }
                          className={inputClass}
                          placeholder="Topic title"
                        />
                        <textarea
                          value={editingTopic.description}
                          onChange={(event) =>
                            setEditingTopic((current) =>
                              current ? { ...current, description: event.target.value } : current
                            )
                          }
                          className={cn(inputClass, 'min-h-20 resize-y')}
                          placeholder="Topic description"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleUpdateTopic()}
                            disabled={updateTopicMutation.isPending}
                            className={buttonClass}
                          >
                            {updateTopicMutation.isPending ? 'Saving...' : 'Save topic'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTopic(null)}
                            className={subtleButtonClass}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--text-secondary)/60 dark:text-(--text-secondary)/60">
                          Subtopics
                        </p>
                        <h3 className="font-serif text-xl font-bold tracking-[-0.3px]">
                          {activeTopic?.title || 'Selected topic'} lessons
                        </h3>
                      </div>

                      <span className="rounded-full border border-(--border-subtle) px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
                        {countNestedSubtopics(activeSubtopics)} items
                      </span>
                    </div>

                    {activeSubtopics.length ? (
                      <div className="space-y-3">
                        {activeSubtopics.map((subtopic, index) => (
                          <SubtopicTreeNode
                            key={subtopic._id}
                            subtopic={subtopic}
                            index={index}
                            depth={0}
                            canDelete={canDeleteRoadmapContent}
                            onDelete={requestSubtopicDelete}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-(--border-subtle) p-5 text-center text-sm text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
                        This topic has no subtopics yet.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <h3 className="font-serif text-xl font-bold text-(--text-primary) dark:text-(--text-primary)">
                    No roadmap topics yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)">
                    Add a topic from the side panel to start building your roadmap.
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-5">
            {/* ── Import JSON ── */}
            <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[.14em] text-(--brand-500)">
                    Fast build
                  </p>
                  <h3 className="mt-1 font-serif text-[18px] font-bold">Import JSON</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowJsonImport((value) => !value)}
                  className={cn(subtleButtonClass, 'px-3 py-2 text-[11px]')}
                >
                  {showJsonImport ? 'Close' : 'Import'}
                </button>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-(--text-secondary)">
                Paste a complete recursive outline. Nested <code>subtopics</code> are created at
                every level.
              </p>
              {showJsonImport && (
                <div className="mt-4 grid gap-3">
                  <textarea
                    value={importJson}
                    onChange={(event) => setImportJson(event.target.value)}
                    className={cn(inputClass, 'min-h-72 resize-y font-mono text-[11px]')}
                    placeholder={trackerOutlineExample}
                    spellCheck={false}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setImportJson(trackerOutlineExample)}
                      className={cn(subtleButtonClass, 'px-3 py-2 text-[11px]')}
                    >
                      Use example
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleImportJson()}
                      disabled={!importJson.trim() || importOutlineMutation.isPending}
                      className={cn(buttonClass, 'px-3 py-2 text-[11px]')}
                    >
                      {importOutlineMutation.isPending ? 'Importing tree...' : 'Validate & import'}
                    </button>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-(--text-secondary)">
                    Accepted root: <code>{'{ "topics": [...] }'}</code> or a direct topics array. Up
                    to 250 items and 8 nested levels.
                  </p>
                </div>
              )}
            </section>

            {/* ── Add Topic ── */}
            <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card)">
              <h3 className="font-serif text-[18px] font-bold tracking-[-0.3px]">Add Topic</h3>

              <p className="mt-1 text-[12.5px] leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)">
                Verify the topic with AI first. You can add it only if it belongs to this tracker.
              </p>

              <div className="mt-4 grid gap-3">
                <div>
                  <label className={labelClass}>Topic title</label>
                  <input
                    value={newTopicTitle}
                    onChange={(event) => handleTopicTitleChange(event.target.value)}
                    className={inputClass}
                    placeholder="Example: React Hooks"
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={newTopicDescription}
                    onChange={(event) => handleTopicDescriptionChange(event.target.value)}
                    className={cn(inputClass, 'min-h-20 resize-y')}
                    placeholder="What this topic covers"
                  />
                </div>

                {topicVerification.status !== 'idle' && (
                  <div className={getVerificationMessageClass(topicVerification.status)}>
                    {topicVerification.message}
                  </div>
                )}

                {topicVerification.status === 'approved' && topicSuggestions.length > 0 && (
                  <div className="rounded-xl border border-[rgba(184,76,43,.22)] bg-[rgba(184,76,43,.06)] p-3">
                    <div className="mb-3">
                      <p className="text-[12px] font-bold text-(--text-primary)">
                        Choose suggested subtopics
                      </p>
                      <p className="mt-1 text-[10.5px] leading-relaxed text-(--text-secondary)">
                        AI found useful children. Only checked items will be added with the topic.
                      </p>
                    </div>
                    <OutlineSuggestionPicker
                      nodes={topicSuggestions}
                      selectedPaths={selectedTopicSuggestionPaths}
                      onChange={setSelectedTopicSuggestionPaths}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyTopic}
                    disabled={!topicTitleReady || verifyingTopic || creatingTopic}
                    className={subtleButtonClass}
                  >
                    {verifyingTopic ? 'Verifying with AI...' : 'Verify with AI'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateTopic}
                    disabled={!canAddTopic}
                    className={buttonClass}
                    title={
                      topicVerification.status === 'approved'
                        ? 'Add verified topic'
                        : 'Verify this topic with AI before adding'
                    }
                  >
                    {creatingTopic ? 'Adding topic...' : 'Add Topic'}
                  </button>
                </div>
              </div>
            </section>

            {/* ── Add Subtopic ── */}
            <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card)">
              <h3 className="font-serif text-[18px] font-bold tracking-[-0.3px]">Add Subtopic</h3>

              <p className="mt-1 text-[12.5px] leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)">
                Verify the subtopic with AI first. Optionally nest it under an existing subtopic.
              </p>

              <div className="mt-4 grid gap-3">
                {/* Selected topic display */}
                <div>
                  <label className={labelClass}>Selected topic</label>
                  <div className="rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-canvas) px-3.5 py-3 text-[13px] font-bold text-(--brand-500) dark:border-white/15 dark:bg-(--surface-canvas) dark:text-(--brand-500)">
                    {activeTopic?.title || 'No topic selected'}
                  </div>
                </div>

                {/* Parent subtopic selector */}
                <div>
                  <label className={labelClass}>
                    Parent subtopic{' '}
                    <span className="normal-case tracking-normal opacity-60">
                      (optional — for nested subtopics)
                    </span>
                  </label>
                  <select
                    value={newSubtopicParentId || ''}
                    onChange={(event) => handleSubtopicParentChange(event.target.value)}
                    className={inputClass}
                    disabled={!activeTopic || flatSubtopics.length === 0}
                  >
                    <option value="">None — add as top-level subtopic</option>
                    {flatSubtopics.map(({ node, depth }) => (
                      <option key={node._id} value={node._id}>
                        {'  '.repeat(depth)}
                        {depth > 0 ? '└ ' : ''}
                        {node.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show selected parent badge */}
                {newSubtopicParentId && (
                  <div className="flex items-center gap-2 rounded-md border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.07)] px-3 py-2 dark:border-[rgba(232,129,106,0.20)] dark:bg-[rgba(232,129,106,0.08)]">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                      Nesting under:
                    </span>
                    <span className="text-[12.5px] font-semibold text-(--brand-500) dark:text-(--brand-500)">
                      {flatSubtopics.find((s) => s.node._id === newSubtopicParentId)?.node.title ||
                        '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewSubtopicParentId(null);
                        resetSubtopicVerification();
                      }}
                      className="ml-auto font-mono text-[10px] text-(--text-secondary) hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Subtopic title</label>
                  <input
                    value={newSubtopicTitle}
                    onChange={(event) => handleSubtopicTitleChange(event.target.value)}
                    className={inputClass}
                    placeholder="Example: useEffect cleanup"
                    disabled={!activeTopic}
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={newSubtopicDescription}
                    onChange={(event) => handleSubtopicDescriptionChange(event.target.value)}
                    className={cn(inputClass, 'min-h-20 resize-y')}
                    placeholder="What learner should understand"
                    disabled={!activeTopic}
                  />
                </div>

                <div>
                  <label className={labelClass}>Difficulty</label>
                  <select
                    value={newSubtopicDifficulty}
                    onChange={(event) =>
                      handleSubtopicDifficultyChange(event.target.value as SubtopicDifficulty)
                    }
                    className={inputClass}
                    disabled={!activeTopic}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {subtopicVerification.status !== 'idle' && (
                  <div className={getVerificationMessageClass(subtopicVerification.status)}>
                    {subtopicVerification.message}
                  </div>
                )}

                {subtopicVerification.status === 'approved' && subtopicSuggestions.length > 0 && (
                  <div className="rounded-xl border border-[rgba(184,76,43,.22)] bg-[rgba(184,76,43,.06)] p-3">
                    <p className="text-[12px] font-bold text-(--text-primary)">
                      Add child suggestions?
                    </p>
                    <p className="mb-3 mt-1 text-[10.5px] leading-relaxed text-(--text-secondary)">
                      Keep the useful children checked. Unchecked suggestions will not be created.
                    </p>
                    <OutlineSuggestionPicker
                      nodes={subtopicSuggestions}
                      selectedPaths={selectedSubtopicSuggestionPaths}
                      onChange={setSelectedSubtopicSuggestionPaths}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={handleVerifySubtopic}
                    disabled={
                      !activeTopic || !subtopicTitleReady || verifyingSubtopic || creatingSubtopic
                    }
                    className={subtleButtonClass}
                  >
                    {verifyingSubtopic ? 'Verifying with AI...' : 'Verify with AI'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateSubtopic}
                    disabled={!canAddSubtopic}
                    className={buttonClass}
                    title={
                      subtopicVerification.status === 'approved'
                        ? 'Add verified subtopic'
                        : 'Verify this subtopic with AI before adding'
                    }
                  >
                    {creatingSubtopic ? 'Adding subtopic...' : 'Add Subtopic'}
                  </button>
                </div>
              </div>
            </section>

            {/* ── Summary ── */}
            <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 dark:border-white/15 dark:bg-(--surface-card)">
              <h3 className="font-serif text-[18px] font-bold tracking-[-0.3px]">Summary</h3>

              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between rounded-md border border-(--border-subtle) px-3 py-3 dark:border-white/15">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Topics
                  </span>
                  <span className="font-serif text-[22px] font-bold text-(--brand-500) dark:text-(--brand-500)">
                    {topics.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-md border border-(--border-subtle) px-3 py-3 dark:border-white/15">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Subtopics
                  </span>
                  <span className="font-serif text-[22px] font-bold text-(--brand-500) dark:text-(--brand-500)">
                    {totalSubtopics}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </main>
      <ConfirmDialog
        open={unsavedChangesGuard.isBlocked}
        title="Discard unsaved tracker changes?"
        description="The tracker name or topic drafts on this page have not been saved. Leaving now will remove those drafts."
        confirmText="Discard and leave"
        cancelText="Keep editing"
        variant="danger"
        onClose={unsavedChangesGuard.stayOnPage}
        onConfirm={unsavedChangesGuard.discardAndLeave}
      />
      <ConfirmDialog
        open={Boolean(contentPendingDelete)}
        title={`Delete “${contentPendingDelete?.title ?? 'roadmap item'}”?`}
        description={
          contentPendingDelete?.type === 'topic'
            ? `This permanently removes the topic and all ${contentPendingDelete.nestedCount} subtopics beneath it.`
            : contentPendingDelete?.nestedCount
              ? `This permanently removes the subtopic and ${contentPendingDelete.nestedCount} nested subtopics beneath it.`
              : 'This permanently removes this subtopic.'
        }
        confirmText={
          deleteTopicMutation.isPending || deleteSubtopicMutation.isPending
            ? 'Deleting...'
            : 'Delete permanently'
        }
        cancelText="Keep it"
        variant="danger"
        onClose={() => setContentPendingDelete(null)}
        onConfirm={() => void handleDeleteTopic()}
      />
    </AppShellBoundary>
  );
}
