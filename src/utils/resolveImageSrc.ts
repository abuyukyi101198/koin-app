import { convertFileSrc } from "@tauri-apps/api/core";

export function resolveImageSrc(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("http")) return value;
  return convertFileSrc(value);
}
