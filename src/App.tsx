import "@/styles/index.css";

import { CSSProperties, useEffect } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
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
import { ThemeProvider, useTheme } from "@/components/ui/theme-provider.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { CoinSelectionProvider } from "@/context/coin-selection-context.tsx";
import { IssuerSelectionProvider } from "@/context/issuer-selection-context.tsx";
import { NotebookSelectionProvider } from "@/context/notebook-selection-context.tsx";
import { SettingsSidebarDialog } from "@/pages/settings/settings-sidebar-dialog.tsx";
import { useGetSettings } from "@/query/commands";

const queryClient = new QueryClient();

const menuButtonClass =
  "px-3 relative overflow-hidden text-xs text-muted-foreground cursor-pointer " +
  "hover:bg-muted! hover:text-primary! " +
  "data-[active=true]:bg-accent/50! data-[active=true]:text-primary! " +
  "before:absolute before:inset-y-0 before:left-0 before:w-0.75 " +
  "before:bg-transparent before:transition-colors data-[active=true]:before:bg-primary";

/** Reads the persisted theme from the DB and syncs it into the ThemeProvider. */
function SettingsSync() {
  const { setTheme } = useTheme();
  const { data: settings } = useGetSettings();

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme_name, settings.theme_mode);
    }
  }, [settings, setTheme]);

  return null;
}

function App() {
  const { pathname } = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsSync />
        <CoinSelectionProvider>
          <NotebookSelectionProvider>
            <IssuerSelectionProvider>
              <TooltipProvider>
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
                              await openUrl(
                                "https://github.com/abuyukyi101198/koin-app"
                              );
                            }}
                            size="default"
                          >
                            <Github />
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarFooter>
                  </Sidebar>
                  <main className="h-full w-full">
                    <Outlet />
                  </main>
                </SidebarProvider>
                <Toaster />
              </TooltipProvider>
            </IssuerSelectionProvider>
          </NotebookSelectionProvider>
        </CoinSelectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
