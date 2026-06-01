import { useState } from "react";

import { Book, ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useNotebookSelection } from "@/context/notebook-selection-context.tsx";
import { cn } from "@/lib/utils.ts";
import { CreateNotebookDialog } from "@/pages/notebooks/components/forms/create-notebook-dialog.tsx";
import { DeleteNotebookDialog } from "@/pages/notebooks/components/forms/delete-notebook-dialog.tsx";
import { UpdateNotebookDialog } from "@/pages/notebooks/components/forms/update-notebook-dialog.tsx";
import {
  useGetNotebook,
  useListNotebooks,
} from "@/query/commands/notebooks.ts";
import { Notebook } from "@/query/types/notebooks.ts";

interface NotebookContentsHeaderProps {
  notebookId: number;
}

export function NotebookContentsHeader({
  notebookId,
}: NotebookContentsHeaderProps) {
  const { data: notebook } = useGetNotebook({ id: notebookId });
  const { data: allNotebooks } = useListNotebooks({ pageSize: 200, page: 0 });
  const { setRowSelection } = useNotebookSelection();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const capacity = notebook
    ? notebook.rows_per_page *
      notebook.columns_per_page *
      notebook.number_of_pages
    : 0;
  const fillPct =
    capacity > 0
      ? Math.round(((notebook?.coin_count ?? 0) / capacity) * 100)
      : 0;
  const gridSpec = notebook
    ? `${notebook.rows_per_page}×${notebook.columns_per_page}`
    : "—";
  const pages = notebook ? `${notebook.number_of_pages} pages` : "—";
  const perPage = notebook
    ? `${notebook.rows_per_page * notebook.columns_per_page} pp`
    : "—";

  return (
    <header className="shrink-0 flex flex-col border-b">
      <div className="w-full flex justify-between border-b">
        <div className="flex items-end gap-2 pb-2">
          <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Switch notebook"
                className="cursor-pointer p-0! shrink-0 hover:bg-transparent! hover:text-primary!"
                variant="ghost"
              >
                <h1 className="scroll-m-20 text-2xl font-serif font-medium tracking-wide text-balance leading-none">
                  {notebook?.title}
                </h1>
                <ChevronDown className="size-4.5 pt-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-96" side="bottom">
              {(allNotebooks?.items ?? []).map((nb: Notebook) => {
                const nbCapacity =
                  nb.rows_per_page * nb.columns_per_page * nb.number_of_pages;
                const nbFillPct =
                  nbCapacity > 0
                    ? Math.round((nb.coin_count / nbCapacity) * 100)
                    : 0;
                const nbGridSpec = `${nb.rows_per_page}×${nb.columns_per_page}`;
                const nbPages = `${nb.number_of_pages} pp`;
                const isSelected = nb.id === notebookId;
                return (
                  <DropdownMenuItem
                    className={cn(
                      "relative overflow-hidden flex flex-col items-stretch gap-0.5 px-3 py-2 cursor-pointer hover:bg-muted!",
                      "before:absolute before:inset-y-0 before:left-0 before:w-0.75 before:transition-colors",
                      {
                        "bg-accent/50 before:bg-primary": isSelected,
                        "before:bg-transparent": !isSelected,
                      }
                    )}
                    key={nb.id}
                    onSelect={() => {
                      setRowSelection({ [nb.id]: true });
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-1 w-full">
                      <span className="text-sm font-serif font-medium leading-snug truncate flex-1">
                        {nb.title}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {nbGridSpec} · {nbPages}
                      </span>
                    </span>
                    {nb.description && (
                      <span className="text-xs italic text-muted-foreground leading-snug line-clamp-1">
                        {nb.description}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 w-full pt-0.5">
                      <span className="relative flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full bg-foreground/40 transition-all duration-300"
                          style={{ width: `${nbFillPct}%` }}
                        />
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                        {nb.coin_count}/{nbCapacity}
                      </span>
                    </span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex gap-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  setCreateDialogOpen(true);
                }}
              >
                <span className="flex items-center p-0 gap-0">
                  <Plus className="size-3 hover:text-primary" />
                  <Book className="hover:text-primary" />
                </span>
                Add a notebook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="h-8 flex items-center gap-1">
          <UpdateNotebookDialog id={notebookId} size="sm" />
          <DeleteNotebookDialog id={notebookId} size="sm" />
        </div>
      </div>

      {/* Create notebook dialog */}
      <CreateNotebookDialog
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
      />

      <div className="pt-2 pr-2.5 pb-2 flex items-end gap-2.5">
        <dl
          aria-label="Notebook details"
          className="flex flex-row items-end gap-x-6 font-sans text-xs"
        >
          <div className="flex flex-col gap-0.5">
            <dt className="text-primary">Description</dt>
            <dd>{notebook?.description}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-primary">Dimensions</dt>
            <dd className="tabular-nums">
              {gridSpec} · {pages} · {perPage}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-48">
            <dt className="text-primary">Capacity</dt>
            <dd className="flex items-center gap-2">
              <div className="relative flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-all duration-300"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <span className="tabular-nums whitespace-nowrap">
                {notebook?.coin_count ?? 0}/{capacity}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
