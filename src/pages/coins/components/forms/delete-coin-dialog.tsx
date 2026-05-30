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
import { useCoinSelection } from "@/context/coin-selection-context.tsx";
import { useDeleteCoin, useGetCoin } from "@/query/commands";

interface DeleteCoinDialogProps {
  id: number;
  size?: "default" | "sm";
}

export function DeleteCoinDialog({
  id,
  size = "default",
}: DeleteCoinDialogProps) {
  const { setRowSelection } = useCoinSelection();
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
          setRowSelection({});
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
              className="bg-destructive/20 hover:bg-destructive/50! cursor-pointer"
              variant="destructive"
            >
              Delete coin
            </Button>
          ) : (
            <Button
              className="bg-destructive/20 text-destructive hover:bg-destructive/50! hover:text-destructive-foreground cursor-pointer p-0"
              size="icon-xs"
              variant="ghost"
            >
              <Trash2 />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg p-8 z-50" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              Delete <span className="underline">{data?.title}</span>?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete this coin from your catalogue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2.5">
            <DialogClose asChild>
              <Button className="cursor-pointer" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="bg-destructive/20 hover:bg-destructive/50! cursor-pointer"
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
