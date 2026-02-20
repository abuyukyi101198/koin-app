import { useState } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { FieldLabel } from "@/components/ui/field.tsx";
import { useDeleteCoin, useGetCoin } from "@/query/commands";

interface DeleteCoinDialogProps {
  id: number;
  size?: "default" | "sm";
}

export function DeleteCoinDialog({
  id,
  size = "default",
}: DeleteCoinDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useGetCoin({ id });

  const deleteCoinMutation = useDeleteCoin();

  const handleSubmit = async () => {
    deleteCoinMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(`${data?.title} deleted successfully!`, {
            position: "bottom-right",
          });
          setIsOpen(false);
        },
        onError: (error) => {
          const errorMessage = error?.message || "Failed to delete coin";
          toast.error(errorMessage, {
            position: "bottom-right",
          });
        },
      }
    );
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
            <Button
              className="hover:bg-destructive-foreground! cursor-pointer"
              variant="destructive"
            >
              Delete coin
            </Button>
          ) : (
            <Button
              className="text-destructive hover:text-destructive-foreground cursor-pointer p-0"
              size="icon-xs"
              variant="ghost"
            >
              <Trash2 />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg p-8 z-50" showCloseButton={false}>
          <DialogHeader className="hidden">
            <DialogTitle>Delete coin</DialogTitle>
            <DialogDescription>
              Delete the coin record from your catalogue.
            </DialogDescription>
          </DialogHeader>
          <FieldLabel>
            Are you sure you want to delete {data?.title}?
          </FieldLabel>
          <DialogFooter className="pt-2.5">
            <DialogClose asChild>
              <Button className="cursor-pointer" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="hover:bg-destructive-foreground! cursor-pointer"
              onClick={handleSubmit}
              variant="destructive"
            >
              Delete coin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
