/**
 * TypeScript port of chessLLM's protocol 3 `resolve_move`
 * (chess_llm_bench/core/moves.py). Recovers a move only from an unambiguous
 * place in the reply, never by choosing among tokens in prose.
 */
export type Resolution =
  | { move: string; method: ResolveMethod; strict: boolean; error: null }
  | { move: null; method: ResolveMethod | "invalid"; strict: false; error: "missing_or_ambiguous_move" | "illegal_move" };
export type ResolveMethod = "strict" | "json" | "code_block" | "marked_final" | "final_line";

const UCI = "[a-h][1-8][a-h][1-8][qrbn]?";
const IS_UCI = new RegExp(`^${UCI}$`, "i");
const MARKED = new RegExp(`^(?:final(?: move)?|best move|move|uci)\\s*[:=]\\s*\`?(${UCI})\`?\\.?$`, "i");
const BARE = new RegExp(`^\`?(${UCI})\`?$`, "i");

export function resolveMove(response: string, legalMoves: string[], strict = false): Resolution {
  const text = response.trim();
  let candidate: string | null = null;
  let method: ResolveMethod | "invalid" = "invalid";
  if (IS_UCI.test(text)) [candidate, method] = [text.toLowerCase(), "strict"];
  else if (!strict) {
    let obj: unknown = null;
    try {
      obj = JSON.parse(text);
    } catch {}
    if (obj && typeof obj === "object" && !Array.isArray(obj) && typeof (obj as { move?: unknown }).move === "string")
      [candidate, method] = [(obj as { move: string }).move.trim().toLowerCase(), "json"];
    else {
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length && lines.at(-1) === "```") {
        // A final fenced block may hold exactly one move, never a list of candidates.
        let opening: number | null = null;
        for (let i = lines.length - 2; i >= 0; i--)
          if (lines[i].startsWith("```")) {
            opening = i;
            break;
          }
        if (opening !== null && lines.length - opening === 3)
          [candidate, method] = [lines.at(-2)!.replace(/^`+|`+$/g, ""), "code_block"];
      } else if (lines.length) {
        const final = lines.at(-1)!;
        const marked = final.match(MARKED);
        if (marked) [candidate, method] = [marked[1].toLowerCase(), "marked_final"];
        else if (BARE.test(final)) [candidate, method] = [final.replace(/^`+|`+$/g, "").toLowerCase(), "final_line"];
      }
    }
  }
  if (candidate === null || !IS_UCI.test(candidate))
    return { move: null, method: "invalid", strict: false, error: "missing_or_ambiguous_move" };
  candidate = candidate.toLowerCase();
  // A candidate only exists once a method matched, so method can't be "invalid" here.
  const matched = method as ResolveMethod;
  if (!legalMoves.includes(candidate)) return { move: null, method: matched, strict: false, error: "illegal_move" };
  return { move: candidate, method: matched, strict: matched === "strict", error: null };
}
