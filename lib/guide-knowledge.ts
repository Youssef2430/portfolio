import type { BlogPost } from "./blog-data";
import type { CitationSource } from "./citations";
import type { NoteChapter } from "./field-notes";
import type { PageBlock } from "./page-text";
import type { Degree, Role } from "./profile-data";
import type { ProjectDetail } from "./project-data";

/**
 * Everything the site guide knows: only what the site displays. Experience,
 * education and field notes come from the data and markdown the pages render;
 * the About section and the project case studies, whose copy lives in their
 * components, come from the text of the rendered pages.
 *
 * Pure: inputs come in as arguments (see `lib/site-knowledge.ts` for the
 * loader), so tests can build the real knowledge without a server.
 */

export type KnowledgeSource = CitationSource & { text: string };
export type Passage = { sourceId: string; text: string };

export type FieldNoteInput = {
  post: BlogPost;
  identity: { number: string; category: string; title: string; subtitle: string };
  /** Null when the markdown couldn't be read; the note is still listed. */
  parsed: { intro: string; chapters: NoteChapter[]; notes: Map<string, string> } | null;
};

export type KnowledgeInput = {
  roles: Role[];
  degrees: Degree[];
  projects: ProjectDetail[];
  notes: FieldNoteInput[];
  /**
   * Rendered pages by path (`/`, `/projects/<id>`), as `pageBlocks` reads them.
   * Without them, the About section and projects are known only by name; the
   * citation manifest doesn't need more.
   */
  pages?: ReadonlyMap<string, PageBlock[]>;
};

export type SiteKnowledge = {
  sources: KnowledgeSource[];
  passages: Passage[];
  index: SearchIndex;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthYear(date: Date) {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Joins lines, skipping missing ones; an empty string stays as a blank line. */
const lines = (...parts: (string | false | undefined)[]) =>
  parts.filter((part) => typeof part === "string").join("\n");

/** Plain text for the model: no experiment embeds, markup, or media. */
export function markdownToText(markdown: string, notes?: ReadonlyMap<string, string>) {
  return markdown
    .replace(/^:::.*:::\s*$/gm, "")
    .replace(/^\s*(`{3,}|~{3,}).*$/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[\d+\]\(#sn-([\w-]+)\)/g, (_match, id: string) =>
      notes?.has(id) ? ` (${notes.get(id)})` : "",
    )
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, "$1$2")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/^-{3,}\s*$/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Paragraph-aligned chunks, so a retrieved passage reads as a whole thought. */
export function chunkText(text: string, maxLength = 1100) {
  const pieces = text
    .split(/\n{2,}/)
    .flatMap((paragraph) =>
      paragraph.length <= maxLength ? [paragraph] : paragraph.split(/(?<=[.!?])\s+/),
    );
  const chunks: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length + 2 > maxLength) {
      chunks.push(current);
      current = piece;
    } else current = current ? `${current}\n\n${piece}` : piece;
  }
  if (current) chunks.push(current);
  return chunks;
}

export function buildKnowledge(input: KnowledgeInput): SiteKnowledge {
  const sources: KnowledgeSource[] = [];
  const passages: Passage[] = [];

  const home = input.pages?.get("/") ?? [];
  const about = home.find((block) => block.id === "about");
  const footer = home.find((block) => block.tag === "footer");
  sources.push({
    id: "about",
    kind: "profile",
    title: "About Youssef",
    href: "/#about",
    text: lines(about?.text, footer && `From the site footer:\n${footer.text}`),
  });

  for (const role of input.roles)
    sources.push({
      id: `experience/${role.id}`,
      kind: "experience",
      title: role.short,
      context: role.role,
      href: `/#xp-${role.id}`,
      text: lines(
        `${role.role} at ${role.company}, ${role.location}, ${role.period}.`,
        role.summary,
        `Headline result: ${role.metric.value} ${role.metric.label}.`,
        `Stack: ${role.stack.join(", ")}.`,
        ...role.groups.flatMap((group) => [
          group.name && `${group.name}:`,
          ...group.bullets.map((bullet) => `- ${markdownToText(bullet)}`),
        ]),
      ),
    });

  for (const degree of input.degrees)
    sources.push({
      id: `education/${degree.id}`,
      kind: "education",
      title: `${degree.short} ${degree.field}`,
      context: degree.institution,
      href: `/#education-${degree.id}`,
      text: lines(
        `${degree.title.join(" ")} (${degree.short}, ${degree.field}), ${degree.institution}, ${degree.period}. ${degree.status}.`,
        degree.thesis && `Thesis: ${degree.thesis}.`,
        degree.supervisor && `Supervisor: ${degree.supervisor}.`,
        degree.funding && `Funding: ${degree.funding.amount} ${degree.funding.label}.`,
        degree.coursework && `Selected coursework: ${degree.coursework.map((c) => c.name).join(", ")}.`,
      ),
    });

  for (const project of input.projects) {
    const id = `project/${project.id}`;
    const blocks = input.pages?.get(`/projects/${project.id}`)?.filter((block) => block.tag === "section") ?? [];
    const chapters = project.chapters ?? [];
    // The hero and any sections without a chapter of their own speak for the
    // whole case study.
    sources.push({
      id,
      kind: "project",
      title: project.title,
      context: project.category,
      href: `/projects/${project.id}`,
      projectId: project.id,
      text: lines(
        `${project.title} case study.`,
        ...blocks.filter((block) => !chapters.some((chapter) => chapter.id === block.id)).map((block) => block.text),
      ),
    });
    for (const chapter of chapters)
      sources.push({
        id: `${id}#${chapter.id}`,
        kind: "project",
        title: chapter.label,
        context: project.title,
        href: `/projects/${project.id}#${chapter.id}`,
        projectId: project.id,
        parent: id,
        text: blocks.find((block) => block.id === chapter.id)?.text ?? "",
      });
  }

  for (const { post, identity, parsed } of input.notes) {
    const id = `note/${post.slug}`;
    const href = `/blog/${post.slug}`;
    sources.push({
      id,
      kind: "note",
      title: identity.title,
      context: `Field note ${identity.number}`,
      href,
      text: lines(
        `Field note ${identity.number} (${identity.category}), “${identity.title}”, published ${monthYear(new Date(post.date))}${post.updated ? `, updated ${monthYear(new Date(post.updated))}` : ""}. Also titled “${post.title}”. Reading time: ${post.readingTimeMinutes} minutes.`,
        identity.subtitle,
        `Tags: ${post.tags.join(", ")}.`,
      ),
    });
    if (!parsed) continue;
    for (const chunk of chunkText(markdownToText(parsed.intro, parsed.notes)))
      passages.push({ sourceId: id, text: `${identity.title}\n${chunk}` });
    for (const chapter of parsed.chapters) {
      const chapterId = `${id}#${chapter.id}`;
      sources.push({
        id: chapterId,
        kind: "note",
        title: chapter.title,
        context: identity.title,
        href: `${href}#${chapter.id}`,
        parent: id,
        text: "",
      });
      for (const chunk of chunkText(markdownToText(chapter.markdown, parsed.notes)))
        passages.push({ sourceId: chapterId, text: `${identity.title} / ${chapter.title}\n${chunk}` });
    }
  }

  return { sources, passages, index: indexPassages(passages) };
}

// ---------------------------------------------------------------------------
// Retrieval: BM25 over field note passages. Everything else, project pages
// included, is small enough to send with every question.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(
  "a about after all also an and any are as at be been but by can could did do does for from had has have he her his how i if in into is it its just me more my of on or our out she so than that the their them then there these they this to up was we were what when where which who why will with would you your tell show youssef chouay".split(
    " ",
  ),
);

function stem(term: string) {
  if (term.length > 4 && term.endsWith("ies")) return `${term.slice(0, -3)}y`;
  if (term.length > 3 && term.endsWith("s") && !term.endsWith("ss")) return term.slice(0, -1);
  return term;
}

export function tokenize(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .match(/[a-z0-9]+/g) ?? []
  )
    .filter((term) => term.length > 1 && !STOPWORDS.has(term))
    .map(stem);
}

export type SearchIndex = {
  docs: { terms: Map<string, number>; length: number }[];
  df: Map<string, number>;
  avgLength: number;
};

export function indexPassages(passages: Passage[]): SearchIndex {
  const df = new Map<string, number>();
  const docs = passages.map(({ text }) => {
    const tokens = tokenize(text);
    const terms = new Map<string, number>();
    for (const token of tokens) terms.set(token, (terms.get(token) ?? 0) + 1);
    for (const term of terms.keys()) df.set(term, (df.get(term) ?? 0) + 1);
    return { terms, length: tokens.length };
  });
  const avgLength = docs.reduce((sum, doc) => sum + doc.length, 0) / Math.max(1, docs.length);
  return { docs, df, avgLength };
}

/**
 * The best passages for a question, or none when nothing matches on more than
 * common words (a greeting shouldn't drag an article excerpt along).
 */
export function searchPassages(
  knowledge: Pick<SiteKnowledge, "passages" | "index">,
  query: string,
  { limit = 3, minScore = 2.5, minShare = 0.3 } = {},
) {
  const { docs, df, avgLength } = knowledge.index;
  const terms = [...new Set(tokenize(query))];
  const k1 = 1.2;
  const b = 0.75;
  const scored = docs
    .map((doc, i) => {
      let score = 0;
      for (const term of terms) {
        const tf = doc.terms.get(term);
        if (!tf) continue;
        const n = df.get(term) ?? 0;
        const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
        score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * doc.length) / avgLength));
      }
      return { passage: knowledge.passages[i], score };
    })
    .filter(({ score }) => score > 0)
    .sort((x, y) => y.score - x.score);
  const top = scored[0]?.score ?? 0;
  if (top < minScore) return [];
  return scored
    .filter(({ score }) => score >= top * minShare)
    .slice(0, limit)
    .map(({ passage }) => passage);
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

export function buildGuidePrompt(
  knowledge: SiteKnowledge,
  {
    query,
    today,
    continuing = [],
  }: {
    query: string;
    today: Date;
    /** Sources the previous answer cited; a follow-up gets those chapters in full. */
    continuing?: string[];
  },
) {
  const followed = continuing
    .filter((id) => knowledge.passages.some((passage) => passage.sourceId === id))
    .slice(0, 2);
  const searched = searchPassages(knowledge, query);
  const passages = [
    ...knowledge.passages.filter((passage) => followed.includes(passage.sourceId)),
    ...searched.filter((passage) => !followed.includes(passage.sourceId)),
  ];
  // Neighbouring chunks of one chapter read better as one excerpt.
  const excerpts = new Map<string, string>();
  for (const passage of passages) {
    const previous = excerpts.get(passage.sourceId);
    excerpts.set(
      passage.sourceId,
      previous ? `${previous}\n\n${passage.text.slice(passage.text.indexOf("\n") + 1)}` : passage.text,
    );
  }
  const label: Record<KnowledgeSource["kind"], string> = {
    profile: "Profile",
    experience: "Experience",
    education: "Education",
    project: "Project",
    note: "Field note",
  };
  const sources = knowledge.sources
    .filter((source) => !source.parent)
    .map((source) => {
      const sections = knowledge.sources.filter((section) => section.parent === source.id);
      const read = sections.filter((section) => section.text);
      const named = sections.filter((section) => !section.text);
      return lines(
        `<source id="${source.id}" type="${label[source.kind]}">`,
        source.text,
        ...read.map((section) => lines(`<section id="${section.id}" title="${section.title}">`, section.text, "</section>")),
        named.length > 0 &&
          `${read.length > 0 ? "Other sections" : "Sections"} on this page, linkable by id: ${named.map((section) => `${section.id} (“${section.title}”)`).join("; ")}.`,
        "</source>",
      );
    });

  const prompt = lines(
    "You are Youssef’s AI, the guide on Youssef Chouay’s portfolio site. Visitors ask you about Youssef and his work.",
    "",
    "How to answer:",
    "- Use only the sources below and the conversation. If they don’t cover something, say you don’t have that information.",
    "- Keep answers SHORT and direct: two or three sentences for simple questions. Avoid bullet points and long lists unless asked.",
    `- Today is ${monthYear(today)}. Roles marked “Present” are current.`,
    "",
    "How to link to the site:",
    "- Every source has an id. When a sentence relies on a source, turn the words that name it (a company, degree, project, section or article) into a markdown link to cite: followed by the id, like [TrendAI](cite:experience/trend) or [the engineering section](cite:project/glui#architecture).",
    "- Copy ids exactly as written below. Never invent an id, and never write a path or URL on this site yourself.",
    "- Each link must point to where the claim in its sentence comes from: the source, section or excerpt you read it in. Sections listed only by name tell you where things are, not what they say, so link one of those only when you have an excerpt with its id or someone asks where to find something. Don’t add links as further reading.",
    "- Link each source at most once per answer. Greetings and small talk need no links.",
    "- Visitors click these links to go there: a project id opens its case study, and an id containing # jumps to that section. When someone asks to see or open something, give them the link.",
    "- Outside websites named in a source, such as a live product, can be linked normally.",
    "",
    "<sources>",
    ...sources,
    "</sources>",
    excerpts.size > 0 && "",
    excerpts.size > 0 &&
      "<passages>\nThese excerpts from Youssef’s field notes look relevant to the question. Cite them with the id on each one.",
    ...[...excerpts].map(([id, text]) => `<passage id="${id}">\n${text}\n</passage>`),
    excerpts.size > 0 && "</passages>",
  );

  return { prompt, passageIds: [...excerpts.keys()] };
}

/** What the chat needs to render citations: everything except the text. */
export function citationSources(knowledge: SiteKnowledge): CitationSource[] {
  return knowledge.sources.map(({ id, kind, title, context, href, projectId, parent }) => ({
    id,
    kind,
    title,
    context,
    href,
    projectId,
    parent,
  }));
}
