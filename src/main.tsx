import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React, { StrictMode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { DeviceInspectorPage } from '@/pages/DeviceInspectorPage'
import { AgentSimulatorPage } from '@/pages/AgentSimulatorPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { FleetLogsPage } from '@/pages/FleetLogsPage'
import { AlertsPage } from '@/pages/AlertsPage'
import AgentSDKPage from '@/pages/AgentSDKPage'
import UserManualPage from '@/pages/UserManualPage'
import { RootLayout } from '@/components/layout/RootLayout';
declare global {
  interface Window {
    _reactRoot?: Root;
  }
}
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "discover",
        element: <DiscoverPage />,
      },
      {
        path: "sdk",
        element: <AgentSDKPage />,
      },
      {
        path: "device/:id",
        element: <DeviceInspectorPage />,
      },
      {
        path: "simulator",
        element: <AgentSimulatorPage />,
      },
      {
        path: "logs",
        element: <FleetLogsPage />,
      },
      {
        path: "alerts",
        element: <AlertsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "manual",
        element: <UserManualPage />,
      },
    ],
  },
]);
const container = document.getElementById('root');
if (container) {
  if (!window._reactRoot) {
    window._reactRoot = createRoot(container);
  }
  window._reactRoot.render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <StrictMode>
            <RouterProvider router={router} />
          </StrictMode>
          <Toaster position="top-right" richColors theme="dark" />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}