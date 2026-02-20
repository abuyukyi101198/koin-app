import { useState } from "react";

import { BadgeCent, Plus } from "lucide-react";
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
import { CoinForm } from "@/pages/coins/components/forms/coin-form.tsx";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { useCreateCoin } from "@/query/commands";
import { CreateCoinRequest } from "@/query/types";

interface CreateCoinDialogProps {
  size?: "default" | "sm";
}

const initialValues: CoinFormData = {
  value: "",
  currency: "",
  year: "",
  issuer: null as never,
  description: "",
  reverseImage: "",
  obverseImage: "",
  quantity: "1",
  saleValue: "",
  notes: "",
};

export function CreateCoinDialog({ size = "default" }: CreateCoinDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const createCoinMutation = useCreateCoin();

  const handleSubmit = async (values: CoinFormData) => {
    const createData: CreateCoinRequest = {
      value: parseFloat(values.value ?? "0"),
      currency: (values.currency ?? "").trim(),
      year: parseInt(values.year ?? "0", 10),
      issuer_id: values.issuer!.id,
      description: (values.description ?? "").trim() || undefined,
      obverse_image: values.obverseImage || undefined,
      reverse_image: values.reverseImage || undefined,
      quantity: parseInt(values.quantity ?? "0", 10),
      sale_value: values.saleValue ? parseFloat(values.saleValue) : undefined,
      notes: (values.notes ?? "").trim() || undefined,
    };

    createCoinMutation.mutate(createData, {
      onSuccess: (coin) => {
        toast.success(`${coin.title} added successfully!`, {
          position: "bottom-right",
        });
        setIsOpen(false);
      },
      onError: (error) => {
        const errorMessage = error?.message || "Failed to add coin";
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
              Add new coin
            </Button>
          ) : (
            <Button className="cursor-pointer p-0 gap-0" variant="outline">
              <Plus className="size-3" />
              <BadgeCent />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-4xl p-8 z-50"
          showCloseButton={false}
        >
          <DialogHeader className="hidden">
            <DialogTitle>Add coin to catalogue</DialogTitle>
            <DialogDescription>
              Add a new coin record to your collection catalogue.
            </DialogDescription>
          </DialogHeader>
          <CoinForm
            initialValues={initialValues}
            isOpen={isOpen}
            onSubmit={handleSubmit}
            submitLabel={
              createCoinMutation.isPending ? "Saving..." : "Save to catalogue"
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
