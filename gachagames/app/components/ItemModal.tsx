import React, { useState, useEffect, DragEvent, ChangeEvent } from "react";
import { GachaItem } from "./ItemTable";
import { CloseIcon } from "./Icons";
import { socketUrl } from "../static/core_function";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    itemData: Omit<GachaItem, "id" | "image">,
    imageFile: File | null,
  ) => void;
  editingItem: GachaItem | null;
  currentTotalDropRate: number;
  ListEvents:{
    id:string,
    label:string
  }[]
}
interface ImagePreview {
  file: File;
  previewUrl: string;
}
type SelectedImage = ImagePreview | string | null;
export default function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  currentTotalDropRate,
  ListEvents
}: ItemModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState<GachaItem["rarity"]>("Biasa");
  const [events, setEvents] = useState<string>('');
  const [dropRate, setDropRate] = useState(0.0);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage>(null);
  const handleFiles = (files: FileList) => {
    const validImages = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    const firstImage = validImages[0];
    if (!firstImage) return;

    setSelectedImage((prev) => {
      if (prev && typeof prev !== "string") {
        URL.revokeObjectURL(prev.previewUrl); // only revoke blob URLs we created
      }
      return {
        file: firstImage,
        previewUrl: URL.createObjectURL(firstImage),
      };
    });
  };
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    // Reset the input value so selecting the same file(s) again still fires onChange
    e.target.value = "";
  };
  const removeImage = () => {
    setSelectedImage((prev) => {
      if (prev && typeof prev !== "string") {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return null;
    });
  };

  // Populate data when editing
    useEffect(() => {
      if (editingItem) {
        setName(editingItem.item_name);
        setDescription(editingItem.description);
        setTier(editingItem.rarity);
        setDropRate(editingItem.drop_rate);
        setEvents(editingItem.event_id); // just assign directly, no .map needed
        setSelectedImage(editingItem.image || null);
      } else {
        setName("");
        setDescription("");
        setTier("Biasa");
        setDropRate(0.0);
        setEvents(ListEvents[0]?.id ?? ""); // default to first event
        setSelectedImage(null)
      }
      setError("");
    }, [editingItem, isOpen]);

  if (!isOpen) return null;

  // Projection logic
  const originalRate = editingItem ? editingItem.drop_rate : 0;
  const projectedTotal = currentTotalDropRate - originalRate + dropRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Item Name is required.");
      return;
    }

    if (dropRate < 0 || dropRate > 100) {
      setError("Base Drop Rate must be between 0% and 100%.");
      return;
    }

    if (!events) {
      setError("Select an event.");
      return;
    }
  const selectedEvent = ListEvents.find((e) => e.id === events);
    if (!selectedEvent) {
      setError("Selected event is no longer valid.");
      return;
    }
    onSubmit(
      {
        item_name: name.trim(),
        description: description.trim() || `${tier} grade item registry.`,
        rarity: tier,
        drop_rate: parseFloat(dropRate.toFixed(2)),
        event_id: events, // plain string now
        event_name: selectedEvent.label,
      },
      selectedImage && typeof selectedImage !== "string" ? selectedImage.file : null,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content container */}
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-2xl bg-panel border border-border-custom shadow-2xl shadow-black/80 z-10 overflow-hidden flex flex-col">
        {/* Background ambient lighting */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-border-custom/40 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-gold font-mono select-none">▶</span>
            {editingItem ? "Modify Item Registry" : "New Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-gold transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 mt-6 px-6 md:px-8 pb-6 md:pb-8 overflow-y-auto"
        >
          {/* Error Message */}
          {error && (
            <div className="p-3 text-xs bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Item Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
              Aether Item Name
            </label>
            <input
              type="text"
              placeholder="e.g. Solaris Zenith Edge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
              Description
            </label>
            <textarea
              placeholder="e.g. Legendaris weapon containing raw solar currents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tier Rank */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
                Tier Rank
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as GachaItem["rarity"])}
                className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans select-none cursor-pointer"
              >
                <option value="Biasa">BIASA</option>
                <option value="Langka">LANGKA</option>
                <option value="Legendaris">LEGENDARIS</option>
              </select>
            </div>

            {/* Base Drop Rate */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
                Base Drop (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={dropRate || ""}
                onChange={(e) => setDropRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-mono"
                required
              />
            </div>
          </div>
          
          {/* List Event */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
              List Event
            </label>
            <select
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans select-none cursor-pointer"
            >
              {ListEvents.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Image */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-mono text-muted">
              Images
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors relative cursor-pointer ${
                isDragging
                  ? "border-gold bg-gold/5"
                  : "border-border-custom bg-background/50 hover:border-neutral-500"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-1 pointer-events-none">
                <p className="text-sm font-semibold text-foreground">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-xs text-muted">PNG, JPG, or WEBP format</p>
              </div>
            </div>

            {/* --- LIVE IMAGE PREVIEW --- */}
            {/* Rendered as a separate block, NOT stacked on top of the input above,
                so clicking the thumbnail/✕ always hits a real element with a handler
                instead of being swallowed by hit-testing against the invisible input. */}
            {selectedImage && (
              <div className="mt-3 flex justify-center p-2 border border-neutral-900 bg-background/30 rounded-lg">
                <div className="relative aspect-square w-40 rounded-md overflow-hidden bg-neutral-900 border border-border-custom group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={typeof selectedImage === "string" ? selectedImage : selectedImage.previewUrl}
                    alt="Upload preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage()}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white font-bold flex items-center justify-center text-xs transition-colors shadow z-20"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Equilibrium Projection Card */}
          <div className="p-4 rounded-xl bg-[#13110e] border border-border-custom/40 space-y-2">
            <span className="text-[9px] font-mono text-muted uppercase tracking-widest block">
              Equilibrium Equilibrium Projection
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span>Current:</span>
                <span className="font-mono text-foreground">
                  {currentTotalDropRate.toFixed(2)}%
                </span>
              </div>
              <span className="text-muted font-sans text-xs">➡</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted">Projected:</span>
                <span
                  className={`font-mono font-bold ${
                    Math.abs(projectedTotal - 100) < 0.001
                      ? "text-emerald-400"
                      : "text-amber-500"
                  }`}
                >
                  {projectedTotal.toFixed(2)}%
                </span>
              </div>
            </div>
            {Math.abs(projectedTotal - 100) > 0.001 && (
              <span className="text-[10px] text-amber-500/80 font-sans block pt-1">
                ⚠️ Equilibrium deviates from 100.00%. Unbalanced drops
                projected.
              </span>
            )}
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-custom/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-panel border border-border-custom hover:border-muted/40 text-xs font-semibold text-muted hover:text-foreground transition-all duration-150 select-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-black text-xs font-bold tracking-wide uppercase transition-all duration-150 shadow-md hover:shadow-gold/10 select-none"
            >
              {editingItem ? "Update Registry" : "Save Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}