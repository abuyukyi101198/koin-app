import { useState } from "react";

import { Book, Plus } from "lucide-react";
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
import { useCreateNotebook } from "@/query/commands/notebooks.ts";
import { CreateNotebookRequest } from "@/query/types/notebooks.ts";

interface CreateNotebookDialogProps {
  size?: "default" | "sm";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const initialValues: NotebookFormData = {
  title: "",
  description: "",
  rows_per_page: "1",
  columns_per_page: "1",
  number_of_pages: "1",
};

export function CreateNotebookDialog({
  size = "default",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateNotebookDialogProps) {
  const { setRowSelection } = useNotebookSelection();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const setIsOpen = isControlled
    ? (controlledOnOpenChange ?? (() => {}))
    : setUncontrolledOpen;

  const createNotebookMutation = useCreateNotebook();

  const handleSubmit = async (values: NotebookFormData) => {
    const createData: CreateNotebookRequest = {
      title: (values.title ?? "").trim(),
      description: (values.description ?? "").trim() || undefined,
      rows_per_page: parseInt(values.rows_per_page ?? "0", 10),
      columns_per_page: parseInt(values.columns_per_page ?? "0", 10),
      number_of_pages: parseInt(values.number_of_pages ?? "0", 10),
    };

    createNotebookMutation.mutate(createData, {
      onSuccess: (notebook) => {
        toast.success(`${notebook.title} added successfully!`, {
          position: "bottom-right",
        });
        setIsOpen(false);
        setRowSelection({ [notebook.id]: true });
      },
      onError: (error) => {
        const errorMessage = error?.message || "Failed to add notebook";
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
        {!isControlled && (
          <DialogTrigger asChild>
            {size === "default" ? (
              <Button className="cursor-pointer" variant="outline">
                <span className="flex items-center p-0 gap-0">
                  <Plus className="size-3" />
                  <Book />
                </span>
                Add a notebook
              </Button>
            ) : (
              <Button className="cursor-pointer p-0 gap-0" variant="outline">
                <Plus className="size-3" />
                <Book />
              </Button>
            )}
          </DialogTrigger>
        )}
        <DialogContent
          className="sm:max-w-xl p-8 z-50"
          onInteractOutside={(e) => {
            if (isControlled) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (isControlled) e.preventDefault();
          }}
          showCloseButton={false}
        >
          <DialogHeader className="hidden">
            <DialogTitle>Add notebook</DialogTitle>
            <DialogDescription>
              Add a new notebook to organize your collection.
            </DialogDescription>
          </DialogHeader>
          <NotebookForm
            initialValues={initialValues}
            isOpen={isOpen}
            onSubmit={handleSubmit}
            submitLabel={
              createNotebookMutation.isPending ? "Saving..." : "Save notebook"
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
