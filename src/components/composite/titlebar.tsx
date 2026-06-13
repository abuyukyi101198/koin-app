import { useEffect, useRef, useState } from "react";

import { listen } from "@tauri-apps/api/event";
import { Braces, FileUp, FolderUp, ImageUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useExportCoins } from "@/query/commands";

export function Titlebar() {
  const [isExporting, setIsExporting] = useState(false);
  const loadingToastId = useRef<number | string | null>(null);
  const processedOpIds = useRef<Set<number>>(new Set());
  const exportMutation = useExportCoins();

  // Set up event listeners for image export progress
  useEffect(() => {
    let unlistenStarted: (() => void) | null = null;
    let unlistenCompleted: (() => void) | null = null;
    let unlistenError: (() => void) | null = null;

    const setupListeners = async () => {
      unlistenStarted = await listen<{ op_id: number }>(
        "image_export_started",
        (event) => {
          const op_id = event.payload.op_id;
          // Only process if not already processing this operation
          if (processedOpIds.current.has(op_id)) {
            return;
          }
          processedOpIds.current.add(op_id);

          loadingToastId.current = toast.loading("Exporting images...", {
            position: "bottom-right",
          });
        }
      );

      unlistenCompleted = await listen<{
        op_id: number;
        message: string;
        file_path: string | null;
      }>("image_export_completed", (event) => {
        const op_id = event.payload.op_id;
        // Only process if not already processed this operation
        if (!processedOpIds.current.has(op_id)) {
          return;
        }
        processedOpIds.current.delete(op_id);

        if (loadingToastId.current !== null) {
          toast.dismiss(loadingToastId.current);
        }
        toast.success(event.payload.message, {
          position: "bottom-right",
          duration: 4000,
        });

        setIsExporting(false);
      });

      unlistenError = await listen<{ op_id: number; error: string }>(
        "image_export_error",
        (event) => {
          const op_id = event.payload.op_id;
          // Only process if not already processed this operation
          if (!processedOpIds.current.has(op_id)) {
            return;
          }
          processedOpIds.current.delete(op_id);

          if (loadingToastId.current !== null) {
            toast.dismiss(loadingToastId.current);
          }
          toast.error(event.payload.error, {
            position: "bottom-right",
          });

          setIsExporting(false);
        }
      );
    };

    setupListeners();

    return () => {
      unlistenStarted?.();
      unlistenCompleted?.();
      unlistenError?.();
    };
  }, []);

  const handleExport = async (format: "csv" | "image" | "json") => {
    setIsExporting(true);

    // For image export, skip initial toast - event listeners will handle it
    const toastId =
      format !== "image"
        ? toast.loading(`Exporting as ${format.toUpperCase()}...`, {
            position: "bottom-right",
          })
        : null;

    try {
      const result = await exportMutation.mutateAsync({ format });

      // For image export, the event listeners will handle the success message and state
      if (format !== "image") {
        if (toastId) {
          toast.dismiss(toastId);
        }
        toast.success(result.message, {
          position: "bottom-right",
          duration: 4000,
        });
        setIsExporting(false);
      }
      // For image export, don't set isExporting to false here - event handlers will do it
    } catch (error) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Export failed. Please try again.";
      toast.error(errorMessage, {
        position: "bottom-right",
      });
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-12 select-none bg-sidebar"
      data-tauri-drag-region
    >
      <div
        className="flex h-full items-center justify-end pl-20 pr-3"
        data-tauri-drag-region
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isExporting}>
            <Button
              className="gap-2 hover:cursor-pointer text-xs text-muted-foreground"
              size="sm"
              variant="ghost"
            >
              <FolderUp className="size-3" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-xs text-muted-foreground hover:cursor-pointer"
              onClick={() => handleExport("csv")}
            >
              <FileUp className="focus:text-primary" />
              CSV...
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs text-muted-foreground hover:cursor-pointer"
              onClick={() => handleExport("json")}
            >
              <Braces className="focus:text-primary" />
              JSON...
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs text-muted-foreground hover:cursor-pointer"
              disabled={isExporting}
              onClick={() => handleExport("image")}
            >
              <ImageUp className="focus:text-primary" />
              Images...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
