import { useState } from 'react';
import { ArrowLeft, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '../../../../components/admin';
import { useAdminTrackerDetail } from '../hooks/useAdminTrackerDetail';
import type {
  AdminTrackerLifecyclePayload,
  AdminTrackerSubtopic,
} from '../types/admin-trackers.types';
import { ADMIN_TRACKERS_ROUTES } from '../constants/admin-trackers.constants';
import AdminTrackerModerationDialog from '../components/AdminTrackerModerationDialog';
import { useAuthStore } from '../../../../store/useAuthStore';
import { isAdminRole } from '../../../../lib/auth-roles';

export default function AdminTrackerDetailPage() {
  const [moderating, setModerating] = useState<AdminTrackerLifecyclePayload['action'] | null>(null);
  const canManageLifecycle = useAuthStore((state) => isAdminRole(state.user?.role));
  const { trackerId } = useParams();
  const location = useLocation();
  const fromTrackerReview = Boolean(
    (location.state as { fromTrackerReview?: boolean } | null)?.fromTrackerReview
  );
  const { data, isLoading, isError, error, refetch } = useAdminTrackerDetail(trackerId);
  if (isLoading)
    return (
      <main className="mx-auto max-w-275 px-5 py-8 sm:px-8">
        <AdminLoading variant="detail" />
      </main>
    );
  if (isError || !data) return <AdminError error={error} onRetry={() => void refetch()} />;
  return (
    <main className="mx-auto max-w-275 px-5 py-8 sm:px-8">
      <Link
        to={fromTrackerReview ? ADMIN_TRACKERS_ROUTES.reviews : ADMIN_TRACKERS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} />
        {fromTrackerReview ? 'Back to community reviews' : 'Back to trackers'}
      </Link>
      <AdminPageHeader
        title={data.title}
        description={data.description || 'No tracker description provided.'}
        action={
          <div className="flex gap-2">
            <AdminStatusBadge value={data.status} />
            <AdminStatusBadge value={data.visibility} />
            <AdminStatusBadge value={data.moderationStatus} />
            {canManageLifecycle && data.moderationStatus === 'active' && (
              <button
                type="button"
                onClick={() => setModerating('suspend')}
                className="admin-button inline-flex items-center gap-2 text-[#f0a842]"
              >
                <ShieldAlert size={15} /> Suspend
              </button>
            )}
            {canManageLifecycle && data.moderationStatus !== 'deleted' && (
              <button
                type="button"
                onClick={() => setModerating('delete')}
                className="admin-button inline-flex items-center gap-2 text-[#e26767]"
              >
                <Trash2 size={15} /> Delete
              </button>
            )}
            {canManageLifecycle && data.moderationStatus !== 'active' && (
              <button
                type="button"
                onClick={() => setModerating('restore')}
                className="admin-button inline-flex items-center gap-2 text-[#52c58c]"
              >
                <RotateCcw size={15} /> Restore
              </button>
            )}
          </div>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-6">
        <Info
          label="Owner"
          value={`${data.owner}${data.ownerEmail ? ` · ${data.ownerEmail}` : ''}`}
        />
        <Info label="Category and level" value={`${data.category} · ${data.level}`} />
        <Info
          label="Learning structure"
          value={`${data.topics.length} topics · ${data.topics.reduce((sum, topic) => sum + topic.subtopics.length, 0)} subtopics`}
        />
        <Info label="Reports" value={`${data.openReportCount} open · ${data.reportCount} total`} />
        <Info label="Personal clones" value={String(data.cloneCount)} />
        <Info label="Moderation" value={data.moderationStatus} />
      </div>
      {data.moderationReason && (
        <div className="mt-5 rounded-xl border border-[#f0a842]/30 bg-[#f0a842]/10 p-4 text-sm text-[#f0c060]">
          <strong>Moderation reason:</strong> {data.moderationReason}
        </div>
      )}
      <AdminPanel title="Topics and subtopics">
        {!data.topics.length ? (
          <AdminEmpty>This tracker does not contain any topics.</AdminEmpty>
        ) : (
          <div className="space-y-5 p-6">
            {data.topics.map((topic) => (
              <section
                key={topic.id}
                className="rounded-xl border border-white/10 bg-[#24211e] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#e8816a]">
                      Topic {topic.order}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">{topic.title}</h3>
                    <p className="mt-1 text-sm text-[#aaa59d]">
                      {topic.description || 'No description'}
                    </p>
                  </div>
                </div>
                <SubtopicTree items={topic.subtopics} parentId={null} />
              </section>
            ))}
          </div>
        )}
      </AdminPanel>
      <AdminPanel title="Moderation history">
        {!data.moderationHistory.length ? (
          <AdminEmpty>No administrative changes have been recorded for this tracker.</AdminEmpty>
        ) : (
          <div className="divide-y divide-white/10">
            {data.moderationHistory.map((item) => (
              <div key={item.id} className="flex flex-wrap justify-between gap-3 p-5 text-sm">
                <div>
                  <div className="font-semibold">{item.action.replaceAll('_', ' ')}</div>
                  <div className="mt-1 text-xs text-[#aaa59d]">
                    By {item.actor}
                    {item.reason ? ` · ${item.reason}` : ''}
                  </div>
                </div>
                <time className="text-xs text-[#817c75]">
                  {new Date(item.createdAt).toLocaleString()}
                </time>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
      <AdminTrackerModerationDialog
        key={`${data.id}-${moderating ?? 'closed'}`}
        tracker={moderating ? data : null}
        action={moderating ?? 'suspend'}
        onClose={() => setModerating(null)}
        onComplete={() => {
          setModerating(null);
          void refetch();
        }}
      />
    </main>
  );
}
function SubtopicTree({
  items,
  parentId,
}: {
  items: AdminTrackerSubtopic[];
  parentId: string | null;
}) {
  const children = items.filter((item) => item.parentSubtopicId === parentId);
  if (!children.length) return null;
  return (
    <div className={`${parentId ? 'ml-5 border-l border-white/10 pl-4' : 'mt-4'} space-y-2`}>
      {children.map((item) => (
        <div key={item.id}>
          <div className="rounded-lg border border-white/10 bg-[#1c1a18] p-3">
            <div className="flex justify-between gap-3">
              <span className="font-medium">{item.title}</span>
            </div>
            {item.description && <p className="mt-1 text-xs text-[#aaa59d]">{item.description}</p>}
          </div>
          <SubtopicTree items={items} parentId={item.id} />
        </div>
      ))}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1c1a18] p-5">
      <div className="text-[10px] uppercase tracking-wider text-[#817c75]">{label}</div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </div>
  );
}
