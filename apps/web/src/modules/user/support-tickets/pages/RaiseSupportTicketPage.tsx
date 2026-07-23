import { useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, LifeBuoy, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCreateSupportTicket } from '../hooks/useCreateSupportTicket';
import type { CreateSupportTicketInput } from '../types/support-tickets.types';
import { ROUTES } from '../../../../routes/config/route-paths';
import PageHero from '../../../../components/layout/PageHero';

const initial: CreateSupportTicketInput = {
  subject: '',
  description: '',
  category: 'technical',
  priority: 'medium',
};
export default function RaiseSupportTicketPage() {
  const [form, setForm] = useState(initial);
  const create = useCreateSupportTicket();
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
              Your ticket ID is {create.data.id}. The support team can now review it from the admin
              console.
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
            <Field label="Subject">
              <input
                required
                minLength={5}
                maxLength={160}
                value={form.subject}
                onChange={(e) => setForm((value) => ({ ...value, subject: e.target.value }))}
                placeholder="Briefly describe the problem"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category">
                <select
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
                </select>
              </Field>
              <Field label="Priority">
                <select
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
                </select>
              </Field>
            </div>
            <Field label="What happened?">
              <textarea
                required
                minLength={20}
                maxLength={3000}
                rows={8}
                value={form.description}
                onChange={(e) => setForm((value) => ({ ...value, description: e.target.value }))}
                placeholder="Include what you expected, what happened, and any steps that reproduce the issue."
              />
            </Field>
            {create.isError && (
              <p className="text-sm text-(--danger)">
                The ticket could not be submitted. Please check the details and try again.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link to={ROUTES.dashboard} className="text-sm text-(--text-secondary)">
                Cancel
              </Link>
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
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-(--text-secondary) [&_input]:rounded-lg [&_input]:border [&_input]:border-(--border-subtle) [&_input]:bg-(--surface-elevated) [&_input]:p-3 [&_input]:text-sm [&_input]:font-normal [&_input]:normal-case [&_input]:text-(--text-primary) [&_select]:rounded-lg [&_select]:border [&_select]:border-(--border-subtle) [&_select]:bg-(--surface-elevated) [&_select]:p-3 [&_select]:text-sm [&_select]:font-normal [&_select]:normal-case [&_select]:text-(--text-primary) [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-(--border-subtle) [&_textarea]:bg-(--surface-elevated) [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:font-normal [&_textarea]:normal-case [&_textarea]:text-(--text-primary)">
      {label}
      {children}
    </label>
  );
}
