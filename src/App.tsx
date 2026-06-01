import "@/styles/index.css";

import { CSSProperties } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { openUrl } from "@tauri-apps/plugin-opener";
import { BookCopy, Coins, Github, Settings } from "lucide-react";

import { Titlebar } from "@/components/composite/titlebar.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { CoinSelectionProvider } from "@/context/coin-selection-context.tsx";
import { NotebookSelectionProvider } from "@/context/notebook-selection-context.tsx";

const queryClient = new QueryClient();

function App() {
  const { pathname } = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <CoinSelectionProvider>
          <NotebookSelectionProvider>
            <TooltipProvider>
              <Titlebar />
              <SidebarProvider
                className="mt-12 h-[calc(100vh-3rem)]"
                style={
                  {
                    "--sidebar-width": "3rem",
                  } as CSSProperties
                }
              >
                <Sidebar>
                  <SidebarContent>
                    <SidebarGroup>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              className="text-muted-foreground hover:text-base cursor-pointer"
                              isActive={pathname === "/coins"}
                              size="default"
                            >
                              <Link to="/coins">
                                <Coins />
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              className="text-muted-foreground hover:text-base cursor-pointer"
                              isActive={pathname === "/new-notebooks"}
                              size="default"
                            >
                              <Link to="/new-notebooks">
                                <BookCopy />
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              className="text-muted-foreground hover:text-base cursor-pointer"
                              isActive={pathname === "/notebooks"}
                              size="default"
                            >
                              <Link to="/notebooks">
                                <BookCopy />
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </SidebarContent>
                  <SidebarFooter>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              className="text-muted-foreground hover:text-base cursor-pointer"
                              isActive={pathname === "/settings"}
                              size="default"
                            >
                              <Link to="/settings">
                                <Settings />
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            Settings
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              className="text-muted-foreground hover:text-base cursor-pointer"
                              onClick={async () => {
                                await openUrl(
                                  "https://github.com/abuyukyi101198/koin-app"
                                );
                              }}
                              size="default"
                            >
                              <Github />
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            GitHub
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarFooter>
                </Sidebar>
                <main className="h-full w-full overflow-hidden">
                  <Outlet />
                </main>
              </SidebarProvider>
              <Toaster />
            </TooltipProvider>
          </NotebookSelectionProvider>
        </CoinSelectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
