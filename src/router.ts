import {
  createRootRoute,
  createRoute,
  redirect,
  Router,
} from "@tanstack/react-router";

import App from "@/App";
import { CoinsView } from "@/pages/coins/views/coins-view";
import { IssuersView } from "@/pages/issuers/views/issuers-view.tsx";
import { NotebooksView } from "@/pages/notebooks/views/notebooks-view.tsx";

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

// Notebooks route
const notebooksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notebooks",
  component: NotebooksView,
});

// Issuers route
const issuersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/issuers",
  component: IssuersView,
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
  issuersRoute,
]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
