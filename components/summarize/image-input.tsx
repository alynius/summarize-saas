"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ImageInputProps {
  onSubmit: (images: Array<{ base64: string; mimeType: string; fileName: string }>) => void;
  isLoading?: boolean;
}

const MAX_IMAGES = 5;
const MAX_TOTAL_SIZE_MB = 20;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

interface SelectedImage {
  file: File;
  preview: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function ImageInput({ onSubmit, isLoading = false }: ImageInputProps) {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSize = images.reduce((sum, img) => sum + img.file.size, 0);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return "Invalid file type. Allowed: PNG, JPG, WEBP, GIF";
      }

      const newTotal = totalSize + file.size;
      if (newTotal > MAX_TOTAL_SIZE_BYTES) {
        return "Total size would exceed " + MAX_TOTAL_SIZE_MB + "MB limit.";
      }

      return null;
    },
    [totalSize]
  );

  const handleFilesSelect = useCallback(
    async (files: FileList | File[]) => {
      setError(null);

      const fileArray = Array.from(files);
      const remaining = MAX_IMAGES - images.length;

      if (fileArray.length > remaining) {
        setError("Can only add " + remaining + " more image(s). Maximum is " + MAX_IMAGES + ".");
        return;
      }

      const newImages: SelectedImage[] = [];

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview });
      }

      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files.length > 0) {
        handleFilesSelect(e.dataTransfer.files);
      }
    },
    [handleFilesSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFilesSelect(e.target.files);
      }
    },
    [handleFilesSelect]
  );

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (images.length === 0) {
        setError("Please select at least one image.");
        return;
      }

      // Convert to base64
      const imageData: Array<{ base64: string; mimeType: string; fileName: string }> = [];

      for (const img of images) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(img.file);
        });

        imageData.push({
          base64,
          mimeType: img.file.type,
          fileName: img.file.name,
        });
      }

      onSubmit(imageData);
    },
    [images, onSubmit]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/30"
            >
              <img
                src={img.preview}
                alt={img.file.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-xs text-white truncate">{img.file.name}</p>
                <p className="text-xs text-white/70">{formatFileSize(img.file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {images.length < MAX_IMAGES && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6 transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
            isLoading && "pointer-events-none opacity-50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleInputChange}
            className="hidden"
            disabled={isLoading}
            multiple
          />

          <div
            className={cn(
              "rounded-full p-3 transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}
          >
            {images.length > 0 ? (
              <ImageIcon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
            ) : (
              <Upload
                className={cn(
                  "h-6 w-6 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragging
                ? "Drop images here"
                : images.length > 0
                ? "Add more images"
                : "Drag and drop images"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse ({images.length}/{MAX_IMAGES} images, max {MAX_TOTAL_SIZE_MB}MB total)
            </p>
          </div>
        </div>
      )}

      {/* Status */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {images.length} image{images.length !== 1 ? "s" : ""} selected ({formatFileSize(totalSize)})
          </span>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={images.length === 0 || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Extract & Summarize"
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Upload images containing text to extract and summarize the content using OCR.
      </p>
    </form>
  );
}
