"use client";

import React, { useEffect, useState } from "react";

export type ClientOnlyProps = {
  children: React.ReactNode;
  /**
   * Optional content to render on the server (and before hydration) to prevent layout shift.
   * Defaults to null (renders nothing until mounted).
   */
  fallback?: React.ReactNode | null;
};

/**
 * Renders children only after the component has mounted on the client.
 * Useful to avoid hydration mismatches for UI that depends on browser APIs or client-only state.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default ClientOnly;
