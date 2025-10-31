"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFileUpload, formatBytes, type FileWithPreview } from "@/hooks/use-file-upload";
import { apiFetch } from "@/core/http/api-fetch";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

type UploadStatus = "pending" | "uploading" | "success" | "error";

type UploadState = {
  status: UploadStatus;
  progress: number;
  message?: string;
  referenceId?: string;
};

const STATUS_META: Record<
  UploadStatus,
  { label: string; badgeClass: string; progressLabel: string }
> = {
  pending: {
    label: "Queued",
    badgeClass: "bg-muted text-muted-foreground",
    progressLabel: "Ready to upload",
  },
  uploading: {
    label: "Uploading",
    badgeClass: "bg-primary/15 text-primary",
    progressLabel: "Uploading capture…",
  },
  success: {
    label: "Uploaded",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    progressLabel: "Upload complete",
  },
  error: {
    label: "Failed",
    badgeClass: "bg-destructive/15 text-destructive",
    progressLabel: "Upload failed",
  },
};

type LatestSuccess = {
  referenceId: string;
  name: string;
};

export function PcapUploadCard() {
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesAdded = useCallback((added: FileWithPreview[]) => {
    setUploadStates((prev) => {
      const next = { ...prev };
      added.forEach((item) => {
        if (!next[item.id]) {
          next[item.id] = { status: "pending", progress: 0 };
        }
      });
      return next;
    });
  }, []);

  const handleFilesChange = useCallback((current: FileWithPreview[]) => {
    setUploadStates((prev) => {
      const next: Record<string, UploadState> = {};
      current.forEach((item) => {
        next[item.id] = prev[item.id] ?? { status: "pending", progress: 0 };
      });
      return next;
    });
  }, []);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      clearErrors,
      getInputProps,
    },
  ] = useFileUpload({
    accept: ".pcap",
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: true,
    onFilesAdded: handleFilesAdded,
    onFilesChange: handleFilesChange,
  });

  const queueSize = useMemo(
    () =>
      files.filter((file) => {
        const status = uploadStates[file.id]?.status;
        return status !== "success" && status !== "uploading";
      }).length,
    [files, uploadStates],
  );

  const latestSuccessMessage = useMemo<LatestSuccess | null>(() => {
    const successfulEntries = files
      .map((item) => {
        const state = uploadStates[item.id];
        if (state?.status === "success" && state.referenceId) {
          const name = item.file instanceof File ? item.file.name : item.file.name;
          return {
            referenceId: state.referenceId,
            name,
          };
        }
        return null;
      })
      .filter((entry): entry is LatestSuccess => Boolean(entry));
    return successfulEntries.at(-1) ?? null;
  }, [files, uploadStates]);

  const updateUploadState = useCallback((id: string, updater: (state: UploadState) => UploadState) => {
    setUploadStates((prev) => {
      const current = prev[id] ?? { status: "pending", progress: 0 };
      return {
        ...prev,
        [id]: updater(current),
      };
    });
  }, []);

  const uploadSingle = useCallback(async (entry: FileWithPreview) => {
    if (!(entry.file instanceof File)) {
      updateUploadState(entry.id, () => ({
        status: "error",
        progress: 0,
        message: "Only new files can be uploaded from this interface.",
      }));
      return;
    }

    updateUploadState(entry.id, (state) => ({
      ...state,
      status: "uploading",
      progress: Math.max(state.progress, 18),
      message: undefined,
    }));

    try {
      const formData = new FormData();
      formData.append("file", entry.file);

      const response = await apiFetch("/api/pcap/upload", {
        method: "POST",
        body: formData,
      });

      const rawBody = await response.text();
      let payload: unknown = null;
      if (rawBody) {
        try {
          payload = JSON.parse(rawBody);
        } catch {
          // Non-JSON responses are ignored; payload stays null.
        }
      }

      if (!response.ok) {
        const errorMessage =
          ((payload as Record<string, unknown>)?.message ??
            (payload as Record<string, unknown>)?.error ??
            rawBody) || `Upload failed with status ${response.status}.`;
        throw new Error(String(errorMessage));
      }

      const reference =
        (payload as Record<string, unknown>)?.id ??
        (payload as Record<string, unknown>)?.fileId ??
        (payload as Record<string, unknown>)?.referenceId;
      const referenceId = typeof reference === "string" ? reference : undefined;

      updateUploadState(entry.id, (state) => ({
        ...state,
        status: "success",
        progress: 100,
        message: "Analyzer is processing this capture.",
        referenceId,
      }));

    } catch (error) {
      updateUploadState(entry.id, (state) => ({
        ...state,
        status: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Upload failed. Please try again.",
      }));
    }
  }, [updateUploadState]);

  const handleUploadAll = useCallback(async () => {
    if (isUploading) return;

    const queue = files.filter((entry) => {
      const status = uploadStates[entry.id]?.status;
      return status !== "success" && status !== "uploading";
    });
    if (queue.length === 0) return;

    setIsUploading(true);
    for (const entry of queue) {
      // eslint-disable-next-line no-await-in-loop
      await uploadSingle(entry);
    }
    setIsUploading(false);
  }, [files, isUploading, uploadStates, uploadSingle]);

  const handleRetry = useCallback(
    async (id: string) => {
      if (isUploading) return;
      const entry = files.find((item) => item.id === id);
      if (!entry) return;
      setIsUploading(true);
      await uploadSingle(entry);
      setIsUploading(false);
    },
    [files, isUploading, uploadSingle],
  );

  const handleRemoveFile = useCallback(
    (id: string) => {
      const status = uploadStates[id]?.status;
      if (status === "uploading") return;
      removeFile(id);
    },
    [removeFile, uploadStates],
  );

  const handleClearAll = useCallback(() => {
    if (isUploading) return;
    clearFiles();
    clearErrors();
    setUploadStates({});
  }, [clearFiles, clearErrors, isUploading]);

  return (
    <Card className="border border-border/60">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">Upload packet captures</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Drop or select multiple .pcap files (up to 50 MB each). We will queue and upload them one
          by one for analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isUploading) {
              openFileDialog();
            }
          }}
          onKeyDown={(event) => {
            if (!isUploading && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              openFileDialog();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          data-disabled={isUploading || undefined}
          className={cn(
            "relative flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-background/60 p-6 text-center transition-colors",
            "hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
            "data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/10",
            "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60",
          )}
        >
          <input
            {...getInputProps({ accept: ".pcap", multiple: true, disabled: isUploading })}
            className="sr-only"
            aria-label="Upload PCAP files"
          />
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Drop PCAP captures or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Supports multiple files · Max size {formatBytes(MAX_FILE_SIZE_BYTES, 0)} each
            </p>
          </div>
        </div>

        {errors.length > 0 ? (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Upload issue</p>
              <p className="text-xs text-destructive/80">{errors[0]}</p>
            </div>
          </div>
        ) : null}

        {files.length > 0 ? (
          <div className="space-y-4">
            {files.map((item) => {
              const file = item.file;
              const name = file instanceof File ? file.name : file.name;
              const size = file instanceof File ? file.size : file.size;
              const state = uploadStates[item.id] ?? { status: "pending", progress: 0 };
              const meta = STATUS_META[state.status];
              const progressValue = state.status === "success" ? 100 : state.progress;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/60 bg-muted/5 p-4 shadow-sm backdrop-blur"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <UploadCloud className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground" title={name}>
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          meta.badgeClass,
                        )}
                      >
                        {meta.label}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleRemoveFile(item.id)}
                        disabled={state.status === "uploading"}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  </div>

                    <div className="mt-3 space-y-2">
                    <Progress value={progressValue} />
                    <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                      <span>{meta.progressLabel}</span>
                      {state.referenceId ? (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          Ref: {state.referenceId}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {state.message ? (
                    <p
                      className={cn(
                        "mt-2 text-xs",
                        state.status === "error" ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {state.message}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {state.status === "error" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(item.id)}
                        disabled={isUploading}
                        className="gap-1"
                      >
                        <UploadCloud className="h-4 w-4" aria-hidden="true" />
                        Retry upload
                      </Button>
                    ) : null}
                    {state.status === "success" ? (
                      <Badge variant="secondary" className="flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Ready for analysis
                      </Badge>
                    ) : null}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
              <Button
                type="button"
                className="gap-2"
                onClick={handleUploadAll}
                disabled={isUploading || queueSize === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    {queueSize > 1 ? `Upload ${queueSize} files` : "Upload"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={isUploading || files.length === 0}
              >
                Clear selection
              </Button>
              {files.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {files.length} {files.length === 1 ? "file selected" : "files selected"}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-muted-foreground">
            No files queued yet. Drag captures here or click to start.
          </div>
        )}

        {latestSuccessMessage ? (
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Upload received
              </Badge>
              <span className="truncate text-xs text-muted-foreground" title={latestSuccessMessage.name}>
                {latestSuccessMessage.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Analyzer is processing this capture. Visit your history to monitor progress and review
              results once ready.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground">
                Ref: {latestSuccessMessage.referenceId}
              </span>
              <Button asChild size="sm">
                <Link href="/dashboard/history">Go to history</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
