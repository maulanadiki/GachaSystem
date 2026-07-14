"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { MenuType } from "../../static/Types";
import { sendRequest, baseUrl } from "../../static/core_function";
import ItemsPage from "./Items";
import EventsPage from "./Events";
import HistoryPage from "./History";
import SettingPage from "./Setting";
import { useAuth } from "@/app/context/AuthContext";

const ADMIN_REFRESH_KEY = "admin_refreshed";

export default function AdminLayout() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<MenuType>("Item Database");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
   const { token, user, updateCoins } = useAuth();

  // Guard against double-invocation in React Strict Mode (dev only)
  const hasCheckedRefresh = useRef(false);

  // One-time refresh per login session — forces the browser to re-read
  // fresh cookies/tokens instead of relying on stale cached client state.
  useEffect(() => {
    if (hasCheckedRefresh.current) return;
    hasCheckedRefresh.current = true;

    const alreadyRefreshed = sessionStorage.getItem(ADMIN_REFRESH_KEY);
    if (!alreadyRefreshed) {
      sessionStorage.setItem(ADMIN_REFRESH_KEY, "true");
      window.location.reload();
    }
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await sendRequest(`${baseUrl}/authentication/logout`, "POST", undefined, "logout", { token: true }, token ?? undefined);
    } catch (err) {
      console.error("Logout request failed:", err);
      // continue anyway — redirect regardless so the user isn't stuck
    } finally {
      // Clear the refresh flag so the NEXT login session forces
      // a fresh reload again (instead of staying stuck at "already refreshed").
      sessionStorage.removeItem(ADMIN_REFRESH_KEY);
      router.push("/Pages/Login");
      router.refresh();
    }
  };

  const renderContentView = () => {
    switch (activeMenu) {
      case "Item Database":
        return <ItemsPage searchQuery={searchQuery} />;
      case "Events":
        return <EventsPage />;
      case "Global History":
        return <HistoryPage />;
      case "Settings":
        return <SettingPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-x-hidden">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleSidebar={() => setIsSidebarOpen(true)}
            />
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mr-6 px-4 py-2 rounded-xl bg-panel border border-border-custom text-sm font-semibold text-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8 pb-16">
          {renderContentView()}
        </main>
      </div>
    </div>
  );
}