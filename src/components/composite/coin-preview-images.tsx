import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { resolveImageSrc } from "@/utils/resolveImageSrc.ts";

interface CoinPreviewImagesProps {
  title: string;
  reverseImage?: string;
  obverseImage?: string;
  size?: "size-8" | "size-12";
  display?: "both" | "obverse" | "reverse";
}

export function CoinPreviewImages({
  title,
  reverseImage,
  obverseImage,
  size,
  display = "both",
}: CoinPreviewImagesProps) {
  return (
    <>
      {/* Reverse image preview */}
      {display !== "obverse" && (
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
                src={resolveImageSrc(reverseImage)}
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
      )}
      {/* Obverse image preview */}
      {display !== "reverse" && (
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
                src={resolveImageSrc(obverseImage)}
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
      )}
    </>
  );
}

CoinPreviewImages.Skeleton = ({
  size,
  display = "both",
}: Pick<CoinPreviewImagesProps, "display" | "size">) => {
  return (
    <>
      <Skeleton
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center overflow-hidden shrink-0 rounded-full",
          size ? size : "aspect-square flex-1 min-h-0 max-h-full w-full"
        )}
      />
      {display === "both" && (
        <Skeleton
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center overflow-hidden shrink-0 rounded-full",
            size ? size : "aspect-square flex-1 min-h-0 max-h-full w-full"
          )}
        />
      )}
    </>
  );
};
