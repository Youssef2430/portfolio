/**
 * The site guide cites the site itself. It writes ordinary markdown links whose
 * target is `cite:<source id>`, e.g. `[TrendAI](cite:experience/trend)`, and
 * the chat turns each one into a link to that part of the site.
 *
 * Client-safe: no server imports.
 */

export type CitationKind = "profile" | "experience" | "education" | "project" | "note";

export type CitationSource = {
  /** Stable id the model cites, e.g. `project/glui#architecture`. */
  id: string;
  kind: CitationKind;
  title: string;
  /** What the title belongs to, e.g. the project a case study section is in. */
  context?: string;
  /** Where the source lives on the site, including the section anchor. */
  href: string;
  /** Projects with a signature transition open through it. */
  projectId?: string;
  /** Set on sections, pointing at the page-level source. */
  parent?: string;
};

export const CITE_SCHEME = "cite:";

export function citationLabel(source: CitationSource) {
  if (source.kind === "project") return source.parent ? "Case study" : "Project";
  return {
    profile: "Profile",
    experience: "Experience",
    education: "Education",
    note: "Field note",
  }[source.kind];
}

/** Forgive a space after the scheme, which would otherwise break the link. */
export function normalizeCitations(markdown: string) {
  return markdown.replace(/\]\(\s*cite:\s*/g, `](${CITE_SCHEME}`);
}

/** Cited ids in order of first appearance. */
export function citedIds(markdown: string) {
  const ids: string[] = [];
  for (const [, id] of normalizeCitations(markdown).matchAll(/\]\(cite:([^)\s]+)\)/g))
    if (!ids.includes(id)) ids.push(id);
  return ids;
}

/**
 * While an answer streams, a link arrives a few characters at a time. Show an
 * unfinished link at the very end as its label instead of raw brackets.
 */
export function settleStreamingMarkdown(markdown: string) {
  return markdown.replace(/\[([^\]\n]*)(?:\](?:\([^)\s]*)?)?$/, "$1");
}
