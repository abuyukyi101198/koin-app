import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Issuer } from "@/query/types";

interface IssuerFlagProps {
  className: HTMLElement["className"];
  name: Issuer["name"];
  flag: Issuer["flag"];
}

export function IssuerFlag({ className, name, flag }: IssuerFlagProps) {
  return (
    <img
      alt={`${name} flag`}
      className={cn("object-contain", className)}
      draggable={false}
      loading="lazy"
      src={flag?.length ? flag : undefined}
    />
  );
}

IssuerFlag.Skeleton = ({ className }: Pick<IssuerFlagProps, "className">) => {
  return <Skeleton className={className} />;
};
