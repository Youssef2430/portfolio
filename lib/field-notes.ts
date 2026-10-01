import type { BlogPost } from "./blog-data";

export function noteIdentity(post: BlogPost) {
  if (post.slug === "stock-volatility")
    return {
      number: "01",
      category: "Math & markets",
      title: "When markets misbehave.",
      subtitle:
        "A stochastic processes project about one dangerous sentence: these two risks are independent.",
      takeaway:
        "Independence is a modelling choice, not a finding. It deletes covariance terms with a stroke of the pen, and zero correlation can still hide a perfect dependence.",
      kind: "markets" as const,
    };
  if (post.slug === "llm-evals-building-a-chess-benchmark")
    return {
      number: "02",
      category: "AI & experiments",
      title: "Can a language model play chess?",
      subtitle:
        "I built a benchmark to find out, then rebuilt it twice. The hardest part was never the chess.",
      takeaway:
        "Schemas, a parser that never guesses, honest retries, a sandbox and a journal took formatting forfeits from twelve to zero. The chess barely moved.",
      kind: "chess" as const,
    };
  return {
    number: "—",
    category: post.tags[0] ?? "Field notes",
    title: post.title,
    subtitle: post.excerpt,
    takeaway: post.excerpt,
    kind: "other" as const,
  };
}

/** Deterministic noise lets sliders compare the same paths at different parameters. */
export function simulateGBM(
  volatility: number,
  seed = 17,
  count = 8,
  days = 252,
) {
  let state = seed >>> 0;
  const uniform = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return (state + 1) / 4294967297;
  };
  return Array.from({ length: count }, () => {
    let price = 100;
    const path = [price];
    for (let day = 1; day <= days; day++) {
      const normal =
        Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform());
      price *= Math.exp(
        (0.12 - volatility ** 2 / 2) / 252 +
          (volatility / Math.sqrt(252)) * normal,
      );
      path.push(price);
    }
    return path;
  });
}

/**
 * `[^id]` references become margin notes. Definitions (`[^id]: text`) must sit
 * on one line; they are lifted out before the article is split into chapters.
 */
export function extractSidenotes(markdown: string) {
  const notes = new Map<string, string>();
  const body = markdown.replace(
    /^\[\^([\w-]+)\]:[ \t]+(.+)$\n?/gm,
    (_match, id: string, text: string) => {
      notes.set(id, text);
      return "";
    },
  );
  const order: string[] = [];
  const content = body.replace(/\[\^([\w-]+)\]/g, (match, id: string) => {
    if (!notes.has(id)) return match;
    if (!order.includes(id)) order.push(id);
    return `[${order.indexOf(id) + 1}](#sn-${id})`;
  });
  return { content, notes };
}

export type NoteChapter = { id: string; title: string; markdown: string };
export function splitNoteChapters(markdown: string): {
  intro: string;
  chapters: NoteChapter[];
} {
  const lines = markdown.replace(/^# .+\r?\n+/, "").split("\n");
  const intro: string[] = [];
  const chapters: NoteChapter[] = [];
  let fence: string | undefined;
  for (const line of lines) {
    const delimiter = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (delimiter) {
      if (!fence) fence = delimiter;
      else if (delimiter[0] === fence[0] && delimiter.length >= fence.length)
        fence = undefined;
    }
    if (!fence && /^## /.test(line)) {
      const title = line.slice(3).replace(/^Section \d+: /, "");
      const base =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "section";
      let id = base;
      for (let n = 2; chapters.some((c) => c.id === id); n++)
        id = `${base}-${n}`;
      chapters.push({ id, title, markdown: "" });
    } else if (chapters.length)
      chapters[chapters.length - 1].markdown += line + "\n";
    else intro.push(line);
  }
  return {
    intro: intro.join("\n").replace(/\n---\s*$/, ""),
    chapters: chapters.map((c) => ({
      ...c,
      markdown: c.markdown.replace(/\n---\s*$/, ""),
    })),
  };
}
