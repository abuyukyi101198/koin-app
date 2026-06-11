import { useEffect, useRef } from "react";

import { Skeleton } from "@/components/ui/skeleton.tsx";
import { TimelineIssuer } from "@/pages/issuers/components/sections/info/timeline-issuer.tsx";
import { Issuer } from "@/query/types";

interface IssuerTimelineProps {
  predecessors?: Issuer[];
  issuer: Issuer;
  descendants?: Issuer[];
  onSelect: (id: number) => void;
}

export function IssuerTimeline({
  predecessors,
  issuer,
  descendants,
  onSelect,
}: IssuerTimelineProps) {
  const selectedRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      selectedRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [issuer.id]);

  const nodes = [
    ...(predecessors ?? []).map((p) => ({
      issuer: p,
      variant: "predecessor" as const,
    })),
    { issuer, variant: "current" as const },
    ...(descendants ?? []).map((d) => ({
      issuer: d,
      variant: "descendant" as const,
    })),
  ];

  const selectedIndex = nodes.findIndex((n) => n.variant === "current");

  return (
    <section
      aria-labelledby="timeline-heading"
      className="h-64 flex flex-col pb-3 contain-[inline-size]"
    >
      <header className="shrink-0 border-b pt-4 pb-2">
        <h3
          className="scroll-m-20 font-serif font-medium tracking-wide"
          id="timeline-heading"
        >
          Timeline
        </h3>
      </header>
      <div className="mt-4 w-full min-w-0 flex-1 min-h-0 overflow-x-auto [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:bg-clip-content">
        <ol
          aria-labelledby="timeline-heading"
          className="min-w-full flex justify-between items-start py-1"
          role="listbox"
        >
          {nodes.map((node, i) => (
            <TimelineIssuer
              index={i}
              issuer={node.issuer}
              key={node.issuer.id}
              onSelect={onSelect}
              ref={selectedRef}
              selectedIndex={selectedIndex}
              totalCount={nodes.length}
              variant={node.variant}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

IssuerTimeline.Skeleton = () => {
  return (
    <section aria-hidden="true" className="flex flex-col pb-3">
      <div className="border-b pt-4 pb-2">
        <Skeleton className="h-4 w-16 rounded" />
      </div>
      <div className="my-4 flex justify-between items-start py-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <TimelineIssuer.Skeleton key={i} />
        ))}
      </div>
    </section>
  );
};
