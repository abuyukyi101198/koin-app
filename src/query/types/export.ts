export type ExportFormat = "csv" | "image" | "json";

export interface ExportCoinsRequest {
  format: ExportFormat;
}

export interface ExportResponse {
  success: boolean;
  message: string;
  filePath?: string;
}


