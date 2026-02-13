import { useGetCoin } from "@/query/commands";

interface CoinPreviewProps {
  coinId: number;
}

export function CoinPreview({ coinId }: CoinPreviewProps) {
  const { data } = useGetCoin({ id: coinId });

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden gap-6">
      <div className="flex-1 min-h-0 max-h-full flex items-center justify-center overflow-hidden">
        {data?.reverse_image ? (
          <img
            alt="Coin reverse"
            className="max-w-full max-h-full object-contain rounded-full"
            src={data.reverse_image}
          />
        ) : (
          <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
            R
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 max-h-full flex items-center justify-center overflow-hidden">
        {data?.obverse_image ? (
          <img
            alt="Coin obverse"
            className="max-w-full max-h-full object-contain rounded-full"
            src={data.obverse_image}
          />
        ) : (
          <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
            O
          </div>
        )}
      </div>
    </div>
  );
}
