import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center px-6">
        <span className="font-mono text-xs tracking-[0.2em] text-[hsl(var(--gold))] uppercase mb-4 block">
          404
        </span>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
          Page not found
        </h1>
        <p className="text-[hsl(var(--foreground-muted))] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center text-sm text-[hsl(var(--gold))] hover:text-foreground transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
