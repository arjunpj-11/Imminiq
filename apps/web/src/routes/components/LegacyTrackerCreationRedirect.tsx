import { Navigate, useParams } from 'react-router';

export default function LegacyTrackerCreationRedirect({ to }: { to: (jobId: string) => string }) {
  const { jobId = '' } = useParams();
  return <Navigate replace to={to(jobId)} />;
}
