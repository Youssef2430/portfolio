"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center px-6">
        <span className="font-mono text-xs tracking-[0.2em] text-[hsl(var(--gold))] uppercase mb-4 block">
          Error
        </span>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
          Something went wrong
        </h1>
        <p className="text-[hsl(var(--foreground-muted))] mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center text-sm text-[hsl(var(--gold))] hover:text-foreground transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
