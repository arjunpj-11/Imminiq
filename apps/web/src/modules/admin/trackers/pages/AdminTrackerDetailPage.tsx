import { ArrowLeft, Clock3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '../../../../components/admin/AdminPage';
import { useAdminTrackerDetail } from '../hooks/useAdminTrackers';
import type { AdminTrackerSubtopic } from '../types/admin-trackers.types';

export default function AdminTrackerDetailPage() {
  const { trackerId } = useParams();
  const { data, isLoading, isError } = useAdminTrackerDetail(trackerId);
  if (isLoading) return <AdminLoading />;
  if (isError || !data) return <AdminError />;
  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
      <Link
        to="/admin/trackers"
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} />
        Back to trackers
      </Link>
      <AdminPageHeader
        title={data.title}
        description={data.description || 'No tracker description provided.'}
        action={
          <div className="flex gap-2">
            <AdminStatusBadge value={data.status} />
            <AdminStatusBadge value={data.visibility} />
          </div>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Info
          label="Owner"
          value={`${data.owner}${data.ownerEmail ? ` · ${data.ownerEmail}` : ''}`}
        />
        <Info label="Category and level" value={`${data.category} · ${data.level}`} />
        <Info
          label="Learning structure"
          value={`${data.topics.length} topics · ${data.topics.reduce((sum, topic) => sum + topic.subtopics.length, 0)} subtopics`}
        />
      </div>
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
                  <span className="flex items-center gap-1 text-xs text-[#817c75]">
                    <Clock3 size={13} />
                    {topic.estimatedHours}h
                  </span>
                </div>
                <SubtopicTree items={topic.subtopics} parentId={null} />
              </section>
            ))}
          </div>
        )}
      </AdminPanel>
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
              <span className="text-[10px] text-[#817c75]">{item.estimatedMinutes} min</span>
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
