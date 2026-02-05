import { useState, useRef, useCallback, ChangeEvent } from "react";
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

interface ImageUploadFieldProps {
  label?: string;
  value?: string;
  onChange?: (imageUrl: string) => void;
  size?: number;
  className?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  size = 256,
  className,
}: ImageUploadFieldProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(value);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback(
    (url: string) => {
      setImageUrl(url);
      onChange?.(url);
      setError(null);
    },
    [onChange]
  );

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Read file and convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleImageChange(result);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate URL by attempting to load it
      const img = new Image();
      img.onload = () => {
        handleImageChange(urlInput);
        setUrlInput("");
        setShowUrlDialog(false);
        setIsLoading(false);
      };
      img.onerror = () => {
        setError("Failed to load image from URL");
        setIsLoading(false);
      };
      img.src = urlInput;
    } catch (err) {
      setError("Invalid URL");
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    onChange?.("");
    setError(null);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
              imageUrl && "border-solid border-border bg-transparent",
              error && "border-destructive/50 bg-destructive/5"
            )}
            style={{
              width: size,
              height: size,
              cursor: "context-menu",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
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
            onClick={() => setShowUrlDialog(true)}
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
          {imageUrl && (
            <>
              <div className="my-1" data-slot="separator" />
              <ContextMenuItem
                onClick={handleRemoveImage}
                className="text-destructive focus:text-destructive"
              >
                <XIcon className="h-4 w-4 text-destructive focus:text-destructive" />
                Remove image
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        alt={label || "Upload image"}
      />

      {/* URL Input Dialog */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
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
                if (e.key === "Enter" && !isLoading) {
                  await handleUrlSubmit();
                }
              }}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleUrlSubmit} disabled={isLoading}>
              {isLoading ? "Loading..." : "Embed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && !showUrlDialog && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
