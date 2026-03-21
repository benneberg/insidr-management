import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
import { AppLayout } from '@/components/layout/AppLayout'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout><HomePage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/discover",
    element: <AppLayout><DiscoverPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/sdk",
    element: <AppLayout><AgentSDKPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/device/:id",
    element: <AppLayout><DeviceInspectorPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/simulator",
    element: <AppLayout><AgentSimulatorPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/logs",
    element: <AppLayout><FleetLogsPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/alerts",
    element: <AppLayout><AlertsPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <AppLayout><SettingsPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors theme="dark" />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
)