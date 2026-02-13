import { useGetCoin } from "@/query/commands";

interface CoinInfoProps {
  coinId: number;
}

export function CoinInfo({ coinId }: CoinInfoProps) {
  const { data } = useGetCoin({ id: coinId });

  return (
    <div className="h-full w-full flex justify-between">
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
