import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, LifeBuoy, Send } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import FormField from '../../../../components/forms/FormField';
import Input from '../../../../components/forms/Input';
import Select from '../../../../components/forms/Select';
import Textarea from '../../../../components/forms/Textarea';
import { useCreateSupportTicket } from '../hooks/useCreateSupportTicket';
import type { CreateSupportTicketInput } from '../types/support-tickets.types';
import { ROUTES } from '../../../../routes/config/route-paths';
import PageHero from '../../../../components/layout/PageHero';
import { safeSessionStorage } from '../../../../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';

const initial: CreateSupportTicketInput = {
  subject: '',
  description: '',
  category: 'technical',
  priority: 'medium',
};
export default function RaiseSupportTicketPage() {
  const [searchParams] = useSearchParams();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [form, setForm] = useState<CreateSupportTicketInput>(() => {
    let saved = initial;
    try {
      const parsed = JSON.parse(
        safeSessionStorage.get(STORAGE_KEYS.supportTicketDraft) ?? 'null'
      ) as CreateSupportTicketInput | null;
      if (parsed) saved = parsed;
    } catch {
      saved = initial;
    }
    return {
      ...initial,
      ...saved,
      subject: searchParams.get('subject')?.slice(0, 160) || saved.subject,
      description: searchParams.get('description')?.slice(0, 3000) || saved.description,
      category:
        (searchParams.get('category') as CreateSupportTicketInput['category'] | null) ??
        saved.category,
    };
  });
  const create = useCreateSupportTicket();
  const isDirty = Object.entries(form).some(
    ([key, value]) => value !== initial[key as keyof CreateSupportTicketInput]
  );

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || create.isSuccess) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [create.isSuccess, isDirty]);

  useEffect(() => {
    if (create.isSuccess || !isDirty) {
      safeSessionStorage.remove(STORAGE_KEYS.supportTicketDraft);
      return;
    }
    safeSessionStorage.set(STORAGE_KEYS.supportTicketDraft, JSON.stringify(form));
  }, [create.isSuccess, form, isDirty]);

  useEffect(() => {
    if (create.isError) errorRef.current?.focus();
  }, [create.isError]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(form, { onSuccess: () => setForm(initial) });
  };
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <PageHero
        eyebrow="Imminiq support"
        title="How can we help?"
        description="Tell us what happened and include enough context for the support team to reproduce the issue quickly."
        compact
        className="mb-7"
        aside={
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand-500)_14%,transparent)] text-(--brand-500)">
              <LifeBuoy />
            </span>
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
                Support desk
              </div>
              <div className="mt-1 text-[13px] font-bold text-(--text-primary)">
                Clear details get faster answers.
              </div>
            </div>
          </div>
        }
      />
      <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) sm:p-8">
        {create.isSuccess ? (
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] p-5">
            <CheckCircle2 className="text-(--success)" />
            <h2 className="mt-3 font-bold text-(--text-primary)">Ticket submitted</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Your ticket ID is {create.data.id}. Keep this ID for reference; important updates will
              appear in Notifications.
            </p>
            <button
              onClick={() => create.reset()}
              className="mt-4 text-sm font-semibold text-(--brand-500)"
            >
              Raise another ticket
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <FormField label="Subject" required labelClassName="uppercase tracking-wider">
              <Input
                required
                minLength={5}
                maxLength={160}
                value={form.subject}
                onChange={(e) => setForm((value) => ({ ...value, subject: e.target.value }))}
                placeholder="Briefly describe the problem"
              />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Category" labelClassName="uppercase tracking-wider">
                <Select
                  value={form.category}
                  onChange={(e) =>
                    setForm((value) => ({
                      ...value,
                      category: e.target.value as CreateSupportTicketInput['category'],
                    }))
                  }
                >
                  <option value="account">Account</option>
                  <option value="learning">Learning</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="other">Other</option>
                </Select>
              </FormField>
              <FormField label="Priority" labelClassName="uppercase tracking-wider">
                <Select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((value) => ({
                      ...value,
                      priority: e.target.value as CreateSupportTicketInput['priority'],
                    }))
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormField>
            </div>
            <div className="rounded-xl border border-(--border-subtle) bg-(--surface-muted) px-4 py-3 text-[12px] leading-5 text-(--text-secondary)">
              <strong className="text-(--text-primary)">
                {form.category === 'technical'
                  ? 'Helpful details: '
                  : form.category === 'billing'
                    ? 'For billing issues: '
                    : form.category === 'learning'
                      ? 'For learning content: '
                      : 'Helpful context: '}
              </strong>
              {form.category === 'technical'
                ? 'include the page, what you clicked, and the exact error you saw.'
                : form.category === 'billing'
                  ? 'include the plan and payment date, but never share card numbers or OTPs.'
                  : form.category === 'learning'
                    ? 'include the tracker and lesson name, plus what seemed incorrect or unclear.'
                    : 'describe what you expected and what happened instead.'}
            </div>
            <FormField label="What happened?" required labelClassName="uppercase tracking-wider">
              <Textarea
                required
                minLength={20}
                maxLength={3000}
                rows={8}
                value={form.description}
                onChange={(e) => setForm((value) => ({ ...value, description: e.target.value }))}
                placeholder="Include what you expected, what happened, and any steps that reproduce the issue."
              />
            </FormField>
            {create.isError && (
              <p ref={errorRef} tabIndex={-1} className="text-sm text-(--danger)">
                The ticket could not be submitted. Please check the details and try again.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link to={ROUTES.dashboard} className="text-sm text-(--text-secondary)">
                  Cancel
                </Link>
                <p className="mt-1 text-[11px] text-(--text-muted)">
                  Draft saved for this browser session
                </p>
              </div>
              <button
                disabled={create.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-(--brand-500) px-5 py-3 text-sm font-bold text-white hover:bg-(--brand-600) disabled:opacity-50"
              >
                <Send size={16} />
                {create.isPending ? 'Submitting…' : 'Submit ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
