import { useGetCoin } from "@/query/commands";
import { asFraction } from "@/utils/asFraction.tsx";

interface CoinInfoProps {
  coinId: number;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value?: number): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function CoinInfo({ coinId }: CoinInfoProps) {
  const { data } = useGetCoin({ id: coinId });

  return (
    <div className="h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b px-6 pt-8 pb-3">
        <div className="space-y-1">
          <h1 className="scroll-m-20 text-2xl font-medium tracking-wide text-balance">
            {asFraction(data?.title, data?.value)}
          </h1>
          <h2 className="text-lg font-normal italic text-muted-foreground">
            {data?.description || "—"}
          </h2>
        </div>
      </div>

      {/* Grid Section */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="grid grid-cols-3 gap-6 px-6">
          {/* Value */}
          <div className="space-y-1 border-r pr-6">
            <h3 className="text-sm font-medium text-muted-foreground">Value</h3>
            <p className="text-xs font-semibold">
              {data?.value} {data?.currency}
            </p>
          </div>

          {/* Issuer */}
          <div className="space-y-1 border-r px-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Issuer
            </h3>
            <div className="flex items-center gap-2">
              {data?.issuer.flag && (
                <img
                  alt={`${data.issuer.name} flag`}
                  className="h-3 w-4.5"
                  loading="lazy"
                  src={data.issuer.flag}
                />
              )}
              <span className="text-xs font-semibold">{data?.issuer.name}</span>
              {data?.issuer.name !== "Other" && (
                <span className="grow text-xs italic text-muted-foreground">
                  ({data?.issuer.start_year}-{data?.issuer.end_year ?? "pres."})
                </span>
              )}
            </div>
          </div>

          {/* Year */}
          <div className="space-y-1 pl-6">
            <h3 className="text-sm font-medium text-muted-foreground">Year</h3>
            <p className="text-xs font-semibold">{data?.year}</p>
          </div>

          {/* Collection Date */}
          <div className="space-y-1 border-r pr-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Collection date
            </h3>
            <p className="text-xs font-semibold">
              {formatDate(data?.created_at)}
            </p>
          </div>

          {/* Quantity */}
          <div className="space-y-1 border-r px-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Quantity
            </h3>
            <p className="text-xs font-semibold">{data?.quantity}</p>
          </div>

          {/* Estimated Sale Value */}
          <div className="space-y-1 pl-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Estimated sale value
            </h3>
            <p className="text-xs font-semibold">
              {formatCurrency(data?.sale_value)}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="h-full shrink-0 border-t bg-input/30 px-6 py-5">
        <p className="text-sm italic text-muted-foreground">
          {data?.notes || "No additional notes."}
        </p>
      </div>
    </div>
  );
}
