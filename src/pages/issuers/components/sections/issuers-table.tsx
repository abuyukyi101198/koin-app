import { RowSelectionState, Updater } from "@tanstack/react-table";

import {
  DataTable,
  DataTableProps,
} from "@/components/composite/data-table.tsx";
import { EmptyIssuers } from "@/pages/issuers/components/misc/empty-issuers.tsx";
import { useIssuersTableColumns } from "@/pages/issuers/hooks/use-issuers-table-columns.tsx";
import { Issuer } from "@/query/types";

interface IssuersTableProps {
  data: Issuer[];
  searchQuery: string;
  loading: DataTableProps<Issuer>["loading"];
  selection: DataTableProps<Issuer>["selection"];
  onRefresh?: () => void;
}

export function IssuersTable({
  data,
  searchQuery,
  loading,
  selection,
  onRefresh,
}: IssuersTableProps) {
  const columns = useIssuersTableColumns();

  const guardedSelection: DataTableProps<Issuer>["selection"] = selection
    ? {
        rowSelection: selection.rowSelection,
        onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
          const next =
            typeof updater === "function"
              ? updater(selection.rowSelection)
              : updater;
          if (!Object.values(next).some(Boolean)) return;
          selection.onRowSelectionChange(updater);
        },
      }
    : undefined;

  return (
    <DataTable<Issuer>
      columns={columns}
      data={data}
      defaultExpanded={true}
      empty={
        <EmptyIssuers
          onRefresh={onRefresh}
          type={searchQuery.length ? "no match" : "no data"}
        />
      }
      getSubRows={(row) => row.predecessors as Issuer[]}
      loading={loading}
      selection={guardedSelection}
    />
  );
}
