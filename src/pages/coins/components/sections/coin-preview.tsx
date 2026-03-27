import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { useGetCoin } from "@/query/commands";

interface CoinPreviewProps {
  coinId: number;
}

export function CoinPreview({ coinId }: CoinPreviewProps) {
  const { data, isLoading } = useGetCoin({ id: coinId });

  return (
    <section
      aria-busy={isLoading}
      aria-label="Coin preview images"
      className="flex flex-col h-full w-1/6 justify-center items-center overflow-hidden gap-6 border-r border-b p-6"
    >
      <CoinPreviewImages
        obverseImage={data?.obverse_image}
        reverseImage={data?.reverse_image}
        title={data?.title || ""}
      />
    </section>
  );
}
