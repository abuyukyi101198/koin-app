import { cn } from "@/lib/utils.ts";

interface CoinPreviewImagesProps {
  title: string;
  reverseImage?: string;
  obverseImage?: string;
  size?: "size-8" | "size-12";
}

export function CoinPreviewImages({
  title,
  reverseImage,
  obverseImage,
  size,
}: CoinPreviewImagesProps) {
  return (
    <>
      {/* Reverse image preview */}
      <figure
        className={cn(
          "flex items-center justify-center overflow-hidden shrink-0",
          size ? size : "aspect-square flex-1 min-h-0 max-h-full w-full"
        )}
      >
        {reverseImage ? (
          <>
            <img
              alt={`${title} reverse side`}
              className="max-w-full max-h-full object-contain"
              src={reverseImage}
            />
            <figcaption className="sr-only">Reverse side</figcaption>
          </>
        ) : (
          <div
            aria-label="Reverse image not available"
            className="w-full aspect-square bg-muted flex items-center justify-center gap-2 text-muted-foreground rounded-full"
          >
            R
          </div>
        )}
      </figure>
      {/* Obverse image preview */}
      <figure
        className={cn(
          "flex items-center justify-center overflow-hidden shrink-0",
          size ? size : "aspect-square flex-1 min-h-0 max-h-full w-full"
        )}
      >
        {obverseImage ? (
          <>
            <img
              alt={`${title} obverse side`}
              className="max-w-full max-h-full object-contain"
              src={obverseImage}
            />
            <figcaption className="sr-only">Obverse side</figcaption>
          </>
        ) : (
          <div
            aria-label="Obverse image not available"
            className="w-full aspect-square bg-muted flex items-center justify-center gap-2 text-muted-foreground rounded-full"
          >
            O
          </div>
        )}
      </figure>
    </>
  );
}
