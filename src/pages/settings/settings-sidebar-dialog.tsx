import { useEffect, useState } from "react";

import { Folder, Moon, Settings, Sun } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { SidebarMenuButton } from "@/components/ui/sidebar.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { useTheme } from "@/components/ui/theme-provider.tsx";
import { cn } from "@/lib/utils.ts";
import { useGetSettings, useUpdateSettings } from "@/query/commands";
import {
  ImageProcessingMode,
  ThemeMode,
  ThemeName,
} from "@/query/types/settings.ts";

const THEME_NAMES: { value: ThemeName; label: string }[] = [
  { value: "lira", label: "Lira" },
  { value: "quarter", label: "Quarter" },
  { value: "mark", label: "Mark" },
  { value: "peso", label: "Peso" },
  { value: "franc", label: "Franc" },
  { value: "dinar", label: "Dinar" },
];

const IMAGE_PROCESSING_OPTIONS: {
  value: ImageProcessingMode;
  label: string;
  description: string;
}[] = [
  {
    value: "none",
    label: "None",
    description: "Keep the remote URL as-is, no file is saved locally.",
  },
  {
    value: "download",
    label: "Download",
    description: "Download and save images locally as JPEG files.",
  },
  {
    value: "download_and_remove_bg",
    label: "Process",
    description: "Download images and remove their backgrounds.",
  },
];

export function SettingsSidebarDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: settings } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const { setTheme } = useTheme();

  const [themeName, setThemeNameState] = useState<ThemeName>("lira");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [imageProcessing, setImageProcessingState] =
    useState<ImageProcessingMode>("none");
  const [exportDirectory, setExportDirectoryState] = useState<string>("");

  useEffect(() => {
    if (settings) {
      setThemeNameState(settings.theme_name);
      setThemeModeState(settings.theme_mode);
      setImageProcessingState(settings.image_processing_default);
      setExportDirectoryState(settings.export_directory || "");
    }
  }, [settings]);

  function handleThemeName(name: ThemeName) {
    setThemeNameState(name);
    setTheme(name, themeMode);
    updateSettings.mutate(
      { theme_name: name },
      {
        onError: () =>
          toast.error("Failed to save theme", { position: "bottom-right" }),
      }
    );
  }

  function handleThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    setTheme(themeName, mode);
    updateSettings.mutate(
      { theme_mode: mode },
      {
        onError: () =>
          toast.error("Failed to save theme mode", {
            position: "bottom-right",
          }),
      }
    );
  }

  function handleImageProcessing(mode: ImageProcessingMode) {
    setImageProcessingState(mode);
    updateSettings.mutate(
      { image_processing_default: mode },
      {
        onError: () =>
          toast.error("Failed to save image setting", {
            position: "bottom-right",
          }),
      }
    );
  }

  function handleExportDirectoryChange(dir: string) {
    setExportDirectoryState(dir);
    updateSettings.mutate(
      { export_directory: dir },
      {
        onError: () =>
          toast.error("Failed to save export directory", {
            position: "bottom-right",
          }),
      }
    );
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton className="px-3 relative overflow-hidden text-xs text-muted-foreground cursor-pointer hover:bg-muted! hover:text-primary! data-[active=true]:bg-accent/50! data-[active=true]:text-primary! before:absolute before:inset-y-0 before:left-0 before:w-0.75 before:bg-transparent before:transition-colors data-[active=true]:before:bg-primary">
          <Settings />
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w p-8 z-50" showCloseButton={false}>
        <DialogHeader className="hidden">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Modify your Koin settings. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="mt-2">
          {/* Theme */}
          <FieldSet className="gap-2">
            <FieldLegend
              className="flex w-full justify-between items-baseline gap-2 font-serif text-lg!"
              variant="label"
            >
              Theme
              <div className="flex items-center gap-1 font-normal">
                <Sun className="size-3 text-muted-foreground" />
                <Switch
                  checked={themeMode === "dark"}
                  className="hover:cursor-pointer"
                  onCheckedChange={(checked) => {
                    handleThemeMode(checked ? "dark" : "light");
                  }}
                  size="sm"
                />
                <Moon className="size-3 text-muted-foreground" />
              </div>
            </FieldLegend>
            <FieldDescription>
              UI theme of your desktop application.
            </FieldDescription>
            <Field orientation="vertical">
              <RadioGroup
                className="pt-1 grid grid-cols-3 gap-x-1.5 gap-y-1.5"
                onValueChange={(v) => {
                  handleThemeName(v as ThemeName);
                }}
                value={themeName}
              >
                {THEME_NAMES.map(({ value, label }) => (
                  <label
                    className={cn(
                      "p-3 pt-4 flex flex-col items-center gap-2.5 border rounded hover:cursor-pointer hover:bg-muted",
                      themeName === value && "border-primary"
                    )}
                    key={value}
                  >
                    <RadioGroupItem
                      className={cn(
                        "size-6 border-2 border-transparent transition-all [&_svg]:fill-background! hover:cursor-pointer",
                        themeName === value &&
                          "ring-2 ring-ring ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: `var(--theme-${value})` }}
                      value={value}
                    />
                    <span
                      className={cn(
                        "text-xs transition-colors",
                        themeName === value
                          ? "font-semibold text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </Field>
          </FieldSet>

          {/* Images */}
          <FieldSet>
            <Field>
              <FieldLegend className="mb-0 font-serif text-lg!" variant="label">
                Image processing
              </FieldLegend>
              <FieldDescription>
                Default image download behavior.
              </FieldDescription>
              <Select
                onValueChange={(v) => {
                  handleImageProcessing(v as ImageProcessingMode);
                }}
                value={imageProcessing}
              >
                <SelectTrigger className="h-16! w-1/2 hover:cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_PROCESSING_OPTIONS.map(
                    ({ value, label, description }) => (
                      <SelectItem
                        className="hover:cursor-pointer"
                        key={value}
                        value={value}
                      >
                        <div className="flex flex-col items-start gap-0.5 py-0.5">
                          <span className="text-sm font-medium leading-snug">
                            {label}
                          </span>
                          <span className="text-muted-foreground text-xs text-wrap text-left leading-normal font-normal">
                            {description}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </Field>
          </FieldSet>

          {/* Export Directory */}
          <FieldSet>
            <Field>
              <FieldLegend className="mb-0 font-serif text-lg!" variant="label">
                Export directory
              </FieldLegend>
              <FieldDescription>
                Default location for exported files.
              </FieldDescription>
              <InputGroup className="w-1/2">
                <InputGroupAddon align="inline-start">
                  <Folder className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  onChange={(e) => {
                    handleExportDirectoryChange(e.target.value);
                  }}
                  placeholder="path/to/directory"
                  type="text"
                  value={exportDirectory}
                />
              </InputGroup>
            </Field>
          </FieldSet>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
