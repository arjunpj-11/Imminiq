import { getUserFacingError } from "../../../../lib/user-facing-error";

interface IAdminDashboardStateProps {
  tone: "loading" | "error";
  error?: unknown;
}

export default function AdminDashboardState({
  tone,
  error,
}: IAdminDashboardStateProps) {
  return (
    <div
      className={`p-10 text-sm ${tone === "error" ? "text-[#e26767]" : "text-[#aaa59d]"}`}
    >
      {tone === "error"
        ? getUserFacingError(error, "The admin overview could not be loaded.")
        : "Loading admin overview…"}
    </div>
  );
}
