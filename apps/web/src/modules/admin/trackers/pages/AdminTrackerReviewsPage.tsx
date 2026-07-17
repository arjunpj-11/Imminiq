import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminPageHeader } from "../../shared";
import AdminTrackerReviewsPanel from "../components/AdminTrackerReviewsPanel";
import { ADMIN_TRACKERS_ROUTES } from "../constants/admin-trackers.constants";

export default function AdminTrackerReviewsPage() {
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <Link
        to={ADMIN_TRACKERS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} /> Back to tracker management
      </Link>
      <AdminPageHeader
        title="Community Reviews"
        description="Resolve community tracker verification cases using recorded consensus signals."
      />
      <AdminTrackerReviewsPanel />
    </main>
  );
}
