import { useEffect, useState } from "react";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { cn } from "@/lib/utils.ts";
import { DataTableProps } from "@/pages/new_coins/views/data-table.tsx";
import { useGetCoin, useGetSimilarCoins } from "@/query/commands";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";
import { resolveImageSrc } from "@/utils/resolveImageSrc.ts";

interface CoinInfoProps {
  coinId: number;
  selection: DataTableProps<Coin>["selection"];
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

export function CoinDetails({ coinId, selection }: CoinInfoProps) {
  const { data, isLoading } = useGetCoin({ id: coinId });
  const { data: similarCoins } = useGetSimilarCoins({
    id: coinId,
    pageSize: 3,
  });

  const [notesExpanded, setNotesExpanded] = useState(false);
  const hasNotes = Boolean(data?.notes?.trim());

  // Reset expand state whenever the selected coin changes.
  useEffect(() => {
    setNotesExpanded(false);
  }, [coinId]);

  const isSelected = (id: number) =>
    selection?.rowSelection[id.toString()] ?? false;

  const toggleSelection = (id: number) => {
    if (!selection) return;
    selection.onRowSelectionChange({
      [id.toString()]: !isSelected(id),
    });
  };

  return (
    <section
      aria-busy={isLoading}
      aria-label="Coin details"
      className="flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="shrink-0 flex flex-col">
        <div className="mb-2 flex flex-col gap-1">
          <h1 className="scroll-m-20 text-2xl font-serif font-medium tracking-wide text-balance">
            {asFraction(data?.title, data?.value)}
          </h1>
          <div className="mb-1 w-full flex items-start gap-2">
            <img
              alt={`${data?.issuer.name} flag`}
              className="h-3 w-4.5 shrink-0 mt-0.5"
              loading="lazy"
              src={data?.issuer.flag?.length ? data?.issuer.flag : undefined}
            />
            <span className="pb-0.5 leading-4 overflow-hidden text-wrap line-clamp-2 font-sans text-sm text-muted-foreground">
              {data?.issuer.name}
            </span>
          </div>
        </div>
      </header>

      {/* Scrollable body — expands when notes are revealed */}
      <ScrollArea className="flex-1 min-h-0 pr-4">
        <section
          aria-busy={isLoading}
          aria-label="Coin preview images"
          className="my-4 flex w-full justify-between items-center overflow-hidden gap-2"
        >
          <CoinPreviewImages
            obverseImage={data?.obverse_image}
            reverseImage={data?.reverse_image}
            title={data?.title || ""}
          />
        </section>

        <section
          aria-busy={isLoading}
          aria-label="Similar coins table"
          className="flex flex-col overflow-hidden pb-3"
        >
          <header className="shrink-0 border-b pt-4 pb-2">
            <h2 className="scroll-m-20 font-serif font-medium tracking-wide text-balance">
              Similar coins
            </h2>
          </header>

          <div className="grid grid-cols-3 gap-3 pt-3" role="list">
            {similarCoins?.items.map((coin) => (
              <article
                className={cn(
                  "relative flex flex-col gap-3 rounded-lg border p-1 items-center",
                  "cursor-pointer transition-colors",
                  "hover:bg-muted!",
                  "data-[state=selected]:bg-accent/50!",
                  "overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-0.75",
                  "before:bg-transparent before:transition-colors",
                  "data-[state=selected]:before:bg-primary"
                )}
                data-state={isSelected(coin.id) ? "selected" : undefined}
                onClick={() => {
                  toggleSelection(coin.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSelection(coin.id);
                  }
                }}
                role="listitem"
                tabIndex={0}
              >
                {/* Coin images */}
                <figure
                  className={cn(
                    "flex items-center justify-center overflow-hidden shrink-0",
                    "size-12"
                  )}
                >
                  {coin.reverse_image ? (
                    <>
                      <img
                        alt={`${coin.title} reverse side`}
                        className="max-w-full max-h-full object-contain"
                        src={resolveImageSrc(coin.reverse_image)}
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

                {/* Details — fixed-height text rows so all cards are the same height */}
                <div className="w-full flex flex-col items-center gap-1">
                  <img
                    alt={`${coin.issuer.name} flag`}
                    className="h-3 w-4.5 shrink-0"
                    loading="lazy"
                    src={
                      coin.issuer.flag?.length ? coin.issuer.flag : undefined
                    }
                  />
                  <p className="w-full font-serif font-medium leading-4 line-clamp-1 text-xs text-center overflow-hidden">
                    {asFraction(coin.title, coin.value)}
                  </p>
                  <p className="h-8 w-full text-xs leading-4 line-clamp-2 text-muted-foreground text-center overflow-hidden">
                    {coin.issuer.name}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Feature description list */}
        <header className="shrink-0 border-b pt-4 pb-2">
          <h2 className="scroll-m-20 font-serif font-medium tracking-wide text-balance">
            Details
          </h2>
        </header>
        <dl className="flex flex-col gap-2 py-4 text-xs">
          {/* Value */}
          <div className="grid grid-cols-2 items-baseline">
            <dt className="font-medium text-primary">Value</dt>
            <dd>
              {data?.value} {data?.currency}
            </dd>
          </div>

          {/* Description */}
          <div className="grid grid-cols-2 items-baseline">
            <dt className="font-medium text-primary">Description</dt>
            <dd>{data?.description?.length ? data.description : "—"}</dd>
          </div>

          {/* Issuer */}
          <div className="grid grid-cols-2 items-baseline">
            <dt className="font-medium text-primary">Issuer</dt>
            <dd>
              <span className="text-xs leading-4 overflow-hidden text-wrap line-clamp-2">
                {data?.issuer.name}
              </span>
              {data?.issuer.name !== "Other" && (
                <span
                  aria-label={`Years of issue: ${data?.issuer.start_year} to ${data?.issuer.end_year ? data.issuer.end_year : "present"}`}
                  className="text-xs italic text-muted-foreground"
                >
                  ({data?.issuer.start_year}-{data?.issuer.end_year ?? "pres."})
                </span>
              )}
            </dd>
          </div>

          {/* Year */}
          <div className="grid grid-cols-2 items-baseline">
            <dt className="font-medium text-primary">Year</dt>
            <dd>{data?.year}</dd>
          </div>

          {/* Collection date */}
          <div className="grid grid-cols-2 items-baseline">
            <dt className="font-medium text-primary">Collection date</dt>
            <dd>{formatDate(data?.created_at)}</dd>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 items-baseline">
            <dt className="font-medium text-primary">Quantity</dt>
            <dd>{data?.quantity}</dd>
          </div>

          {/* Estimated sale value */}
          <div className="grid grid-cols-2 items-baseline">
            <dt className="font-medium text-primary">Estimated sale value</dt>
            <dd>{formatCurrency(data?.sale_value)}</dd>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 items-start">
            <dt className="font-medium text-primary">Notes</dt>
            <dd className="flex flex-col gap-1">
              <p
                className={cn(
                  "italic text-muted-foreground whitespace-pre-wrap wrap-break-word",
                  !notesExpanded && "line-clamp-3"
                )}
              >
                {hasNotes ? data!.notes : "No additional notes."}
              </p>
              {hasNotes && (
                <Button
                  className="p-0 h-min self-start text-xs text-primary hover:underline cursor-pointer"
                  onClick={() => {
                    setNotesExpanded((v) => !v);
                  }}
                  variant="link"
                >
                  {notesExpanded ? "View less" : "View more..."}
                </Button>
              )}
            </dd>
          </div>
        </dl>
      </ScrollArea>
    </section>
  );
}
