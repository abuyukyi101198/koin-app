import {
  createRootRoute,
  createRoute,
  redirect,
  Router,
} from "@tanstack/react-router";

import App from "@/App";
import { CoinsView } from "@/pages/coins/views/coins-view";
import { CoinsView as NewCoinsView } from "@/pages/new_coins/views/coins-view.tsx";
import { NotebooksView } from "@/pages/notebooks/views/notebooks-view.tsx";
import { SettingsView } from "@/pages/settings/views/settings-view.tsx";

// Root route
const rootRoute = createRootRoute({
  component: App,
});

// Coins route
const coinsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/coins",
  component: CoinsView,
});

const newCoinsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new-coins",
  component: NewCoinsView,
});

// Notebooks route
const notebooksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notebooks",
  component: NotebooksView,
});

// settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsView,
});

// Index route - redirect to /coins
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    throw redirect({ to: "/coins" });
  },
  component: () => null,
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  coinsRoute,
  notebooksRoute,
  settingsRoute,
  newCoinsRoute,
]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
