import { ReactNode } from "react";

import { cn } from "@/lib/utils.ts";

interface CoinDetailFieldProps {
  label: string;
  children: ReactNode;
  align?: "baseline" | "start";
  ddClassName?: string;
}

export function CoinDetailField({
  label,
  children,
  align = "baseline",
  ddClassName,
}: CoinDetailFieldProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2",
        align === "baseline" ? "items-baseline" : "items-start"
      )}
    >
      <dt className="font-medium text-primary">{label}</dt>
      <dd className={ddClassName}>{children}</dd>
    </div>
  );
}
