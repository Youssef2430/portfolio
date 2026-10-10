/**
 * The visible text of a rendered page, for the site guide: one block per
 * top-level <section> or <footer>, in page order.
 *
 * Leaves out scripts, icons, controls, navigation, and anything hidden from
 * readers (aria-hidden, hidden, sr-only) or marked `data-guide-skip`, such as
 * a mock interface. Links to other sites keep their URL so the guide can
 * share them.
 */

export type PageBlock = { tag: "section" | "footer"; id?: string; text: string };

const VOID = new Set("area base br col embed hr img input link meta param source track wbr".split(" "));
const SKIP = new Set("script style svg noscript template button nav header select textarea".split(" "));
const BLOCK = new Set(
  "address article aside blockquote br dd div dl dt figcaption figure footer h1 h2 h3 h4 h5 h6 li main ol p pre section small table td th tr ul".split(" "),
);
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

const decode = (text: string) =>
  text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    if (name[0] !== "#") return ENTITIES[name.toLowerCase()] ?? entity;
    return String.fromCodePoint(name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
  });

function attributes(source: string) {
  const attrs = new Map<string, string>();
  for (const [, name, ...values] of source.matchAll(/([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g))
    attrs.set(name.toLowerCase(), decode(values.find((value) => value !== undefined) ?? ""));
  return attrs;
}

function tidy(text: string) {
  return text
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/ ([.,;:!?’”)\]])(?=\s|$)/g, "$1")
    .replace(/([(\[“]) /g, "$1")
    .trim();
}

export function pageBlocks(html: string): PageBlock[] {
  const blocks: PageBlock[] = [];
  const stack: { tag: string; href?: string; start: number }[] = [];
  let block: (PageBlock & { depth: number }) | undefined;
  // Depth of the element whose subtree is being skipped; 0 when reading.
  let skipping = 0;
  const tokens = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/gi;

  for (const [, closing, name, rawAttrs = "", text] of html.matchAll(tokens)) {
    if (text !== undefined) {
      if (block && !skipping) block.text += decode(text);
      continue;
    }
    if (!name) continue;
    const tag = name.toLowerCase();

    if (closing) {
      const at = stack.findLastIndex((open) => open.tag === tag);
      if (at === -1) continue;
      const open = stack[at];
      stack.length = at;
      if (block && !skipping && open.href) {
        const label = block.text.slice(open.start).trim();
        const bare = open.href.replace(/^(https?:\/\/|mailto:)/, "").replace(/\/$/, "");
        if (label && label !== open.href && label !== bare) block.text += ` (${open.href})`;
      }
      if (skipping > stack.length) skipping = 0;
      if (block && !skipping) block.text += BLOCK.has(tag) ? "\n" : " ";
      if (block && block.depth > stack.length) {
        blocks.push({ tag: block.tag, id: block.id, text: tidy(block.text) });
        block = undefined;
      }
      continue;
    }

    const selfClosing = VOID.has(tag) || rawAttrs.trimEnd().endsWith("/");
    if (selfClosing) {
      if (block && !skipping && BLOCK.has(tag)) block.text += "\n";
      continue;
    }

    const attrs = attributes(rawAttrs);
    const href = attrs.get("href");
    stack.push({
      tag,
      href: tag === "a" && href && /^(https?:|mailto:)/.test(href) ? href : undefined,
      start: block?.text.length ?? 0,
    });
    if (
      !skipping &&
      (SKIP.has(tag) ||
        attrs.has("hidden") ||
        attrs.has("data-guide-skip") ||
        attrs.get("aria-hidden") === "true" ||
        (attrs.get("class") ?? "").split(/\s+/).includes("sr-only"))
    )
      skipping = stack.length;
    if (!block && !skipping && (tag === "section" || tag === "footer"))
      block = { tag, id: attrs.get("id"), text: "", depth: stack.length };
    else if (block && !skipping) block.text += BLOCK.has(tag) ? "\n" : " ";
  }
  return blocks;
}
