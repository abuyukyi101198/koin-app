import { useMemo, useState } from "react";

import { Edit3 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { useNotebookSelection } from "@/context/notebook-selection-context.tsx";
import { NotebookForm } from "@/pages/notebooks/components/forms/notebook-form.tsx";
import { NotebookFormData } from "@/pages/notebooks/schemas/notebook-form-schema.ts";
import {
  useGetNotebook,
  useUpdateNotebook,
} from "@/query/commands/notebooks.ts";
import { UpdateNotebookRequest } from "@/query/types/notebooks.ts";

interface UpdateNotebookDialogProps {
  id: number;
  size?: "default" | "sm";
}

export function UpdateNotebookDialog({
  id,
  size = "default",
}: UpdateNotebookDialogProps) {
  const { setRowSelection } = useNotebookSelection();
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useGetNotebook({ id });

  const updateNotebookMutation = useUpdateNotebook();

  const initialValues = useMemo(
    () => ({
      title: data?.title || "",
      description: data?.description || "",
      rows_per_page: data?.rows_per_page.toString() || "1",
      columns_per_page: data?.columns_per_page.toString() || "1",
      number_of_pages: data?.number_of_pages.toString() || "1",
    }),
    [data]
  );

  const handleSubmit = async (values: NotebookFormData) => {
    const updateData: UpdateNotebookRequest = {
      id,
      title: (values.title ?? "").trim(),
      description: (values.description ?? "").trim() || undefined,
      rows_per_page: parseInt(values.rows_per_page ?? "0", 10),
      columns_per_page: parseInt(values.columns_per_page ?? "0", 10),
      number_of_pages: parseInt(values.number_of_pages ?? "0", 10),
    };

    updateNotebookMutation.mutate(updateData, {
      onSuccess: (notebook) => {
        toast.success(`${notebook.title} updated successfully!`, {
          position: "bottom-right",
        });
        setIsOpen(false);
        setRowSelection({ [notebook.id]: true });
      },
      onError: (error) => {
        const errorMessage = error?.message || "Failed to update notebook";
        toast.error(errorMessage, {
          position: "bottom-right",
        });
      },
    });
  };

  return (
    <>
      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 cursor-default"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}
      <Dialog modal={false} onOpenChange={setIsOpen} open={isOpen}>
        <DialogTrigger asChild>
          {size === "default" ? (
            <Button className="cursor-pointer" variant="outline">
              Edit notebook
            </Button>
          ) : (
            <Button
              className="text-muted-foreground cursor-pointer p-0"
              size="icon-xs"
              variant="ghost"
            >
              <Edit3 />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl p-8 z-50" showCloseButton={false}>
          <DialogHeader className="hidden">
            <DialogTitle>Edit notebook</DialogTitle>
            <DialogDescription>
              Update the details of your notebook.
            </DialogDescription>
          </DialogHeader>
          <NotebookForm
            initialValues={initialValues}
            isOpen={isOpen}
            onSubmit={handleSubmit}
            submitLabel={
              updateNotebookMutation.isPending
                ? "Updating..."
                : "Update notebook"
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
