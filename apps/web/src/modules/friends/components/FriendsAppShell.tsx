import { useState, type ReactNode } from "react";

import Sidebar from "../../../components/layout/Sidebar";
import TopBar from "../../../components/layout/TopBar";
import AppFooter from "../../../components/layout/Footer";
import BottomNav from "../../../components/layout/BottomNav";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { getInitials } from "../utils/friends-formatters";
import { cn } from "../utils/friends-ui";

interface FriendsAppShellProps {
  children: ReactNode;
}

const NoiseOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.022] dark:opacity-[0.04]"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
      backgroundSize: "180px",
    }}
  />
);

export default function FriendsAppShell({ children }: FriendsAppShellProps) {
  const authUser = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("imminiq_sb") === "closed",
  );

  const userName = authUser?.fullName || authUser?.username || "Imminiq User";
  const userAvatarUrl = authUser?.avatarUrl;
  const userLevel = authUser?.isPremium ? "Imminiq Pro" : "Free Scholar";

  const handleToggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("imminiq_sb", next ? "closed" : "open");
      return next;
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <NoiseOverlay />

      <div className="relative z-[1] flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={handleToggleSidebar}
        />

        <main
          className={cn(
            "flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300 ease-out",
            sidebarCollapsed ? "min-[901px]:ml-0" : "min-[901px]:ml-56",
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={0}
            userName={userName}
            userInitials={getInitials(userName)}
            {...(userAvatarUrl ? { userAvatarUrl } : {})}
            userLevel={userLevel}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {children}
            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
