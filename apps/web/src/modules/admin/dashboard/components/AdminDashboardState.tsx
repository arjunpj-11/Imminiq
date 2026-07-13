interface IAdminDashboardStateProps {
  tone: 'loading' | 'error'
}

export default function AdminDashboardState({ tone }: IAdminDashboardStateProps) {
  return (
    <div className={`p-10 text-sm ${tone === 'error' ? 'text-[#e26767]' : 'text-[#aaa59d]'}`}>
      {tone === 'error'
        ? 'The admin overview could not be loaded.'
        : 'Loading admin overview…'}
    </div>
  )
}
