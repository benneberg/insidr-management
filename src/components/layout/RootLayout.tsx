import React from "react";
import { Outlet } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
/**
 * RootLayout component separated to satisfy React Fast Refresh constraints.
 * It provides the persistent AppLayout wrapper for all nested routes.
 */
export const RootLayout = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};