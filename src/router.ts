import {
  createRootRoute,
  createRoute,
  redirect,
  Router,
} from "@tanstack/react-router";

import App from "@/App";

// Root route
const rootRoute = createRootRoute({
  component: App,
});

// Coins route
const coinsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/coins",
});

// Notebooks route
const notebooksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notebooks",
});

// Issuers route
const issuersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/issuers",
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
