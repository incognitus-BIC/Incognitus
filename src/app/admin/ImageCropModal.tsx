"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (publicUrl: string) => void;
  aspectRatio?: number; // e.g. 1 for square (avatar), 16/9 for event banner
  circularCrop?: boolean;
  bucketName?: string;
  folder?: string;
  title?: string;
  targetWidth?: number;
  targetHeight?: number;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  circularCrop = false,
  bucketName = "media",
  folder = "uploads",
  title = "Crop & Resize Picture",
  targetWidth = 600,
  targetHeight = 600,
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Crop transformations
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [isHoveredOrDragging, setIsHoveredOrDragging] = useState(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Viewport dimensions
  const viewWidth = 360;
  const viewHeight = Math.round(viewWidth / aspectRatio);

  const [isDragOver, setIsDragOver] = useState(false);

  // Helper to load file
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setImageElement(img);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setErrorMessage(null);
      };
      img.onerror = () => {
        setErrorMessage("Could not load selected image file.");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Handle local file picking
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Redraw preview canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageElement) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, viewWidth, viewHeight);

    // 1. Calculate base scale so image fills the viewport
    const scaleToCover = Math.max(
      viewWidth / imageElement.naturalWidth,
      viewHeight / imageElement.naturalHeight
    );
    const drawW = imageElement.naturalWidth * scaleToCover;
    const drawH = imageElement.naturalHeight * scaleToCover;

    // 2. Draw transformed image
    ctx.save();
    ctx.translate(viewWidth / 2 + pan.x, viewHeight / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 3. Draw guides / mask
    if (circularCrop) {
      ctx.save();
      // Outer dimming mask
      ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
      ctx.beginPath();
      ctx.rect(0, 0, viewWidth, viewHeight);
      const radius = Math.min(viewWidth, viewHeight) / 2 - 12;
      ctx.arc(viewWidth / 2, viewHeight / 2, radius, 0, Math.PI * 2, true);
      ctx.fill();

      // Guide circle ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(viewWidth / 2, viewHeight / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      // Rectangular grid guide (rule of thirds)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(viewWidth / 3, 0);
      ctx.lineTo(viewWidth / 3, viewHeight);
      ctx.moveTo((viewWidth * 2) / 3, 0);
      ctx.lineTo((viewWidth * 2) / 3, viewHeight);
      ctx.moveTo(0, viewHeight / 3);
      ctx.lineTo(viewWidth, viewHeight / 3);
      ctx.moveTo(0, (viewHeight * 2) / 3);
      ctx.lineTo(viewWidth, (viewHeight * 2) / 3);
      ctx.stroke();

      // Outer frame border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, viewWidth, viewHeight);
      ctx.restore();
    }
  }, [imageElement, zoom, pan, rotation, viewWidth, viewHeight, circularCrop]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer dragging handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    setIsHoveredOrDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    setIsHoveredOrDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture release fails
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((prev) => {
      const next = prev - e.deltaY * 0.0015;
      return Math.min(Math.max(next, 0.6), 4);
    });
  };

  // Reset transforms
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Perform crop & upload to Supabase bucket
  const handleCropAndUpload = async () => {
    if (!imageElement || !supabase) {
      setErrorMessage("Supabase is not configured or no image is selected.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Offscreen render at target resolution
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;
      const expCtx = exportCanvas.getContext("2d");
      if (!expCtx) throw new Error("Could not create canvas 2D context");

      const ratio = targetWidth / viewWidth;
      const scaleToCover = Math.max(
        viewWidth / imageElement.naturalWidth,
        viewHeight / imageElement.naturalHeight
      );
      const drawW = imageElement.naturalWidth * scaleToCover * ratio;
      const drawH = imageElement.naturalHeight * scaleToCover * ratio;

      expCtx.translate(targetWidth / 2 + pan.x * ratio, targetHeight / 2 + pan.y * ratio);
      expCtx.rotate((rotation * Math.PI) / 180);
      expCtx.scale(zoom, zoom);
      expCtx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH);

      // 2. Convert to Blob
      const blob: Blob = await new Promise((resolve, reject) => {
        exportCanvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Image processing failed"));
          },
          "image/webp",
          0.92
        );
      });

      // 3. Upload to Supabase Storage
      const cleanFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;

      // Try uploading to target bucket
      let uploadBucket = bucketName;
      let uploadResult = await supabase.storage.from(uploadBucket).upload(cleanFileName, blob, {
        contentType: "image/webp",
        upsert: true,
      });

      // Fallback bucket check if specified bucket doesn't exist
      if (uploadResult.error) {
        const fallbackBuckets = ["media", "event-images", "team-avatars"].filter(
          (b) => b !== uploadBucket
        );
        for (const fb of fallbackBuckets) {
          const retry = await supabase.storage.from(fb).upload(cleanFileName, blob, {
            contentType: "image/webp",
            upsert: true,
          });
          if (!retry.error) {
            uploadBucket = fb;
            uploadResult = retry;
            break;
          }
        }
      }

      if (uploadResult.error) {
        throw new Error(
          `Storage upload error: ${uploadResult.error.message}. Please create the 'media' bucket in Supabase > Storage.`
        );
      }

      // 4. Retrieve Public URL
      const { data: urlData } = supabase.storage.from(uploadBucket).getPublicUrl(cleanFileName);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to generate public URL for uploaded photo.");
      }

      onCropComplete(urlData.publicUrl);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-purple-100 rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(75,63,135,0.25)] space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[var(--color-primary)] uppercase tracking-wider">
                {circularCrop ? "1:1 Avatar Frame" : "16:9 Banner Frame"}
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-[11px] font-mono text-slate-500">
                {targetWidth}&times;{targetHeight}px output
              </span>
            </div>
            <h3 className="text-lg font-bold font-[var(--font-heading)] text-slate-900">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag image to position the subject &bull; Use slider or scroll to zoom.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* File Chooser / Image Canvas */}
        {!imageSrc ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragOver
                ? "border-[var(--color-primary)] bg-purple-100/70 scale-[1.01] shadow-md shadow-purple-900/10"
                : "border-purple-200/90 hover:border-[var(--color-primary)] bg-gradient-to-b from-purple-50/40 to-slate-50 hover:from-purple-50/80 hover:shadow-xs"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-purple-200/80 text-[var(--color-primary)] flex items-center justify-center mb-3 group-hover:scale-110 shadow-sm transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">
              Click to select or drag &amp; drop an image here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PNG, JPG, JPEG, and WebP (High resolution recommended)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Crop Canvas Viewport */}
            <div className="relative flex justify-center bg-slate-950 rounded-2xl p-3 overflow-hidden shadow-inner border border-slate-800">
              {/* Corner brackets aesthetic */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-purple-400 rounded-tl pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-purple-400 rounded-tr pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-purple-400 rounded-bl pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-purple-400 rounded-br pointer-events-none" />

              <canvas
                ref={canvasRef}
                width={viewWidth}
                height={viewHeight}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                className={`rounded-xl touch-none select-none max-w-full ${
                  isHoveredOrDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{ width: `${viewWidth}px`, height: `${viewHeight}px` }}
              />

              {/* Floating Helper Pill */}
              <div className="absolute top-4 left-4 pointer-events-none bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-white/90 border border-white/10 flex items-center gap-1.5 shadow-sm">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3" />
                </svg>
                <span>DRAG TO POSITION</span>
              </div>
            </div>

            {/* Controls Box */}
            <div className="space-y-3 bg-slate-50/90 p-4 rounded-2xl border border-purple-100">
              {/* Zoom Slider with quick buttons */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-medium text-slate-500 text-[11px]">
                    ZOOM SCALE
                  </span>
                  <span className="font-mono font-bold text-[var(--color-primary)] text-xs">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center transition-colors text-sm shadow-2xs"
                    title="Zoom Out"
                  >
                    &minus;
                  </button>
                  <input
                    type="range"
                    min="0.6"
                    max="3.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-[var(--color-primary)] cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(z + 0.15, 3.5))}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center transition-colors text-sm shadow-2xs"
                    title="Zoom In"
                  >
                    &#43;
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons & Rotate row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
                      Math.abs(zoom - 1) < 0.05
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    1x
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1.5)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
                      Math.abs(zoom - 1.5) < 0.05
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    1.5x
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(2)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
                      Math.abs(zoom - 2) < 0.05
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    2x
                  </button>

                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs ml-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    <span>Rotate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-600 transition-colors shadow-2xs"
                  >
                    Reset
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Pick Different Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium leading-relaxed flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-red-600 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropAndUpload}
            disabled={!imageSrc || isUploading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 hover:from-[var(--color-primary-light)] hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-purple-900/15 disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing &amp; Uploading...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Crop &amp; Upload to Storage</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
