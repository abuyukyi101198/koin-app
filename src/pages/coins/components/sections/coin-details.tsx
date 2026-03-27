import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { DeleteCoinDialog } from "@/pages/coins/components/forms/delete-coin-dialog.tsx";
import { UpdateCoinDialog } from "@/pages/coins/components/forms/update-coin-dialog.tsx";
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

export function CoinDetails({ coinId }: CoinInfoProps) {
  const { data, isLoading } = useGetCoin({ id: coinId });

  return (
    <section
      aria-busy={isLoading}
      aria-label="Coin details"
      className="h-full w-7/12 flex flex-col overflow-hidden border-r border-b"
    >
      {/* Header */}
      <header className="w-full flex justify-between shrink-0 border-b px-6 pt-8 pb-3">
        <div className="space-y-1">
          <h2 className="scroll-m-20 text-2xl font-medium tracking-wide text-balance">
            {asFraction(data?.title, data?.value)}
          </h2>
          <p className="text-lg font-normal italic text-muted-foreground">
            {data?.description || "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <UpdateCoinDialog id={coinId} size="sm" />
          <DeleteCoinDialog id={coinId} size="sm" />
        </div>
      </header>

      {/* Feature description list */}
      <dl className="flex-1 grid grid-cols-3 gap-6 px-6 py-4">
        {/* Value */}
        <div className="space-y-1 border-r pr-6">
          <dt className="text-sm font-medium text-muted-foreground">Value</dt>
          <dd className="text-xs font-semibold">
            {data?.value} {data?.currency}
          </dd>
        </div>

        {/* Issuer */}
        <div className="space-y-1 border-r px-6">
          <dt className="text-sm font-medium text-muted-foreground">Issuer</dt>
          <dd className="flex items-start gap-2">
            {data?.issuer.flag && (
              <img
                alt={`${data.issuer.name} flag`}
                className="h-3 w-4.5 shrink-0 mt-0.5"
                loading="lazy"
                src={data.issuer.flag}
              />
            )}
            <span className="text-xs font-semibold h-8 leading-4 overflow-hidden text-wrap line-clamp-2">
              {data?.issuer.name}
            </span>
            {data?.issuer.name !== "Other" && (
              <span
                aria-label={`Years of issue: ${data?.issuer.start_year} to ${data?.issuer.end_year ? data.issuer.end_year : "present"}`}
                className="grow text-xs italic text-muted-foreground text-right"
              >
                ({data?.issuer.start_year}-{data?.issuer.end_year ?? "pres."})
              </span>
            )}
          </dd>
        </div>

        {/* Year */}
        <div className="space-y-1 pl-6">
          <dt className="text-sm font-medium text-muted-foreground">Year</dt>
          <dd className="text-xs font-semibold">{data?.year}</dd>
        </div>

        {/* Collection date */}
        <div className="space-y-1 border-r pr-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Collection date
          </dt>
          <dd className="text-xs font-semibold">
            {formatDate(data?.created_at)}
          </dd>
        </div>

        {/* Quantity */}
        <div className="space-y-1 border-r px-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Quantity
          </dt>
          <dd className="text-xs font-semibold">{data?.quantity}</dd>
        </div>

        {/* Estimated sale value */}
        <div className="space-y-1 pl-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Estimated sale value
          </dt>
          <dd className="text-xs font-semibold">
            {formatCurrency(data?.sale_value)}
          </dd>
        </div>
      </dl>

      {/* Notes */}
      <ScrollArea
        aria-label="Additional notes"
        className="h-full border-t bg-input/30 px-6 py-0 overflow-hidden"
      >
        <p className="text-sm italic text-muted-foreground whitespace-pre-wrap wrap-break-word py-5 pr-4">
          {data?.notes || "No additional notes."}
        </p>
      </ScrollArea>
    </section>
  );
}
