import {
  createRootRoute,
  createRoute,
  redirect,
  Router,
} from "@tanstack/react-router";

import App from "@/App";
import { CoinsView } from "@/pages/coins/views/coins-view";

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
const routeTree = rootRoute.addChildren([indexRoute, coinsRoute]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
