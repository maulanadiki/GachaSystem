"use client";

import CardEvents from "@/app/components/CardEvent";
import { useAuth } from "@/app/context/AuthContext";
import { baseUrl, fileToBase64, sendRequest, socketUrl } from "@/app/static/core_function";
import { eventProps } from "@/app/static/Types";
import React, { useState, DragEvent, ChangeEvent, useEffect } from "react";

interface EventForm {
  event_name: string;
  description: string;
  start_date: string;
  end_date: string;
  images: string;
}

interface ImagePreview {
  file: File;
  previewUrl: string;
}

interface FormErrors {
  event_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  images?: string;
}

const emptyForm: EventForm = {
  event_name: "",
  description: "",
  start_date: "",
  end_date: "",
  images: "",
};

// Converts a display date like "01 Jul 2026" into the "YYYY-MM-DD" format
// expected by <input type="date" />.
const toDateInputValue = (dateStr: string): string => {
  if (!dateStr) return "";
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

export default function EventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listEvent, setListEvent] = useState<eventProps[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  // Newly selected files (not yet uploaded)
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  // Images that already exist on the server for the event being edited
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tracks whether we're adding a new event or editing an existing one
  const [editingId, setEditingId] = useState<string | null>(null);
  const isEditMode = editingId !== null;

  const { token } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // Helper function to process file drops or selections
  const handleFiles = (files: FileList) => {
    const validImages = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const newPreviews = validImages.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  // File Input Change handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Drag & Drop event handlers
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

  // Remove individual newly-selected preview image item
  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) => {
      const target = prev[indexToRemove];
      if (target) URL.revokeObjectURL(target.previewUrl); // Cleanup memory
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Remove an already-uploaded (existing) image while editing
  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Explicitly close modal and clean up all resources
  const closeModal = () => {
    selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setSelectedImages([]);
    setExistingImages([]);
    setIsModalOpen(false);
    setEditingId(null);
    setErrors({});
    setForm(emptyForm);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImages([]);
    setExistingImages([]);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({
      event_name: item.event_name ?? "",
      description: item.description ?? "",
      start_date: toDateInputValue(item.start),
      end_date: toDateInputValue(item.end),
      images: "",
    });
    setSelectedImages([]);
    setExistingImages(Array.isArray(item.images) ? item.images : []);
    setErrors({});
    setIsModalOpen(true);
  };

  // Validates every required field. Returns true if the form is valid.
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.event_name.trim()) {
      newErrors.event_name = "Event name is required.";
    }
    if (!form.description.trim()) {
      newErrors.description = "Description is required.";
    }
    if (!form.start_date) {
      newErrors.start_date = "Start date is required.";
    }
    if (!form.end_date) {
      newErrors.end_date = "End date is required.";
    }
    if (
      form.start_date &&
      form.end_date &&
      new Date(form.end_date) < new Date(form.start_date)
    ) {
      newErrors.end_date = "End date cannot be before start date.";
    }
    if (selectedImages.length === 0 && existingImages.length === 0) {
      newErrors.images = "At least one image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const imageBase64: string[] = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const base64Img = await fileToBase64(selectedImages[i].previewUrl);
        imageBase64.push(base64Img);
      }

      // Strip the "http://.../src/assets/events/" prefix so only the
      // bare filename is sent — keeps stored images consistent with
      // newly uploaded ones (which are saved as bare filenames too).
      const existingFileNames = existingImages.map((url) => url.split("/").pop());

      const payload: any = {
        ...form,
        images: JSON.stringify(imageBase64),
        existing_images: JSON.stringify(existingFileNames),
      };

      if (isEditMode) {
        payload.id = editingId;
        const result = await sendRequest(
          `${socketUrl}/Events/${payload.id}`,
          "PATCH",
          payload,
          "events",
          { token: true },
          token ?? undefined
        );
        const res = result as any;
        if (res.result) {
          fetchData();
        }
      } else {
        const result = await sendRequest(
          `${socketUrl}/Events`,
          "POST",
          payload,
          "events",
          { token: true },
          token ?? undefined
        );
        const res = result as any;
        if (res.result) {
          fetchData();
        }
      }

      closeModal();
    } catch (err) {
      console.error("Failed to save event:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchData = async () => {
    try {
      const req = await sendRequest(
        `${baseUrl}/Events`,
        "GET",
        undefined,
        "events",
        { token: true },
        token ?? undefined
      );
      const res = req as any;
      setListEvent(
        res.data.map((event: any) => ({
          id: event.id,
          event_name: event.event_name,
          description: event.description,
          start: event.start,
          end: event.end,
          active: event.active,
          drop_rate: event.drop_rate,
          legendaris: event.legendaris,
          langka: event.langka,
          biasa: event.biasa,
          images: event.images.map(
            (img: string) => `${socketUrl}/src/assets/events/${img}`
          ),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatus = async (id: string, newStatus: boolean) => {
    await sendRequest(
      `${baseUrl}/Events`,
      "PATCH",
      { id: parseInt(id), active: newStatus },
      "events",
      { token: true },
      token ?? undefined
    );

    setListEvent((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: newStatus } : item))
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-foreground">
            Gacha Campaigns & Events
          </h2>
          <p className="text-sm text-muted">
            Manage scheduling, active drop rate boosts, and seasonal summoning
            banners.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="shrink-0 px-4 py-2 rounded-xl bg-gold text-black text-sm font-bold hover:opacity-90 transition-opacity duration-200 cursor-pointer"
        >
          + Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {listEvent.map((item: any) => (
          <CardEvents
            key={item.id}
            id={item.id}
            title={item.event_name}
            description={item.description}
            start={item.start}
            end={item.end}
            status={item.active}
            dropRate={parseFloat(item.drop_rate)}
            legendaris={item.legendaris}
            langka={item.langka}
            biasa={item.biasa}
            images={item.images}
            onToggleStatus={handleStatus}
            onEdit={() => openEditModal(item)}
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-panel border border-border-custom shadow-2xl p-6 space-y-5 my-8 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">
                {isEditMode ? "Edit Event" : "Add Event"}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted hover:text-foreground text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="event_name"
                  value={form.event_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold ${
                    errors.event_name ? "border-red-500" : "border-border-custom"
                  }`}
                  placeholder="Summer Zenith Summoning"
                />
                {errors.event_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.event_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold resize-none ${
                    errors.description ? "border-red-500" : "border-border-custom"
                  }`}
                  placeholder="Legendary drop rate details..."
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold ${
                      errors.start_date ? "border-red-500" : "border-border-custom"
                    }`}
                  />
                  {errors.start_date && (
                    <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold ${
                      errors.end_date ? "border-red-500" : "border-border-custom"
                    }`}
                  />
                  {errors.end_date && (
                    <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {/* --- MULTIPLE IMAGE DRAG AND DROP ZONE --- */}
              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Campaign Images / Banners <span className="text-red-500">*</span>
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative cursor-pointer ${
                    isDragging
                      ? "border-gold bg-gold/5"
                      : errors.images
                      ? "border-red-500 bg-background/50"
                      : "border-border-custom bg-background/50 hover:border-neutral-500"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-1 pointer-events-none">
                    <p className="text-sm font-semibold text-foreground">
                      Drag and drop images here, or click to browse
                    </p>
                    <p className="text-xs text-muted">PNG, JPG, or WEBP formats</p>
                  </div>
                </div>
                {errors.images && (
                  <p className="text-xs text-red-500 mt-1">{errors.images}</p>
                )}

                {/* --- EXISTING IMAGES (edit mode) --- */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3 max-h-40 overflow-y-auto p-1 border border-neutral-900 bg-background/30 rounded-lg">
                    {existingImages.map((url, idx) => (
                      <div
                        key={`existing-${idx}`}
                        className="relative aspect-video rounded-md overflow-hidden bg-neutral-900 border border-border-custom group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Existing image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white font-bold flex items-center justify-center text-[10px] transition-colors shadow z-20"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* --- LIVE IMAGE PREVIEWS (newly selected) --- */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3 max-h-40 overflow-y-auto p-1 border border-neutral-900 bg-background/30 rounded-lg">
                    {selectedImages.map((img, idx) => (
                      <div
                        key={`new-${idx}`}
                        className="relative aspect-video rounded-md overflow-hidden bg-neutral-900 border border-border-custom group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={`Upload preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white font-bold flex items-center justify-center text-[10px] transition-colors shadow z-20"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gold text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : isEditMode
                    ? "Update Event"
                    : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}