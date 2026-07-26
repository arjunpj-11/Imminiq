import { AdminPageHeader } from '../../../../components/admin';
import AdminTrackerReviewsPanel from '../components/AdminTrackerReviewsPanel';

export default function AdminTrackerReviewsPage() {
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Verification Queue"
        description="Resolve community tracker verification cases using recorded consensus signals."
      />
      <AdminTrackerReviewsPanel />
    </main>
  );
}
