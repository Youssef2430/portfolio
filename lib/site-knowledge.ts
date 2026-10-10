import { getAllPosts } from "./blog-data";
import { getPostContent } from "./blog-content";
import { noteIdentity, parseFieldNote } from "./field-notes";
import { buildKnowledge, citationSources, type FieldNoteInput, type SiteKnowledge } from "./guide-knowledge";
import { pageBlocks, type PageBlock } from "./page-text";
import { degrees, roles } from "./profile-data";
import { projects } from "./project-data";
import { SITE_URL } from "./seo";

/**
 * Server-only. Loads the site guide's knowledge once per server instance from
 * what the site displays: the data and markdown the pages render, plus the
 * rendered About section and project case studies.
 */

const PAGE_TIMEOUT_MS = 15_000;
// A page that couldn't be read is retried this much later, not on every question.
const RETRY_MS = 60_000;

let notes: Promise<FieldNoteInput[]> | undefined;

function loadNotes() {
  notes ??= Promise.all(
    getAllPosts().map(async (post) => {
      // getPostContent falls back to a placeholder rather than throwing; a
      // placeholder isn't worth indexing.
      const content = await getPostContent(post);
      const missing = content === `# ${post.title}\n\nContent not available.`;
      return { post, identity: noteIdentity(post), parsed: missing ? null : parseFieldNote(content) };
    }),
  ).catch((error) => {
    notes = undefined;
    throw error;
  });
  return notes;
}

/**
 * Where to read the rendered pages: a local server reads itself; anywhere
 * else reads the public site, so a forged Host header can't choose the source.
 */
export function pagesOrigin(requestUrl: string) {
  const { hostname, origin } = new URL(requestUrl);
  return hostname === "localhost" || hostname === "127.0.0.1" ? origin : SITE_URL;
}

async function readPages(origin: string) {
  const paths = ["/", ...projects.map((project) => `/projects/${project.id}`)];
  const pages = new Map<string, PageBlock[]>();
  const missing: string[] = [];
  await Promise.all(
    paths.map(async (path) => {
      try {
        const response = await fetch(new URL(path, origin), {
          cache: "no-store",
          signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        pages.set(path, pageBlocks(await response.text()));
      } catch (error) {
        console.error(`Site guide: couldn't read ${new URL(path, origin)}`, error);
        missing.push(path);
      }
    }),
  );
  return { pages, missing };
}

let loaded: { origin: string; at: number; result: Promise<{ knowledge: SiteKnowledge; missing: string[] }> } | undefined;

export async function getSiteKnowledge(origin: string) {
  if (!loaded || loaded.origin !== origin) {
    const result = Promise.all([loadNotes(), readPages(origin)]).then(([notes, { pages, missing }]) => ({
      knowledge: buildKnowledge({ roles, degrees, projects, notes, pages }),
      missing,
    }));
    loaded = { origin, at: Date.now(), result };
  }
  const current = loaded;
  try {
    const { knowledge, missing } = await current.result;
    if (missing.length > 0 && loaded === current && Date.now() - current.at > RETRY_MS) loaded = undefined;
    return knowledge;
  } catch (error) {
    if (loaded === current) loaded = undefined;
    throw error;
  }
}

/** The client's citation manifest. Built from data alone, so it's ready at build time. */
export async function getCitationSources() {
  return citationSources(buildKnowledge({ roles, degrees, projects, notes: await loadNotes() }));
}
