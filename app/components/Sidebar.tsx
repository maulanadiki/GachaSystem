import React from "react";
import { EventIcon, DatabaseIcon, HistoryIcon, SettingsIcon, CloseIcon } from "./Icons";
import { ListMenu } from "../static/ListMenu";
import { MenuType } from "../static/Types";
import { useAuth } from "../context/AuthContext";



interface SidebarProps {
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu, isOpen, setIsOpen, }: SidebarProps) {
  const { token, user, updateCoins } = useAuth();
  const handleMenuClick = (menu: MenuType) => {
    setActiveMenu(menu);
    setIsOpen(false); // Close drawer on mobile after selection
  };
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-8 py-8 border-b border-sidebar-border/30">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground select-none leading-none">
              Gacha
            </h1>
            <h2 className="text-3xl font-extrabold tracking-tight text-gold select-none leading-none mt-1">
              Admin
            </h2>
            <span className="text-[10px] font-mono tracking-[0.25em] text-muted uppercase mt-2">
              System Control
            </span>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-muted hover:text-gold focus:outline-none lg:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Dynamic Navigation Items */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {ListMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;

            return (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item.name)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-lg font-medium transition-all group duration-200 relative ${isActive
                  ? "bg-[#25201a] text-gold font-semibold"
                  : "text-muted hover:text-foreground hover:bg-[#1a1714]"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <Icon
                    className={`transition-colors duration-200 ${isActive ? "text-gold" : "text-muted group-hover:text-gold"
                      }`}
                    size={22}
                  />
                  <span className="text-base tracking-wide">{item.name}</span>
                </div>

                {/* Right highlight bar */}
                {isActive && (
                  <div className="absolute right-0 top-1/4 bottom-1/4 w-[3px] bg-gold rounded-l-md" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="p-6 border-t border-sidebar-border/30">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-sidebar-border bg-[#181512] shadow-inner">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 text-gold font-mono text-sm font-bold">
              {user?.user}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#181512]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground tracking-wide">
                {user?.user}
              </span>
              <span className="text-[9px] font-mono text-muted tracking-widest uppercase">
                ADMINISTRATOR
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
