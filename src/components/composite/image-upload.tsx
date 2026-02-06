import { useState, useRef, ChangeEvent, HTMLAttributes } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils.ts";
import { Upload, Link as LinkIcon, XIcon } from "lucide-react";

interface ImageUploadFieldProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  label?: string;
  value?: string;
  onChange?: (imageUrl: string) => void;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  className,
  ...props
}: ImageUploadFieldProps) {
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Max file size: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File is too large (max 10MB).");
      e.target.value = "";
      return;
    }

    // Read file and convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onChange?.(result);
      setUploadError(null);
      setUrlError(null);
      e.target.value = "";
    };
    reader.onerror = () => {
      setUploadError("Failed to read file.");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setUrlError("Please enter a URL.");
      return;
    }

    setUrlError(null);

    try {
      // Validate URL syntax
      new URL(urlInput);

      // Lightweight HEAD request to verify content type
      try {
        const response = await fetch(urlInput, { method: "HEAD" });
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.startsWith("image/")) {
          setUrlError("URL does not point to a valid image.");
          return;
        }
      } catch {
        // HEAD request failed, but that's okay - accept URL optimistically
        // Broken images will fail gracefully in the <img> tag
      }

      // Accept URL optimistically
      onChange?.(urlInput);
      setUploadError(null);
      setUrlError(null);
      setUrlInput("");
      setShowUrlDialog(false);
    } catch (err) {
      setUrlError("Invalid URL.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
              value && "border-solid border-border bg-transparent",
              uploadError && "border-destructive/50 bg-destructive/5"
            )}
            style={{
              aspectRatio: 1,
              cursor: "context-menu",
            }}
          >
            {value ? (
              <img
                src={value}
                alt={label || "Uploaded image"}
                className="h-full w-full rounded-[6px] object-contain"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Right-click to upload
                </p>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => {
              setShowUrlDialog(true);
              setUrlError(null);
            }}
            className="flex gap-2"
          >
            <LinkIcon className="h-4 w-4" />
            Embed image URL
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => fileInputRef.current?.click()}
            className="flex gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload image
          </ContextMenuItem>
          {value && (
            <>
              <div className="my-1" data-slot="separator" />
              <ContextMenuItem
                onClick={() => {
                  onChange?.("");
                  setUploadError(null);
                  setUrlError(null);
                }}
                className="text-destructive focus:text-destructive"
              >
                <XIcon className="h-4 w-4 text-destructive focus:text-destructive" />
                Remove image
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        alt={label || "Upload image"}
      />
      <Dialog
        open={showUrlDialog}
        onOpenChange={(open) => {
          setShowUrlDialog(open);
          if (!open) {
            setUrlError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Embed Image URL</DialogTitle>
            <DialogDescription>
              Enter the URL of the image you want to embed
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleUrlSubmit();
                }
              }}
            />
            {urlError && (
              <p className="text-sm text-destructive italic">{urlError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUrlSubmit}>Embed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {uploadError && !showUrlDialog && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}
    </div>
  );
}
