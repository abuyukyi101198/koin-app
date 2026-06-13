import { ImageProcessingMode } from "@/query/types/coins.ts";

export type ThemeName =
  | "dinar"
  | "franc"
  | "lira"
  | "mark"
  | "peso"
  | "quarter";

export type ThemeMode = "dark" | "light";

export type { ImageProcessingMode };

export interface Settings {
  image_processing_default: ImageProcessingMode;
  theme_name: ThemeName;
  theme_mode: ThemeMode;
  export_directory?: string;
}

export interface UpdateSettingsRequest {
  image_processing_default?: ImageProcessingMode;
  theme_name?: ThemeName;
  theme_mode?: ThemeMode;
  export_directory?: string;
}
