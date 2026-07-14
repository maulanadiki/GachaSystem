import React from "react";
import Image from "next/image";
import { EditIcon, TrashIcon } from "./Icons";
import { getImageSrc } from "../static/core_function";

export interface GachaItem {
  id: string;
  event_id:string
  event_name:string
  item_name: string;
  description: string;
  rarity: "Legendaris" | "Langka" | "Biasa";
  drop_rate: number; // percentage, e.g. 0.50, 15.00
  image: string;
}

interface ItemTableProps {
  items: GachaItem[];
  onEdit: (item: GachaItem) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalCount: number;
}

export default function ItemTable({
  items,
  onEdit,
  onDelete,
  currentPage,
  onPageChange,
  itemsPerPage,
  totalCount,
}: ItemTableProps) {
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // Helpers for rarity styles
  const getrarityStyles = (rarity: GachaItem["rarity"]) => {
    switch (rarity) {
      case "Legendaris":
        return {
          bg: "bg-[#28220c] border-gold/30 text-gold",
          barColor: "bg-gold",
        };
      case "Langka":
        return {
          bg: "bg-[#211630] border-purple-500/20 text-purple-400",
          barColor: "bg-purple-500",
        };
      case "Biasa":
        return {
          bg: "bg-[#201e1c] border-neutral-500/10 text-neutral-400",
          barColor: "bg-neutral-400",
        };
    }
  };

  // Generate pagination page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Desktop Tabular View (Hidden on Mobile) */}
      <div className="hidden md:block overflow-hidden rounded-2xl bg-panel border border-border-custom shadow-lg shadow-black/30">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-custom/50 bg-[#15120f]/40">
              <th className="px-6 py-4 text-[10px] font-mono text-muted tracking-widest uppercase font-semibold">
                Item Name
              </th>
              <th className="px-6 py-4 text-[10px] font-mono text-muted tracking-widest uppercase font-semibold">
                rarity Rank
              </th>
              <th className="px-6 py-4 text-[10px] font-mono text-muted tracking-widest uppercase font-semibold">
                Base Drop (%)
              </th>
              <th className="px-6 py-4 text-[10px] font-mono text-muted tracking-widest uppercase font-semibold text-right">
                Registry Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom/30">
            {items.length > 0 ? (
              items.map((item) => {
                const styles = getrarityStyles(item.rarity);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#201c18]/40 transition-colors duration-150 group"
                  >
                    {/* Item Info */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border-custom bg-[#13110e] group-hover:border-gold/30 transition-all duration-300 shadow-md">
                          <Image
                            src={getImageSrc(item.image)}
                            alt={item.item_name}
                            fill
                            sizes="48px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized // Since they are generated images in public folder
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-gold transition-colors duration-150">
                            {item.item_name}
                          </span>
                          <span className="text-xs text-muted/80 mt-0.5 line-clamp-1 max-w-[280px]">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* rarity Rank */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${styles.bg}`}
                      >
                        {item.rarity}
                      </span>
                    </td>

                    {/* Drop Rate & Progress Line */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-semibold tracking-wide text-foreground min-w-[50px]">
                          {item.drop_rate.toFixed(2)}%
                        </span>
                        <div className="w-24 h-1.5 bg-[#13110e] rounded-full overflow-hidden border border-border-custom/20">
                          <div
                            className={`h-full rounded-full ${styles.barColor}`}
                            style={{ width: `${Math.min(item.drop_rate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Registry Actions */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Edit Action */}
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-lg bg-[#181512] text-muted hover:text-gold hover:bg-[#25201a] border border-border-custom/40 hover:border-gold/30 transition-all duration-200"
                          title="Edit item"
                        >
                          <EditIcon size={16} />
                        </button>
                        {/* Delete Action */}
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2 rounded-lg bg-[#181512] text-muted hover:text-red-400 hover:bg-red-950/20 border border-border-custom/40 hover:border-red-900/30 transition-all duration-200"
                          title="Delete item"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted">
                  No items found matching the current registry query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card-Based View (Visible on Mobile) */}
      <div className="md:hidden flex flex-col gap-4">
        {items.length > 0 ? (
          items.map((item) => {
            const styles = getrarityStyles(item.rarity);
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-panel border border-border-custom shadow-md space-y-4 hover:border-gold/30 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border-custom bg-[#13110e] shrink-0">
                    <Image
                      src={item.image}
                      alt={item.item_name}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">
                      {item.item_name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-b border-border-custom/40 py-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-muted uppercase tracking-wider">
                      rarity
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase border ${styles.bg}`}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-mono text-muted uppercase tracking-wider">
                      Base Drop
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground text-xs">
                        {item.drop_rate.toFixed(2)}%
                      </span>
                      <div className="w-16 h-1 bg-[#13110e] rounded-full overflow-hidden border border-border-custom/20">
                        <div
                          className={`h-full rounded-full ${styles.barColor}`}
                          style={{ width: `${Math.min(item.drop_rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    onClick={() => onEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#181512] text-muted hover:text-gold border border-border-custom/40 text-xs font-semibold"
                  >
                    <EditIcon size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#181512] text-muted hover:text-red-400 border border-border-custom/40 text-xs font-semibold"
                  >
                    <TrashIcon size={14} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-2xl bg-panel border border-border-custom text-center text-muted text-sm shadow-md">
            No items found matching the current registry query.
          </div>
        )}
      </div>

      {/* 3. Pagination Footer */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-border-custom/10">
          <span className="text-xs font-mono text-muted select-none text-center sm:text-left">
            Showing <span className="text-foreground">{startEntry}</span> to{" "}
            <span className="text-foreground">{endEntry}</span> of{" "}
            <span className="text-foreground">{totalCount}</span> entries
          </span>

          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-lg bg-panel border border-border-custom text-xs font-semibold text-muted hover:text-gold hover:border-gold/30 disabled:opacity-40 disabled:hover:text-muted disabled:hover:border-border-custom disabled:cursor-not-allowed select-none transition-all duration-200"
            >
              Previous
            </button>

            {/* Page numbers */}
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-bold border transition-all duration-200 select-none ${
                  currentPage === page
                    ? "bg-gold border-gold text-black shadow-md shadow-gold/20"
                    : "bg-panel border-border-custom text-muted hover:text-foreground hover:border-muted/40"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 rounded-lg bg-panel border border-border-custom text-xs font-semibold text-muted hover:text-gold hover:border-gold/30 disabled:opacity-40 disabled:hover:text-muted disabled:hover:border-border-custom disabled:cursor-not-allowed select-none transition-all duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
