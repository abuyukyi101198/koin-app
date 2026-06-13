import "@/styles/index.css";

import { CSSProperties, useEffect, useRef } from "react";

import { Link, useLocation } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { BookCopy, Coins, Flag, Github } from "lucide-react";

import { Logo } from "@/components/composite/logo.tsx";
import { Titlebar } from "@/components/composite/titlebar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useTheme } from "@/components/ui/theme-provider.tsx";
import { cn } from "@/lib/utils.ts";
import { CoinsView } from "@/pages/coins/views/coins-view";
import { IssuersView } from "@/pages/issuers/views/issuers-view.tsx";
import { NotebooksView } from "@/pages/notebooks/views/notebooks-view.tsx";
import { SettingsSidebarDialog } from "@/pages/settings/settings-sidebar-dialog.tsx";
import { useGetSettings } from "@/query/commands";

const menuButtonClass =
  "px-3 relative overflow-hidden text-xs text-muted-foreground cursor-pointer " +
  "hover:bg-muted! hover:text-primary! " +
  "data-[active=true]:bg-accent/50! data-[active=true]:text-primary! " +
  "before:absolute before:inset-y-0 before:left-0 before:w-0.75 " +
  "before:bg-transparent before:transition-colors data-[active=true]:before:bg-primary";

const VIEWS = [
  { path: "/coins", View: CoinsView },
  { path: "/notebooks", View: NotebooksView },
  { path: "/issuers", View: IssuersView },
] as const;

function App() {
  const { pathname } = useLocation();
  const { setTheme } = useTheme();
  const { data: settings, isSuccess, isError } = useGetSettings();
  const splashClosed = useRef(false);

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme_name, settings.theme_mode);
    }
  }, [settings, setTheme]);

  useEffect(() => {
    if ((isSuccess || isError) && !splashClosed.current) {
      splashClosed.current = true;
      // close_splashscreen shows the main window and closes the splash.
      // Silently ignored in browser / dev-without-Tauri environments.
      invoke("close_splashscreen").catch(() => {});
    }
  }, [isSuccess, isError]);

  return (
    <>
      <Titlebar />
      <SidebarProvider
        className="mt-12 h-[calc(100vh-3rem)]"
        style={
          {
            "--sidebar-width": "12rem",
          } as CSSProperties
        }
      >
        <Sidebar>
          <SidebarHeader className="flex items-center px-2 py-1">
            <Logo />
            <Separator />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={menuButtonClass}
                      isActive={pathname === "/coins"}
                      size="default"
                    >
                      <Link to="/coins">
                        <Coins />
                        Coins
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={menuButtonClass}
                      isActive={pathname === "/notebooks"}
                      size="default"
                    >
                      <Link to="/notebooks">
                        <BookCopy />
                        Notebooks
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={menuButtonClass}
                      isActive={pathname === "/issuers"}
                      size="default"
                    >
                      <Link to="/issuers">
                        <Flag />
                        Issuers
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Separator />
            <SidebarMenu className="flex flex-row justify-center gap-6">
              <SidebarMenuItem>
                <SettingsSidebarDialog />
              </SidebarMenuItem>
              <Separator orientation="vertical" />
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={menuButtonClass}
                  onClick={async () => {
                    await openUrl("https://github.com/abuyukyi101198/koin-app");
                  }}
                  size="default"
                >
                  <Github />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="relative h-full w-full">
          {VIEWS.map(({ path, View }) => (
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-150",
                pathname === path
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              )}
              key={path}
            >
              <View />
            </div>
          ))}
        </main>
      </SidebarProvider>
      <Toaster />
    </>
  );
}

export default App;
