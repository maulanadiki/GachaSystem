"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

export interface RollResult {
  item_id: string;
  item_name: string;
  rarity: "Legendaris" | "Langka" | "Biasa";
  drop_rate: number;
}

export interface HistoryEntry {
  username: string;
  event_name: string;
  gacha_date: string;
  result_gacha: RollResult[];
}

interface HistoryTableProps {
  data: HistoryEntry[];
  loading?: boolean;
  /** Show the search input above the table. Default: true */
  showSearch?: boolean;
  /** Show the "rows per page" selector. Default: true */
  showPageSizeSelector?: boolean;
  /** Available page size options. Default: [5, 10, 20, 50] */
  pageSizeOptions?: number[];
  /** Initial/default page size. Default: 10 */
  defaultPageSize?: number;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Message shown when there's no data at all */
  emptyMessage?: string;
  /** Message shown when a search yields no results */
  noResultsMessage?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const getRarityStyles = (rarity: RollResult["rarity"]) => {
  switch (rarity) {
    case "Legendaris":
      return "bg-[#28220c] border-gold/30 text-gold";
    case "Langka":
      return "bg-[#211630] border-purple-500/20 text-purple-400";
    case "Biasa":
    default:
      return "bg-[#201e1c] border-neutral-500/10 text-neutral-400";
  }
};

export default function HistoryTable({
  data,
  loading = false,
  showSearch = true,
  showPageSizeSelector = true,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  defaultPageSize = 10,
  searchPlaceholder = "Search by username or event...",
  emptyMessage = "No summon history found.",
  noResultsMessage = "No history matches your search.",
}: HistoryTableProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (entry) =>
        entry.username.toLowerCase().includes(q) ||
        entry.event_name.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  // Reset to page 1 whenever the filtered set or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  // Clamp currentPage if data shrinks below the current page count
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const rangeStart = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredData.length);

  const toggleRow = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    setExpandedIndex(null); // collapse open row on page change
  };

  // Build a compact page-number list with ellipses for large page counts
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage - delta > 2) pages.push("ellipsis");

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage + delta < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4">
      {(showSearch || showPageSizeSelector) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {showSearch && (
            <div className="relative max-w-sm w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setExpandedIndex(null);
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans"
              />
            </div>
          )}

          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted uppercase tracking-wider whitespace-nowrap">
                Rows per page
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-panel border border-border-custom shadow-lg overflow-hidden">
        {/* Desktop header row */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-border-custom/50 bg-[#15120f]/40">
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase font-semibold">
            Username
          </span>
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase font-semibold">
            Event
          </span>
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase font-semibold">
            Date
          </span>
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase font-semibold text-right pr-2">
            Results Gacha
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-muted text-sm">
            Loading history...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted text-sm">
            {searchQuery ? noResultsMessage : emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-border-custom/30">
            {paginatedData.map((entry, index) => {
              const isOpen = expandedIndex === index;
              return (
                <div key={index}>
                  <button
                    type="button"
                    onClick={() => toggleRow(index)}
                    className="w-full text-left grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 md:gap-4 px-6 py-4 hover:bg-[#201c18]/40 transition-colors duration-150"
                  >
                    <div className="flex flex-col md:block">
                      <span className="md:hidden text-[9px] font-mono text-muted uppercase tracking-wider">
                        Username
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {entry.username}
                      </span>
                    </div>
                    <div className="flex flex-col md:block">
                      <span className="md:hidden text-[9px] font-mono text-muted uppercase tracking-wider">
                        Event
                      </span>
                      <span className="text-sm text-muted">{entry.event_name}</span>
                    </div>
                    <div className="flex flex-col md:block">
                      <span className="md:hidden text-[9px] font-mono text-muted uppercase tracking-wider">
                        Date
                      </span>
                      <span className="text-xs font-mono text-muted">
                        {entry.gacha_date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2 pt-1 md:pt-0">
                      <span className="text-[10px] font-mono text-muted uppercase tracking-wider bg-[#13110e] px-2.5 py-1 rounded border border-border-custom/30">
                        {entry.result_gacha.length} item
                        {entry.result_gacha.length !== 1 ? "s" : ""}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-muted transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 bg-[#13110e]/40">
                      <div className="rounded-xl border border-border-custom/40 divide-y divide-border-custom/20 overflow-hidden">
                        {entry.result_gacha.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-4 py-2.5 text-sm"
                          >
                            <span className="text-foreground font-medium">
                              {item.item_name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border ${getRarityStyles(
                                  item.rarity,
                                )}`}
                              >
                                {item.rarity}
                              </span>
                              <span className="font-mono text-xs text-muted min-w-[48px] text-right">
                                {item.drop_rate.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination footer */}
        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-border-custom/50 bg-[#15120f]/40">
            <span className="text-xs font-mono text-muted">
              Showing {rangeStart}–{rangeEnd} of {filteredData.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border-custom/50 text-muted hover:text-foreground hover:border-gold/40 disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-border-custom/50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {pageNumbers.map((p, i) =>
                p === "ellipsis" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-xs font-mono text-muted select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      p === currentPage
                        ? "bg-gold/10 border border-gold/40 text-gold font-bold"
                        : "border border-transparent text-muted hover:text-foreground hover:border-border-custom/50"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border-custom/50 text-muted hover:text-foreground hover:border-gold/40 disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-border-custom/50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}