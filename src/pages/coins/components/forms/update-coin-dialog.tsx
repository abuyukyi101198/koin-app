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
import { useCoinSelection } from "@/context/coin-selection-context.tsx";
import { CoinForm } from "@/pages/coins/components/forms/coin-form.tsx";
import { CoinFormData } from "@/pages/coins/schemas/coin-form-schema.ts";
import { useGetCoin, useUpdateCoin } from "@/query/commands";
import { UpdateCoinRequest } from "@/query/types";

interface UpdateCoinDialogProps {
  id: number;
  size?: "default" | "sm";
}
export function UpdateCoinDialog({
  id,
  size = "default",
}: UpdateCoinDialogProps) {
  const { setRowSelection } = useCoinSelection();
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useGetCoin({ id });

  const updateCoinMutation = useUpdateCoin();

  const initialValues = useMemo(
    () => ({
      reverseImage: data?.reverse_image || "",
      obverseImage: data?.obverse_image || "",
      description: data?.description || "",
      value: data?.value.toString() || "",
      currency: data?.currency || "",
      year: data?.year.toString() || "",
      issuer: {
        id: data?.issuer.id,
        name: data?.issuer.name,
        flag: data?.issuer.flag,
        start_year: data?.issuer.start_year,
        end_year: data?.issuer.end_year,
      } as never,
      quantity: data?.quantity.toString() || "1",
      saleValue: data?.sale_value?.toString() || "",
      notes: data?.notes || "",
    }),
    [data]
  );

  const handleSubmit = async (values: CoinFormData) => {
    const updateData: UpdateCoinRequest = {
      id,
      value: values.value ? parseFloat(values.value) : undefined,
      currency: values.currency ? (values.currency ?? "").trim() : undefined,
      year: values.year ? parseInt(values.year ?? "0", 10) : undefined,
      issuer_id: values.issuer?.id,
      description: values.description
        ? (values.description ?? "").trim() || undefined
        : undefined,
      obverse_image: values.obverseImage || undefined,
      reverse_image: values.reverseImage || undefined,
      quantity: values.quantity
        ? parseInt(values.quantity ?? "0", 10)
        : undefined,
      sale_value: values.saleValue ? parseFloat(values.saleValue) : undefined,
      notes: values.notes
        ? (values.notes ?? "").trim() || undefined
        : undefined,
    };

    updateCoinMutation.mutate(updateData, {
      onSuccess: (coin) => {
        toast.success(`${coin.title} updated successfully!`, {
          position: "bottom-right",
        });
        setIsOpen(false);
        setRowSelection({ [coin.id]: true });
      },
      onError: (error) => {
        const errorMessage = error?.message || "Failed to update coin";
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
              Edit coin
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
        <DialogContent
          className="sm:max-w-4xl p-8 z-50"
          showCloseButton={false}
        >
          <DialogHeader className="hidden">
            <DialogTitle>Edit coin in catalogue</DialogTitle>
            <DialogDescription>
              Update the details of your coin record.
            </DialogDescription>
          </DialogHeader>
          <CoinForm
            initialValues={initialValues}
            isOpen={isOpen}
            onSubmit={handleSubmit}
            submitLabel={
              updateCoinMutation.isPending ? "Updating..." : "Update coin"
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
