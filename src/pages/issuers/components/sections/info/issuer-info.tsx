import { DataTableProps } from "@/components/composite/data-table.tsx";
import { IssuerFlag } from "@/components/composite/issuer-flag.tsx";
import { Empty } from "@/components/ui/empty.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { IssuerTimeline } from "@/pages/issuers/components/sections/info/issuer-timeline.tsx";
import { useGetIssuer } from "@/query/commands";
import { Issuer } from "@/query/types";

interface IssuerInfoProps {
  issuerId: number | null;
  selection: DataTableProps<Issuer>["selection"];
}

export function IssuerInfo({ issuerId, selection }: IssuerInfoProps) {
  const { data, isLoading } = useGetIssuer({ id: issuerId ?? 0 });

  if (!issuerId || !data) {
    return <Empty className="bg-accent/50 rounded-none" />;
  }

  if (isLoading) {
    return <IssuerInfo.Skeleton />;
  }

  const isSelected = (id: number) =>
    selection?.rowSelection[id.toString()] ?? false;

  const selectItem = (id: number) => {
    if (!selection || isSelected(id)) return;
    selection.onRowSelectionChange({ [id.toString()]: true });
  };

  const hasTimeline =
    (data.predecessors?.length ?? 0) > 0 || (data.descendants?.length ?? 0) > 0;

  return (
    <section
      aria-busy={isLoading}
      aria-label="Issuer details"
      className="pl-4 pt-4 pr-1 h-full w-full flex flex-col overflow-hidden"
    >
      <header className="pr-3 shrink-0 flex w-full justify-between">
        <div className="mb-2 flex flex-col gap-1">
          <div className="flex gap-3">
            <IssuerFlag
              className="h-5 w-8 shrink-0 mt-1.5"
              flag={data.flag}
              name={data.name}
            />
            <h2 className="scroll-m-20 text-2xl font-serif font-medium tracking-wide text-balance">
              {data.name}
            </h2>
          </div>
          {data.name !== "Other" && (
            <span
              aria-label={`Years of issue: ${data.start_year} to ${data.end_year ? data.end_year : "present"}`}
              className="ml-11 pb-1.5 leading-4 overflow-hidden text-wrap line-clamp-2 font-sans text-sm text-muted-foreground italic"
            >
              ({data.start_year}-{data.end_year ?? "pres."})
            </span>
          )}
        </div>
      </header>

      <ScrollArea className="flex-1 min-h-0 pr-4">
        {hasTimeline && (
          <IssuerTimeline
            descendants={data.descendants}
            issuer={data}
            onSelect={selectItem}
            predecessors={data.predecessors}
          />
        )}
      </ScrollArea>
    </section>
  );
}

IssuerInfo.Skeleton = () => {
  return (
    <section
      aria-hidden="true"
      className="pl-4 pt-4 pr-1 h-full w-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="pr-3 shrink-0 mb-2 flex flex-col gap-1">
        <div className="mb-1 flex items-center gap-2">
          <IssuerFlag.Skeleton className="h-5 w-8 shrink-0 rounded" />
          <Skeleton className="h-7 w-full rounded" />
        </div>
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 pr-4 overflow-hidden flex flex-col">
        <IssuerTimeline.Skeleton />
      </div>
    </section>
  );
};
