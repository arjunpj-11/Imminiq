import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { ApiEnvelope } from '../../lib/api.types';
import { getUserFacingError } from '../../lib/user-facing-error';

type ContentAppeal = { id: string; targetType: 'tracker' | 'mock_test'; targetId: string; reason: string; evidenceUrls: string[]; status: 'pending' | 'under_review' | 'approved' | 'rejected'; decisionNote?: string; createdAt: string };

export function ContentModerationAppealPanel({ targetType, targetId }: { targetType: 'tracker' | 'mock_test'; targetId: string }) {
  const key = ['content-moderation-appeals'] as const;
  const client = useQueryClient();
  const query = useQuery({ queryKey: key, queryFn: async () => (await api.get<ApiEnvelope<ContentAppeal[]>>('/moderation-appeals/content')).data.data });
  const existing = query.data?.find((item) => item.targetType === targetType && item.targetId === targetId);
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const submit = useMutation({
    mutationFn: () => api.post('/moderation-appeals/content', { targetType, targetId, reason: reason.trim(), evidenceUrls: evidence.split('\n').map((value) => value.trim()).filter(Boolean) }),
    onSuccess: async () => { setReason(''); setEvidence(''); await client.invalidateQueries({ queryKey: key }); },
  });
  return <section className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5" aria-labelledby={`content-appeal-${targetId}`}><h2 id={`content-appeal-${targetId}`} className="font-ui text-lg font-black text-(--text-primary)">Appeal this moderation decision</h2>{existing ? <div className="mt-3 text-sm"><span className="rounded-full bg-black/5 px-2 py-1 font-semibold capitalize dark:bg-white/10">{existing.status.replace('_', ' ')}</span><p className="mt-3 text-(--text-secondary)">{existing.reason}</p>{existing.decisionNote && <p className="mt-2 font-semibold">Decision: {existing.decisionNote}</p>}</div> : <><p className="mt-1 text-sm text-(--text-secondary)">Content owners can explain why this decision should be reviewed and attach supporting links.</p><label className="mt-4 block text-xs font-bold text-(--text-secondary)">Appeal reason<textarea className="mt-2 min-h-28 w-full rounded-lg border border-(--border-subtle) bg-(--surface-card) p-3 text-sm text-(--text-primary)" maxLength={3000} value={reason} onChange={(event) => setReason(event.target.value)}/></label><label className="mt-3 block text-xs font-bold text-(--text-secondary)">Evidence URLs (one per line, optional)<textarea className="mt-2 min-h-20 w-full rounded-lg border border-(--border-subtle) bg-(--surface-card) p-3 text-sm text-(--text-primary)" value={evidence} onChange={(event) => setEvidence(event.target.value)}/></label>{submit.isError && <p className="mt-2 text-sm text-red-600">{getUserFacingError(submit.error)}</p>}<button className="mt-3 rounded-md bg-(--brand-500) px-4 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={reason.trim().length < 20 || submit.isPending} onClick={() => submit.mutate()}>{submit.isPending ? 'Submitting…' : 'Submit appeal'}</button></>}</section>;
}
