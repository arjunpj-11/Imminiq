import { useEffect, useState } from 'react'
import type { TrackerDomain, TrackerLevel } from '../../../types/tracker.types'
import { useCreateTracker } from '../../../hooks/trackers/useTrackers'
import { cn, themedScrollbar, trackerDomainOptions } from '../utils/tracker-ui'

interface NewTrackerPanelProps { open: boolean; onClose: () => void }

const inputCls = "w-full rounded-[9px] border-[1.5px] border-[#e0d0c5] bg-white px-3.5 py-2.5 text-[13.5px] text-[#1a1714] outline-none transition placeholder:text-[#9f8f86] focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb] dark:placeholder:text-[#7a756e] dark:focus:border-[#e8816a]"
const labelCls = "mb-1.5 block font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.13em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]"

export default function NewTrackerPanel({ open, onClose }: NewTrackerPanelProps) {
  const createTrackerMutation = useCreateTracker()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [domain, setDomain] = useState<TrackerDomain>('development')
  const [level, setLevel] = useState<TrackerLevel>('beginner')

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleCreate = async () => {
    if (title.trim().length < 2) return
    await createTrackerMutation.mutateAsync({ title: title.trim(), description: description.trim(), goal: goal.trim(), domain, level })
    setTitle('')
    setDescription('')
    setGoal('')
    onClose()
  }

  return (
    <>
      <div onClick={onClose} className={cn('fixed inset-0 z-100 bg-[rgba(26,23,20,0.55)] backdrop-blur transition dark:bg-black/70', open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')} />
      <aside className={cn('fixed bottom-0 right-0 top-0 z-101 flex w-[min(520px,100vw)] flex-col overflow-hidden border-l border-[#e0d0c5] bg-[#fdf8f5] shadow-[-8px_0_48px_rgba(26,23,20,0.14)] transition-transform duration-300 dark:border-white/9 dark:bg-[#1e1c19]', open ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex items-center justify-between border-b border-[#e0d0c5] px-5 py-4 dark:border-white/9">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px]">Create Tracker</h2>
            <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">Start a focused roadmap and track every lesson.</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-[10px] border-[1.5px] border-[#e0d0c5] text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]">×</button>
        </div>
        <div className={cn('flex-1 overflow-y-auto p-5', themedScrollbar)}>
          <div className="space-y-4">
            <label><span className={labelCls}>Title</span><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="MERN Stack Zero to Hero" /></label>
            <label><span className={labelCls}>Description</span><textarea className={cn(inputCls, 'min-h-24 resize-y leading-[1.6]')} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this tracker covers" /></label>
            <label><span className={labelCls}>Goal</span><textarea className={cn(inputCls, 'min-h-20 resize-y leading-[1.6]')} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Example: become interview ready for full-stack roles" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className={labelCls}>Domain</span><select className={inputCls} value={domain} onChange={(e) => setDomain(e.target.value as TrackerDomain)}>{trackerDomainOptions.filter((item) => item.value !== 'all').map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label><span className={labelCls}>Level</span><select className={inputCls} value={level} onChange={(e) => setLevel(e.target.value as TrackerLevel)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#e0d0c5] p-4 dark:border-white/9">
          <button onClick={onClose} className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-5 py-2.5 text-[13px] font-semibold text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">Cancel</button>
          <button onClick={handleCreate} disabled={createTrackerMutation.isPending} className="rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412]">{createTrackerMutation.isPending ? 'Creating...' : 'Create Tracker'}</button>
        </div>
      </aside>
    </>
  )
}
