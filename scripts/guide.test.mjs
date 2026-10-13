import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  buildGuidePrompt,
  buildKnowledge,
  chunkText,
  citationSources,
  markdownToText,
  searchPassages,
} from "../lib/guide-knowledge.ts";
import { citedIds, normalizeCitations, settleStreamingMarkdown } from "../lib/citations.ts";
import { pageBlocks } from "../lib/page-text.ts";
import { degrees, roles } from "../lib/profile-data.ts";
import { projects } from "../lib/project-data.ts";
import { getAllPosts } from "../lib/blog-data.ts";
import { noteIdentity, parseFieldNote } from "../lib/field-notes.ts";

// Rendered pages in miniature, shaped like React's server output.
const HOME = `<!DOCTYPE html><html><head><title>Youssef</title><script>self.__next_f.push("not text")</script></head><body>
<nav><a href="/#about">Info</a></nav>
<div id="home"><section><span>Y</span><span>C</span></section></div>
<section id="about"><h2>SOFTWARE ENGINEER, RESEARCHER</h2><p>I&#x27;m a software engineer &amp; researcher.</p><p class="hidden lg:block">Based in Ottawa</p></section>
<footer><h3>Connect</h3><ul><li><a href="https://github.com/yssf-c"><svg><path d="M0 0"/></svg><span>GitHub</span></a></li><li><a href="mailto:me@example.com">Email</a></li></ul></footer>
</body></html>`;
const GLUI = `<main><section id="project-top"><h1>A little glue.<br/><em>A clearer headspace.</em></h1><div class="glui-demo" data-guide-skip=""><p>Mock conversation</p></div><a href="https://clui.app/">Meet GLUI</a> <a href="#experience">Explore</a></section>
<nav><a href="#idea">The idea</a></nav>
<section id="architecture"><h2>A durable foundation</h2><p>It runs <code>Orchestrator V2</code>, as <a href="https://github.com/x/docs">the docs</a> explain.</p><span aria-hidden="true">decoration</span><span class="sr-only">For screen readers</span><button>Copy</button><section><p>Nested detail</p></section></section>
<section class="next-study" data-guide-skip=""><h2>Mugshot</h2></section></main>`;

const notes = getAllPosts().map((post) => ({
  post,
  identity: noteIdentity(post),
  parsed: parseFieldNote(readFileSync(post.contentFile, "utf8")),
}));
const pages = new Map([
  ["/", pageBlocks(HOME)],
  ["/projects/glui", pageBlocks(GLUI)],
]);
const knowledge = buildKnowledge({ roles, degrees, projects, notes, pages });
const ids = knowledge.sources.map((s) => s.id);
const CHESS = "note/llm-evals-building-a-chess-benchmark";

test("every source has a unique id and a site path", () => {
  assert.equal(new Set(ids).size, ids.length);
  for (const source of knowledge.sources) assert.match(source.href, /^\/[^\s]*$/, source.id);
  for (const project of projects) assert.ok(ids.includes(`project/${project.id}`));
  for (const post of getAllPosts()) assert.ok(ids.includes(`note/${post.slug}`));
});

test("anchors the guide links to exist on the pages that render them", () => {
  const experience = readFileSync("components/experience.tsx", "utf8");
  assert.ok(experience.includes("id={`xp-${r.id}`}"));
  const education = readFileSync("components/education.tsx", "utf8");
  assert.ok(education.includes("id={`education-${active}`}"));
  const pages = {
    glui: "glui-experience",
    ramelli: "atlasllm-experience",
    mugshot: "mugshot-experience",
    "nlp-phishing-detection": "nlp-phishing-experience",
    "gallery-glow": "gallery-glow-experience",
    biketrack: "biketrack-experience",
  };
  for (const project of projects) {
    const source = readFileSync(`components/projects/${pages[project.id]}.tsx`, "utf8");
    // A chapter is read from, and linked to, its <Section>.
    for (const chapter of project.chapters ?? [])
      assert.ok(source.includes(`<Section id="${chapter.id}"`), `${project.id}#${chapter.id}`);
  }
});

test("a rendered page reads as its visible text, block by block", () => {
  const [hero, about, footer] = pageBlocks(HOME);
  assert.deepEqual(
    [hero.id, about.id, footer.tag],
    [undefined, "about", "footer"],
  );
  assert.equal(about.text, "SOFTWARE ENGINEER, RESEARCHER\nI'm a software engineer & researcher.\nBased in Ottawa");
  assert.equal(footer.text, "Connect\nGitHub (https://github.com/yssf-c)\nEmail (mailto:me@example.com)");

  const [top, architecture, ...rest] = pageBlocks(GLUI);
  assert.equal(top.text, "A little glue.\nA clearer headspace.\nMeet GLUI (https://clui.app/) Explore");
  assert.equal(
    architecture.text,
    "A durable foundation\nIt runs Orchestrator V2, as the docs (https://github.com/x/docs) explain.\nNested detail",
  );
  assert.deepEqual(rest, [], "skipped sections leave no block");
});

test("About and the case studies come from the rendered pages, and nothing the site doesn't show", () => {
  const about = knowledge.sources.find((s) => s.id === "about");
  assert.ok(about.text.startsWith("SOFTWARE ENGINEER, RESEARCHER"));
  assert.ok(about.text.includes("GitHub (https://github.com/yssf-c)"));
  const glui = knowledge.sources.find((s) => s.id === "project/glui");
  assert.ok(glui.text.includes("Meet GLUI (https://clui.app/)"));
  assert.ok(knowledge.sources.find((s) => s.id === "project/glui#architecture").text.includes("Orchestrator V2"));
  assert.equal(knowledge.sources.find((s) => s.id === "project/glui#idea").text, "");

  // The project descriptions and note takeaways in the data aren't displayed.
  const { prompt } = buildGuidePrompt(knowledge, { query: "", today: new Date() });
  for (const project of projects)
    for (const paragraph of project.description) assert.ok(!prompt.includes(paragraph), project.id);
  for (const { identity } of notes) assert.ok(!prompt.includes(identity.takeaway), identity.title);
});

test("without the pages, the citation manifest is the same", () => {
  const fromData = citationSources(buildKnowledge({ roles, degrees, projects, notes }));
  assert.deepEqual(fromData, citationSources(knowledge));
  for (const source of fromData) assert.ok(!("text" in source));
});

// A small retrieval eval: questions a visitor might ask about the field notes.
const retrieval = [
  ["What Elo setting did Stockfish run at?", CHESS],
  ["Which model reached for a shell during a game?", `${CHESS}#challenge-three-keep-the-tools-out`],
  ["What did the first version do when it couldn't parse a reply?", `${CHESS}#version-one-was-lying-to-me`],
  ["What is expected shortfall?", "note/stock-volatility#turning-three-risks-into-one-number"],
  ["Why does the drift of log-price differ from the growth rate?", "note/stock-volatility#one-price-one-source-of-noise"],
];

for (const [question, expected] of retrieval)
  test(`retrieves ${expected} for “${question}”`, () => {
    assert.ok(searchPassages(knowledge, question).some((p) => p.sourceId === expected));
  });

test("small talk and profile questions pull no article excerpts", () => {
  for (const question of ["hi!", "Where does he work now?", "What is GLUI?"])
    assert.deepEqual(searchPassages(knowledge, question), [], question);
});

test("the prompt lists every source id, with sections under their page", () => {
  const { prompt, passageIds } = buildGuidePrompt(knowledge, {
    query: "Which model reached for a shell?",
    today: new Date("2026-10-09"),
  });
  for (const source of knowledge.sources) {
    const listed = !source.parent ? `<source id="${source.id}"` : source.text ? `<section id="${source.id}"` : `${source.id} (“`;
    assert.ok(prompt.includes(listed), source.id);
  }
  assert.ok(prompt.includes("Today is October 2026."));
  assert.ok(passageIds.includes(`${CHESS}#challenge-three-keep-the-tools-out`));
  assert.equal(new Set(passageIds).size, passageIds.length);
  assert.ok(!buildGuidePrompt(knowledge, { query: "hello", today: new Date() }).prompt.includes("<passages>"));
});

test("markdown becomes plain text with sidenotes inline and embeds removed", () => {
  const { chapters, notes, intro } = parseFieldNote(readFileSync("blogs/chessLLM.md", "utf8"));
  const text = markdownToText(intro, notes);
  assert.ok(text.includes("(Stockfish ran at UCI_Elo 1320"));
  assert.ok(!text.includes(":::"));
  assert.ok(!text.includes("```"));
  assert.ok(!/\[\d+\]\(#sn-/.test(markdownToText(chapters[1].markdown, notes)));
  assert.equal(markdownToText("**Bold** and *it* with [a link](https://x.y) and `code`"), "Bold and it with a link and code");
});

test("chunks follow paragraphs and stay near the limit", () => {
  const text = Array.from({ length: 12 }, (_, i) => `Paragraph ${i}. ${"word ".repeat(40)}`).join("\n\n");
  const chunks = chunkText(text, 600);
  assert.ok(chunks.length > 1);
  for (const chunk of chunks) assert.ok(chunk.length <= 600);
  assert.equal(chunks.join("\n\n"), text);
});

test("cited ids are read in order, once, and tolerate a space after the scheme", () => {
  const answer = "He's at [TrendAI](cite:experience/trend), built [GLUI]( cite: project/glui) and [GLUI again](cite:experience/trend).";
  assert.deepEqual(citedIds(answer), ["experience/trend", "project/glui"]);
  assert.ok(normalizeCitations(answer).includes("[GLUI](cite:project/glui)"));
});

test("an unfinished link at the end of a streaming answer shows as its label", () => {
  assert.equal(settleStreamingMarkdown("Built [GL"), "Built GL");
  assert.equal(settleStreamingMarkdown("Built [GLUI]"), "Built GLUI");
  assert.equal(settleStreamingMarkdown("Built [GLUI](cite:proj"), "Built GLUI");
  const done = "Built [GLUI](cite:project/glui).";
  assert.equal(settleStreamingMarkdown(done), done);
  assert.equal(settleStreamingMarkdown("[A](cite:a) and [B"), "[A](cite:a) and B");
});

test("a follow-up gets the whole chapter the previous answer cited", () => {
  const chapter = `${CHESS}#challenge-three-keep-the-tools-out`;
  const { prompt, passageIds } = buildGuidePrompt(knowledge, {
    query: "What did it do afterwards?",
    today: new Date(),
    continuing: ["experience/trend", chapter],
  });
  assert.equal(passageIds[0], chapter);
  assert.ok(prompt.includes("I disqualified it anyway."));
});
