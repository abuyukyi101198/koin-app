import "@/styles/index.css";
import { CSSProperties } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { Link, Outlet } from "@tanstack/react-router";
import { openUrl } from "@tauri-apps/plugin-opener";
import { BookCopy, Coins, Github } from "lucide-react";

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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <SidebarProvider
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              className="text-muted-foreground hover:text-base cursor-pointer"
                              size="default"
                            >
                              <Link to="/coins">
                                <Coins />
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            Coins
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              className="text-muted-foreground hover:text-base cursor-pointer"
                              size="default"
                            >
                              <Link to="/notebooks">
                                <BookCopy />
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            Notebooks
                          </TooltipContent>
                        </Tooltip>
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
            <main className="h-screen w-screen">
              <Outlet />
            </main>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
