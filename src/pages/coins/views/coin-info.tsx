import { useGetCoin } from "@/query/commands";

interface CoinInfoProps {
  coinId: number;
}

export function CoinInfo({ coinId }: CoinInfoProps) {
  const { data } = useGetCoin({ id: coinId });

  return (
    <div className="h-full w-full flex justify-between">
      <div className="h-full w-fit flex flex-col gap-2 border-r p-6">
        <div className="max-h-1/2 min-h-0 aspect-square flex flex-1 items-center justify-center">
          {data?.reverse_image ? (
            <img
              alt="Coin reverse"
              className="max-w-full max-h-full object-contain rounded"
              src={data.reverse_image}
            />
          ) : (
            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
              R
            </div>
          )}
        </div>
        <div className="max-h-1/2 min-h-0 aspect-square flex items-center justify-center">
          {data?.obverse_image ? (
            <img
              alt="Coin obverse"
              className="max-w-full max-h-full object-contain rounded"
              src={data.obverse_image}
            />
          ) : (
            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
              O
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="border-b pb-2">
          <h1 className="scroll-m-20 text-2xl font-medium tracking-wide text-balance">
            {data?.title}
          </h1>
          <h2 className="scroll-m-20 text-1xl text-muted-foreground font-normal italic tracking-normal first:mt-0">
            {data?.description?.length ? data.description : "—"}
          </h2>
        </div>
        <p className="leading-7 mt-3 text-sm">
          {data?.notes?.length ? data.notes : "No additional notes."}
        </p>
      </div>
    </div>
  );
}
