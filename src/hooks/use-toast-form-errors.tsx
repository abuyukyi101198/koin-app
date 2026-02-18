import { useRef } from "react";

import { FormikErrors, FormikTouched } from "formik";
import { CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";

export function useToastFormErrors<TValues>() {
  const activeErrorToastsRef = useRef<
    Map<string, { resolve: () => void; toastId: number | string }>
  >(new Map());

  return ({
    errors,
    touched,
    isOpen,
  }: {
    errors: FormikErrors<TValues>;
    touched: FormikTouched<TValues>;
    isOpen: boolean;
  }) => {
    if (isOpen) {
      // Handle error toasts with promises that resolve when errors clear
      Object.entries(errors).forEach(([key, errorMessage]) => {
        if (
          typeof errorMessage === "string" &&
          touched[key as keyof typeof touched]
        ) {
          const existingToast = activeErrorToastsRef.current.get(key);

          // If we don't have a toast for this field, create one
          if (!existingToast) {
            let resolveToast: (() => void) | null = null;

            const promise = new Promise<void>((resolve) => {
              resolveToast = resolve;
            });

            const toastId = toast.promise(promise, {
              loading: errorMessage,
              position: "top-center",
              icon: (
                <CircleAlertIcon className="size-4 text-destructive dark:text-foreground!" />
              ),
              className:
                "border-destructive! bg-red-100! dark:bg-red-950! text-destructive! dark:text-foreground! text-xs!",
            }) as number | string;

            if (resolveToast) {
              activeErrorToastsRef.current.set(key, {
                toastId,
                resolve: resolveToast,
              });
            }
          }
        }
      });

      // Resolve promises for fields that no longer have errors
      activeErrorToastsRef.current.forEach((toastData, key) => {
        const error = errors[key as keyof typeof errors];
        if (!error) {
          if (toastData.resolve) {
            toastData.resolve();
          }
          activeErrorToastsRef.current.delete(key);
        }
      });
    } else {
      activeErrorToastsRef.current.forEach((toastData) => {
        if (toastData.resolve) {
          toastData.resolve();
        }
      });
      activeErrorToastsRef.current.clear();
    }
  };
}
