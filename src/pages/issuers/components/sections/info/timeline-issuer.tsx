import { RefObject } from "react";

import { IssuerFlag } from "@/components/composite/issuer-flag.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Issuer } from "@/query/types";

interface TimelineIssuerProps {
  index: number;
  issuer: Issuer;
  onSelect: (id: number) => void;
  ref: RefObject<HTMLLIElement | null>;
  selectedIndex: number;
  totalCount: number;
  variant: "current" | "descendant" | "predecessor";
}

export function TimelineIssuer({
  index,
  issuer,
  onSelect,
  ref,
  selectedIndex,
  totalCount,
  variant,
}: TimelineIssuerProps) {
  const isCurrent = variant === "current";
  const isDescendant = variant === "descendant";
  const isPredecessor = variant === "predecessor";

  const leftLineClass =
    index > 0
      ? index <= selectedIndex
        ? "bg-primary"
        : "bg-border"
      : "opacity-0";

  const rightLineClass =
    index < totalCount - 1
      ? index < selectedIndex
        ? "bg-primary"
        : "bg-border"
      : "opacity-0";

  return (
    <li
      aria-label={`${issuer.name}`}
      className="relative flex-1 flex flex-col gap-0.5 items-center"
      ref={isCurrent ? ref : undefined}
    >
      <div className="flex items-center w-full">
        <div className={cn("h-0.5 flex-1", leftLineClass)} />
        <div
          aria-hidden="true"
          className={cn(
            "size-3 shrink-0 rounded-full border-2 bg-background",
            isCurrent && "bg-primary border-primary",
            isPredecessor && "border-primary"
          )}
        />
        <div className={cn("h-0.5 flex-1", rightLineClass)} />
      </div>
      {/* Flag + name + dates */}
      <div
        aria-current={isCurrent ? "true" : undefined}
        aria-label={`Select ${issuer.name}`}
        className="m-1 p-2 pt-1 w-20 flex flex-col items-center text-center gap-2 rounded-sm cursor-pointer select-none transition-colors hover:bg-muted"
        onClick={() => {
          onSelect(issuer.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(issuer.id);
          }
        }}
        role="option"
        tabIndex={0}
      >
        {issuer.name !== "Other" && (
          <p
            className={cn(
              "text-[9px] italic text-muted-foreground leading-tight",
              isCurrent && "text-primary"
            )}
          >
            {issuer.start_year ?? "?"}
            &ndash;
            {issuer.end_year ?? "pres."}
          </p>
        )}
        <IssuerFlag
          className="h-3 w-5 shrink-0"
          flag={issuer.flag}
          name={issuer.name}
        />
        <p
          className={cn(
            "h-16 font-serif font-medium leading-4 line-clamp-4 text-xs text-center overflow-hidden",
            isCurrent && "font-semibold text-primary",
            isPredecessor && "text-foreground",
            isDescendant && "text-muted-foreground"
          )}
        >
          {issuer.name}
        </p>
      </div>
    </li>
  );
}

TimelineIssuer.Skeleton = () => {
  return (
    <li className="relative flex-1 flex flex-col gap-0.5 items-center">
      <div className="flex items-center w-full">
        <div className="h-0.5 flex-1 bg-border" />
        <div className="size-3 shrink-0 rounded-full border-2 bg-background" />
        <div className="h-0.5 flex-1 bg-border" />
      </div>
      <div className="m-1 p-2 pt-1 w-20 flex flex-col items-center text-center gap-2">
        <Skeleton className="h-2 w-10 rounded" />
        <IssuerFlag.Skeleton className="h-3 w-5 shrink-0 rounded" />
        <Skeleton className="h-16 w-full rounded" />
      </div>
    </li>
  );
};
