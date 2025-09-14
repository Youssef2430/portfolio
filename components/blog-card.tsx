"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatPostDate } from "@/lib/blog-data";

type BlogCardProps = {
  slug: string;
  title: string;
  date: string; // ISO string
  excerpt: string;
  coverImage?: string | null;
  tags?: string[];
  readingTimeMinutes?: number;
  className?: string;
};

export function BlogCard({
  slug,
  title,
  date,
  excerpt,
  coverImage,
  tags = [],
  readingTimeMinutes,
  className,
}: BlogCardProps) {
  const imageSrc = coverImage || "/placeholder.svg";
  const visibleTags = tags.slice(0, 3);
  const hiddenTagsCount = Math.max(0, tags.length - visibleTags.length);

  return (
    <Card
      className={cn(
        "group overflow-hidden glass-card text-card-foreground transition duration-200 rounded-xl pt-3 px-3",
        className,
      )}
    >
      {/* Cover */}
      <Link href={`/blog/${slug}`} aria-label={`Read "${title}"`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        </div>
      </Link>

      {/* Content */}
      <CardHeader className="space-y-2 p-0 pt-3">
        <Link
          href={`/blog/${slug}`}
          className="block focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 rounded-sm"
          aria-label={`Read "${title}"`}
        >
          <CardTitle className="text-lg font-bold text-neutral-600 dark:text-neutral-200 tracking-tight leading-snug line-clamp-2">
            {title}
          </CardTitle>
        </Link>
        <CardDescription className="text-xs text-neutral-600 dark:text-neutral-300">
          {formatPostDate(date)}{" "}
          {typeof readingTimeMinutes === "number" && readingTimeMinutes > 0 ? (
            <>• {readingTimeMinutes} min read</>
          ) : null}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 px-0">
        <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3">
          {excerpt}
        </p>

        {visibleTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {visibleTags.map((t) => (
              <span
                key={t}
                className="inline-block rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs text-neutral-700 dark:text-neutral-300"
              >
                #{t}
              </span>
            ))}
            {hiddenTagsCount > 0 && (
              <span className="inline-block rounded bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                +{hiddenTagsCount} more
              </span>
            )}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="pt-0 px-0 pb-4">
        <Link
          href={`/blog/${slug}`}
          className="text-xs text-neutral-600 dark:text-neutral-200 underline underline-offset-4 hover:no-underline transition duration-200"
          aria-label={`Read "${title}"`}
        >
          Read more →
        </Link>
      </CardFooter>
    </Card>
  );
}

export function BlogCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "overflow-hidden glass-card text-card-foreground rounded-xl pt-3 px-3",
        className,
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-lg">
        <div className="h-full w-full animate-pulse bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <CardHeader className="space-y-3 p-0 pt-3">
        <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </CardHeader>

      <CardContent className="space-y-2 pt-0 px-0">
        <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-5 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-5 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </CardContent>

      <CardFooter className="pt-0 px-0 pb-4">
        <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </CardFooter>
    </Card>
  );
}
