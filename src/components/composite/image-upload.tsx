import { useState, useRef, ChangeEvent, HTMLAttributes } from "react";

import { Upload, Link as LinkIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
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
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils.ts";

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
    } catch (e) {
      setUrlError("Invalid URL.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "relative rounded-none border border-input border-l-0 border-t-0 border-r-0 transition-colors overflow-hidden aspect-square cursor-context-menu",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-transparent shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0",
              value && "bg-transparent rounded-lg",
              uploadError && "border-destructive/50 bg-destructive/5"
            )}
          >
            {value ? (
              <img
                alt={label || "Uploaded image"}
                className="h-full w-full object-cover object-center"
                src={value}
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
            className="flex gap-2 cursor-pointer"
            onClick={() => {
              setShowUrlDialog(true);
              setUrlError(null);
            }}
          >
            <LinkIcon className="h-4 w-4 focus:text-primary" />
            Embed image URL
          </ContextMenuItem>
          <ContextMenuItem
            className="flex gap-2 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 focus:text-primary" />
            Upload image
          </ContextMenuItem>
          {value && (
            <>
              <div className="my-1" data-slot="separator" />
              <ContextMenuItem
                className="text-destructive focus:bg-secondary focus:text-destructive cursor-pointer"
                onClick={() => {
                  onChange?.("");
                  setUploadError(null);
                  setUrlError(null);
                }}
              >
                <XIcon className="h-4 w-4 text-destructive" />
                Remove image
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <input
        accept="image/*"
        alt={label || "Upload image"}
        className="hidden"
        onChange={handleFileUpload}
        ref={fileInputRef}
        type="file"
      />
      <Dialog
        onOpenChange={(open) => {
          setShowUrlDialog(open);
          if (!open) {
            setUrlError(null);
          }
        }}
        open={showUrlDialog}
      >
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              Embed Image URL
            </DialogTitle>
            <DialogDescription>
              Enter the URL of the image you want to embed
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              className="[&::-webkit-inner-spin-button]:appearance-none border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
              onChange={(e) => {
                setUrlInput(e.target.value);
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleUrlSubmit();
                }
              }}
              placeholder="https://example.com/image.jpg"
              value={urlInput}
            />
            {urlError && (
              <p className="text-sm text-destructive italic">{urlError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="cursor-pointer" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button className="cursor-pointer" onClick={handleUrlSubmit}>
              Embed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {uploadError && !showUrlDialog && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}
    </div>
  );
}
