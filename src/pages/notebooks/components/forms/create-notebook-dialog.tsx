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
import { NotebookForm } from "@/pages/notebooks/components/forms/notebook-form.tsx";
import { NotebookFormData } from "@/pages/notebooks/schemas/notebook-form-schema.ts";
import { useCreateNotebook } from "@/query/commands/notebooks.ts";
import { CreateNotebookRequest } from "@/query/types/notebooks.ts";

interface CreateNotebookDialogProps {
  size?: "default" | "sm";
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
}: CreateNotebookDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const createNotebookMutation = useCreateNotebook();

  const handleSubmit = async (values: NotebookFormData) => {
    const createData: CreateNotebookRequest = {
      title: (values.title ?? "").trim(),
      description: (values.description ?? "").trim() || undefined,
      rows_per_page: parseInt(values.rows_per_page ?? "0", 10),
      columns_per_page: parseInt(values.rows_per_page ?? "0", 10),
      number_of_pages: parseInt(values.rows_per_page ?? "0", 10),
    };

    createNotebookMutation.mutate(createData, {
      onSuccess: (notebook) => {
        toast.success(`${notebook.title} added successfully!`, {
          position: "bottom-right",
        });
        setIsOpen(false);
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
        <DialogContent className="sm:max-w-xl p-8 z-50" showCloseButton={false}>
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
