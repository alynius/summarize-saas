"use client";

import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfPreviewProps {
  fileName: string;
  fileSize: number;
  pageCount?: number;
  onRemove?: () => void;
  isLoading?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function PdfPreview({
  fileName,
  fileSize,
  pageCount,
  onRemove,
  isLoading = false,
}: PdfPreviewProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4 animate-in fade-in slide-in-from-bottom-2">
      {/* PDF Icon */}
      <div className="relative shrink-0">
        <div className="rounded-lg bg-red-500/10 p-3">
          <FileText className="h-6 w-6 text-red-500" />
        </div>
        {/* Small PDF badge */}
        <div className="absolute -bottom-1 -right-1 rounded bg-red-500 px-1 py-0.5 text-[8px] font-bold text-white uppercase">
          PDF
        </div>
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-sm text-foreground">
          {fileName}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{formatFileSize(fileSize)}</span>
          {pageCount !== undefined && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span>
                {pageCount} {pageCount === 1 ? "page" : "pages"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={isLoading}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove file</span>
        </Button>
      )}
    </div>
  );
}
