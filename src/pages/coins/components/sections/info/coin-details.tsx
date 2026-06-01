import { useState } from "react";

import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { CoinDetailField } from "@/pages/coins/components/sections/info/coin-detail-field.tsx";
import { Coin } from "@/query/types";

interface CoinDetailsProps {
  data: Coin | undefined;
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

export function CoinDetails({ data }: CoinDetailsProps) {
  const [expanded, setExpanded] = useState(false);
  const hasNotes = Boolean(data?.notes?.trim());

  return (
    <section aria-labelledby="coin-details-heading" className="flex flex-col">
      <header className="shrink-0 border-b pt-4 pb-2">
        <h2
          className="scroll-m-20 font-serif font-medium tracking-wide"
          id="coin-details-heading"
        >
          Details
        </h2>
      </header>
      <dl className="flex flex-col gap-2 py-4 text-xs">
        <CoinDetailField label="Value">
          {data?.value} {data?.currency}
        </CoinDetailField>
        <CoinDetailField label="Description">
          {data?.description?.length ? data.description : "—"}
        </CoinDetailField>
        <CoinDetailField label="Issuer">
          <span className="text-xs leading-4 overflow-hidden text-wrap line-clamp-2">
            {data?.issuer.name}
          </span>
          {data?.issuer.name !== "Other" && (
            <span
              aria-label={`Years of issue: ${data?.issuer.start_year} to ${data?.issuer.end_year ?? "present"}`}
              className="text-xs italic text-muted-foreground"
            >
              {" "}
              ({data?.issuer.start_year}–{data?.issuer.end_year ?? "pres."})
            </span>
          )}
        </CoinDetailField>
        <CoinDetailField label="Year">{data?.year}</CoinDetailField>
        <CoinDetailField label="Collection date">
          {formatDate(data?.created_at)}
        </CoinDetailField>
        <CoinDetailField label="Quantity">{data?.quantity}</CoinDetailField>
        <CoinDetailField label="Estimated sale value">
          {formatCurrency(data?.sale_value)}
        </CoinDetailField>
        <CoinDetailField
          align="start"
          ddClassName="flex flex-col gap-1"
          label="Notes"
        >
          <p
            className={cn(
              "italic text-muted-foreground whitespace-pre-wrap wrap-break-word",
              !expanded && "line-clamp-3"
            )}
          >
            {hasNotes ? data?.notes : "No additional notes."}
          </p>
          {hasNotes && (
            <Button
              className="p-0 h-min self-start text-xs text-primary hover:underline cursor-pointer"
              onClick={() => {
                setExpanded((v) => !v);
              }}
              variant="link"
            >
              {expanded ? "View less" : "View more..."}
            </Button>
          )}
        </CoinDetailField>
      </dl>
    </section>
  );
}
