import { useGetCoin } from "@/query/commands";

interface CoinInfoProps {
  coinId: number;
}

export function CoinInfo({ coinId }: CoinInfoProps) {
  const { data } = useGetCoin({ id: coinId });

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-6 pt-8">
        <div className="w-full flex justify-between pb-3 border-b">
          <div>
            <h1 className="scroll-m-20 text-2xl font-medium tracking-wide text-balance">
              {data?.title}
            </h1>
            <h2 className="scroll-m-20 text-1xl text-muted-foreground font-normal italic tracking-normal first:mt-0">
              {data?.description?.length ? data.description : "—"}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-3">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1 border-r">
              <h3 className="text-sm font-medium text-muted-foreground">
                Value
              </h3>
              <p className="text-xs font-semibold">
                {data?.value} {data?.currency}
              </p>
            </div>
            <div className="space-y-1 border-r">
              <h3 className="text-sm font-medium text-muted-foreground">
                Issuer
              </h3>
              <div className="flex items-center gap-2">
                <span>
                  <img
                    alt={`${data?.issuer.name} flag`}
                    className="h-3 w-4.5"
                    loading="lazy"
                    src={
                      data?.issuer.flag?.length ? data?.issuer.flag : undefined
                    }
                  />
                </span>
                <span className="text-xs font-semibold">
                  {data?.issuer.name}
                </span>
                {data?.issuer.name !== "Other" && (
                  <span className="text-xs italic text-muted-foreground leading-5 grow">
                    ({data?.issuer.start_year}-
                    {data?.issuer.end_year ?? "pres."})
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Year
              </h3>
              <p className="text-xs font-semibold">{data?.year}</p>
            </div>
            <div className="space-y-1 border-r">
              <h3 className="text-sm font-medium text-muted-foreground">
                Collection date
              </h3>
              <p className="text-xs font-semibold">
                {data?.created_at
                  ? new Date(data.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div className="space-y-1 border-r">
              <h3 className="text-sm font-medium text-muted-foreground">
                Quantity
              </h3>
              <p className="text-xs font-semibold">{data?.quantity}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Estimated sale value
              </h3>
              <p className="text-xs font-semibold">
                {data?.sale_value
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(data.sale_value)
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="h-full leading-7 mt-3 p-6 pt-4 text-sm italic bg-input/30 text-muted-foreground border-t">
        {data?.notes?.length ? data.notes : "No additional notes."}
      </p>
    </div>
  );
}
