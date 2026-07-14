import React from "react";
import { SearchIcon, BellIcon, MenuIcon } from "./Icons";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-8 border-b border-border-custom bg-[#15120f]/60 backdrop-blur-md sticky top-0 z-30">
      {/* Left side: Hamburger & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {/* Mobile Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-muted hover:text-gold hover:bg-[#1f1a15] lg:hidden focus:outline-none"
          aria-label="Open navigation menu"
        >
          <MenuIcon size={22} />
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted group-focus-within:text-gold transition-colors duration-200">
            <SearchIcon size={16} />
          </div>
          <input
            type="text"
            placeholder="Search Item Registry..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#181512] text-foreground border border-border-custom/50 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-muted/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-200 font-sans tracking-wide"
          />
        </div>
      </div>

      {/* Right side: Status and Profile Actions */}
      <div className="flex items-center gap-4 md:gap-6 ml-4">
        {/* System Status Pill - Hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1814] border border-border-custom/40 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono text-muted tracking-wider">
            System Status: <span className="text-emerald-400 font-semibold uppercase">Online</span>
          </span>
        </div>

        {/* Notifications Button */}
        <button
          className="relative p-2 rounded-lg text-muted hover:text-gold hover:bg-[#1c1814] border border-transparent hover:border-border-custom/40 transition-all duration-200"
          aria-label="View notifications"
        >
          <BellIcon size={20} />
          {/* Notification Badge */}
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-gold"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-border-custom/40" />

        {/* Admin User Profile Button */}
        <button
          className="flex items-center gap-2 text-muted hover:text-gold transition-colors focus:outline-none"
          aria-label="User settings"
        >
          <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </div>
        </button>
      </div>
    </header>
  );
}
