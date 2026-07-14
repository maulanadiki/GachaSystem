"use client";

import React, { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import { MenuType } from "./static/Types";
import Header from "./components/Header";
import Metrics from "./components/Metrics";
import Filters, { RarityType } from "./components/Filters";
import ItemTable, { GachaItem } from "./components/ItemTable";
import ItemModal from "./components/ItemModal";

// Initial items from mockup
const INITIAL_ITEMS: GachaItem[] = [
  {
    id: "item-1",
    name: "Solaris Zenith Edge",
    description: "Manage global item pool, manipulate rarity weights, and monitor drop rates.",
    tier: "Legendary",
    dropRate: 0.5,
    image: "/solaris_zenith_edge.png",
  },
  {
    id: "item-2",
    name: "Voidshard Dagger",
    description: "Infused with cosmic purple shards that phase through physical matter.",
    tier: "Rare",
    dropRate: 15.0,
    image: "/voidshard_dagger.png",
  },
  {
    id: "item-3",
    name: "Ironclad Guard",
    description: "Heavy alloy armor plated with titanium weave for impenetrable defense.",
    tier: "Common",
    dropRate: 84.5,
    image: "/ironclad_guard.png",
  },
  {
    id: "item-4",
    name: "Astral Wing-Set",
    description: "Feathered wings crystallized with nebulous solar dust.",
    tier: "Legendary",
    dropRate: 0.0,
    image: "/astral_wing_set.png",
  },
];

export default function Home() {
  // Navigation State
  const [activeMenu, setActiveMenu] = useState<MenuType>("Item Database");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events,setEvents] =useState<any[]>([])

  // Data / Filter States
  const [items, setItems] = useState<GachaItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<RarityType>("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Simulates pagination neatly

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GachaItem | null>(null);

  // 1. Calculate drop rates dynamically
  const totalDropRate = useMemo(() => {
    return items.reduce((sum, item) => sum + item.dropRate, 0);
  }, [items]);

  // 2. Filter items based on search and rarity selection
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity = selectedRarity === "All" || item.tier === selectedRarity;
      return matchesSearch && matchesRarity;
    });
  }, [items, searchQuery, selectedRarity]);

  // 3. Compute dynamic counts for Filter badges
  const rarityCounts = useMemo(() => {
    const counts = { All: items.length, Legendary: 0, Rare: 0, Common: 0 };
    items.forEach((item) => {
      if (item.tier in counts) {
        counts[item.tier as "Legendary" | "Rare" | "Common"] += 1;
      }
    });
    return counts;
  }, [items]);

  // 4. Paginate items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // 5. Dynamic CRUD Handlers
  const handleOpenSummonModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GachaItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this item from the registry?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      // Adjust page count if current page becomes empty
      const updatedFilteredLength = filteredItems.length - 1;
      const totalPages = Math.ceil(updatedFilteredLength / itemsPerPage) || 1;
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }
  };

  const handleModalSubmit = (itemData: Omit<GachaItem, "id" | "image">) => {
    if (editingItem) {
      // Edit mode
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...itemData } : item
        )
      );
    } else {
      // Add mode
      const newItem: GachaItem = {
        id: `item-${Date.now()}`,
        name: itemData.name,
        description: itemData.description,
        tier: itemData.tier,
        dropRate: itemData.dropRate,
        // Assign visual asset based on selected tier
        image:
          itemData.tier === "Legendary"
            ? "/solaris_zenith_edge.png"
            : itemData.tier === "Rare"
              ? "/voidshard_dagger.png"
              : "/ironclad_guard.png",
      };
      setItems((prev) => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  // Reset pagination page when filters change
  const handleRarityChange = (rarity: RarityType) => {
    setSelectedRarity(rarity);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };


  // Render view depending on dynamic sidebar menu selection
  const renderContentView = () => {
    switch (activeMenu) {
      case "Item Database":
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Description */}
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                Item Database
              </h2>
              <p className="text-sm md:text-base text-muted/90 max-w-2xl leading-relaxed">
                Manage global item pool, manipulate rarity weights, and monitor
                aetheric drop equilibrium across all dimensions.
              </p>
            </div>

            {/* Metrics cards container */}
            <Metrics
              totalItems={1244 + items.length} // Simulates base of 1244 + active registries
              totalDropRate={totalDropRate}
              onSummonClick={handleOpenSummonModal}
            />

            {/* Filters Row */}
            <Filters
              selectedRarity={selectedRarity}
              onRarityChange={handleRarityChange}
              counts={rarityCounts}
            />

            {/* Item Table Grid */}
            <div className="w-full">
              <ItemTable
                items={paginatedItems}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteItem}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalCount={filteredItems.length}
              />
            </div>
          </div>
        );

      case "Events":
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-foreground">Gacha Campaigns & Events</h2>
              <p className="text-sm text-muted">Manage scheduling, active drop rate boosts, and seasonal summoning banners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Card 1 */}
              <div className="p-6 rounded-2xl bg-panel border border-border-custom relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 px-3 py-1 bg-gold text-black text-[9px] font-mono font-bold uppercase rounded-bl-xl tracking-wider">
                  Active Boost (2x)
                </div>
                <h3 className="text-lg font-bold text-foreground mt-2">Summer Zenith Summoning</h3>
                <p className="text-xs text-muted mt-2">
                  Legendary items drop weights increased by 200%. Equilibrium is auto-scaled to balance common drops.
                </p>
                <div className="mt-6 flex justify-between items-center text-xs font-mono">
                  <span className="text-muted">Duration: July 01 - July 15</span>
                  <span className="text-emerald-400 font-bold uppercase">Online</span>
                </div>
              </div>

              {/* Event Card 2 */}
              <div className="p-6 rounded-2xl bg-panel border border-border-custom relative overflow-hidden opacity-60 hover:opacity-100 transition-opacity duration-300 shadow-lg">
                <div className="absolute top-0 right-0 px-3 py-1 bg-muted text-black text-[9px] font-mono font-bold uppercase rounded-bl-xl tracking-wider">
                  Upcoming
                </div>
                <h3 className="text-lg font-bold text-foreground mt-2">Void Nebula Descent</h3>
                <p className="text-xs text-muted mt-2">
                  Voidshard Dagger and shadow element relics drop rates buffed by 15%. Scheduled launch ready.
                </p>
                <div className="mt-6 flex justify-between items-center text-xs font-mono">
                  <span className="text-muted">Starts in: 12 days</span>
                  <span className="text-muted font-bold uppercase">Standby</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "Global History":
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-foreground">Global Summon Log</h2>
              <p className="text-sm text-muted">Live audit list of recently registered summoning outcomes and seed audits.</p>
            </div>

            <div className="rounded-2xl bg-panel border border-border-custom overflow-hidden shadow-lg">
              <div className="px-6 py-4 bg-[#15120f]/40 border-b border-border-custom/50 font-mono text-[10px] text-muted tracking-widest uppercase">
                Summon Registry Log
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border-custom/30 pb-3 font-mono text-xs">
                  <span className="text-muted">UID-94183 summoned <span className="text-gold font-semibold">Solaris Zenith Edge</span></span>
                  <span className="text-muted/60">3 minutes ago</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-custom/30 pb-3 font-mono text-xs">
                  <span className="text-muted">UID-04824 summoned <span className="text-purple-400 font-semibold">Voidshard Dagger</span></span>
                  <span className="text-muted/60">12 minutes ago</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-custom/30 pb-3 font-mono text-xs">
                  <span className="text-muted">UID-77491 summoned <span className="text-neutral-400 font-semibold">Ironclad Guard</span></span>
                  <span className="text-muted/60">19 minutes ago</span>
                </div>
                <div className="flex justify-between items-center pb-1 font-mono text-xs">
                  <span className="text-muted">UID-22941 summoned <span className="text-gold font-semibold">Solaris Zenith Edge</span></span>
                  <span className="text-muted/60">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "Settings":
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-foreground">Admin System Settings</h2>
              <p className="text-sm text-muted">Configure server drop algorithms, API linkages, and emergency system protocols.</p>
            </div>

            <div className="p-6 rounded-2xl bg-panel border border-border-custom shadow-lg max-w-xl space-y-6">
              {/* Option 1 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">Enforce Safe Equilibrium</span>
                  <span className="text-xs text-muted">Blocks summoning items if total rate exceeds 100%.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#13110e] rounded-full peer peer-focus:ring-1 peer-focus:ring-gold/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
                </label>
              </div>

              {/* Option 2 */}
              <div className="flex items-center justify-between border-t border-border-custom/30 pt-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">Live WebSocket Auditing</span>
                  <span className="text-xs text-muted">Stream summon log entries to connected telemetry units.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#13110e] rounded-full peer peer-focus:ring-1 peer-focus:ring-gold/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
                </label>
              </div>

              {/* Option 3 */}
              <div className="flex flex-col gap-2 border-t border-border-custom/30 pt-6">
                <span className="text-sm font-semibold text-foreground">Master API Secret</span>
                <span className="text-xs text-muted mb-1">Key used for secure drops validation. Keep secret.</span>
                <input
                  type="password"
                  value="••••••••••••••••••••••••••••"
                  disabled
                  className="w-full bg-[#13110e] text-muted border border-border-custom/50 rounded-lg px-4 py-2 text-sm focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-x-hidden">
      {/* 1. Sidebar Panel */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Dynamic Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8 pb-16">
          {renderContentView()}
        </main>
      </div>

      {/* 3. CRUD Item Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingItem={editingItem}
        currentTotalDropRate={totalDropRate}
      />
    </div>
  );
}

