import { useGetCoin } from "@/query/commands";

interface CoinPreviewProps {
  coinId: number;
}

export function CoinPreview({ coinId }: CoinPreviewProps) {
  const { data, isLoading } = useGetCoin({ id: coinId });

  return (
    <section
      aria-busy={isLoading}
      aria-label="Coin preview images"
      className="flex flex-col h-full w-1/6 justify-center items-center overflow-hidden gap-6 border-r border-b p-6"
    >
      {/* Reverse image preview */}
      <figure className="flex-1 min-h-0 max-h-full w-full flex items-center justify-center overflow-hidden">
        {data?.reverse_image ? (
          <>
            <img
              alt={`${data.title} reverse side`}
              className="max-w-full max-h-full object-contain rounded-full"
              src={data.reverse_image}
            />
            <figcaption className="sr-only">Reverse side</figcaption>
          </>
        ) : (
          <div
            aria-label="Reverse image not available"
            className="w-full h-full bg-muted rounded flex items-center justify-center gap-2 text-muted-foreground"
          >
            R
          </div>
        )}
      </figure>
      {/* Obverse image preview */}
      <figure className="flex-1 min-h-0 max-h-full w-full flex items-center justify-center overflow-hidden">
        {data?.obverse_image ? (
          <>
            <img
              alt={`${data.title} obverse side`}
              className="max-w-full max-h-full object-contain rounded-full"
              src={data.obverse_image}
            />
            <figcaption className="sr-only">Obverse side</figcaption>
          </>
        ) : (
          <div
            aria-label="Obverse image not available"
            className="w-full h-full bg-muted rounded flex items-center justify-center gap-2 text-muted-foreground"
          >
            O
          </div>
        )}
      </figure>
    </section>
  );
}
