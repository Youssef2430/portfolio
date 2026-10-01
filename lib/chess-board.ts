/**
 * Just enough chess to draw positions from a FEN and apply a move that is
 * already known to be legal. Legality always comes from the recorded run.
 */
export type Square = string | null;

export function parseBoard(fen: string): Square[] {
  const squares: Square[] = [];
  for (const ch of fen.split(" ")[0]) {
    if (ch === "/") continue;
    if (/\d/.test(ch)) squares.push(...Array<Square>(Number(ch)).fill(null));
    else squares.push(ch);
  }
  return squares;
}

/** a8 is index 0, h1 is index 63, matching FEN reading order. */
export const squareIndex = (square: string) =>
  (8 - Number(square[1])) * 8 + square.charCodeAt(0) - 97;

export const squareName = (index: number) =>
  `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;

export function applyUci(board: Square[], uci: string): Square[] {
  const next = [...board];
  const from = squareIndex(uci.slice(0, 2)),
    to = squareIndex(uci.slice(2, 4));
  const piece = next[from];
  if (!piece) return next;
  const white = piece === piece.toUpperCase();
  const kind = piece.toLowerCase();
  if (kind === "k" && Math.abs((to % 8) - (from % 8)) === 2) {
    const kingside = to % 8 === 6;
    const rookFrom = from - (from % 8) + (kingside ? 7 : 0);
    next[from + (kingside ? 1 : -1)] = next[rookFrom];
    next[rookFrom] = null;
  }
  if (kind === "p" && from % 8 !== to % 8 && !next[to])
    next[to + (white ? 8 : -8)] = null;
  next[to] = uci[4] ? (white ? uci[4].toUpperCase() : uci[4]) : piece;
  next[from] = null;
  return next;
}

export function sideToMove(fen: string): "white" | "black" {
  return fen.split(" ")[1] === "b" ? "black" : "white";
}
