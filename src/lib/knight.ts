// Closed Knight's Tour engine — Storing / Sending / Processing / Saving

export type Sq = number; // 0..63, index = row * 8 + col (row 0 = rank 1)

export const MOVES: readonly [number, number][] = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

export const MOVE_LABELS = [
  "NNE",
  "ENE",
  "ESE",
  "SSE",
  "SSW",
  "WSW",
  "WNW",
  "NNW",
];

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const rowOf = (s: Sq) => s >> 3;
export const colOf = (s: Sq) => s & 7;
export const sqOf = (r: number, c: number) => r * 8 + c;

export function algebraic(s: Sq) {
  return `${FILES[colOf(s)]!}${rowOf(s) + 1}`;
}

export function parseSquare(a: string): Sq {
  const c = FILES.indexOf(a[0]!.toLowerCase());
  const r = parseInt(a[1]!, 10) - 1;
  return sqOf(r, c);
}

// Precomputed neighbour lists (Processing: boundary constraints 0 <= r,c < 8)
export const NEIGHBORS: Sq[][] = Array.from({ length: 64 }, (_, s) => {
  const r = rowOf(s);
  const c = colOf(s);
  const out: Sq[] = [];
  for (const [dr, dc] of MOVES) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) out.push(sqOf(nr, nc));
  }
  return out;
});

export function moveIndex(from: Sq, to: Sq): number {
  const dr = rowOf(to) - rowOf(from);
  const dc = colOf(to) - colOf(from);
  return MOVES.findIndex(([a, b]) => a === dr && b === dc);
}

export function isKnightMove(from: Sq, to: Sq) {
  return NEIGHBORS[from]!.includes(to);
}

export function maskOf(path: Sq[], upTo: number): bigint {
  let m = 0n;
  for (let i = 0; i < upTo && i < path.length; i++) m |= 1n << BigInt(path[i]!);
  return m;
}

export function maskHex(m: bigint) {
  return "0x" + m.toString(16).toUpperCase().padStart(16, "0");
}

/** Onward accessibility degree of `sq` given a visited set. */
export function degree(sq: Sq, visited: boolean[]) {
  let d = 0;
  for (const n of NEIGHBORS[sq]!) if (!visited[n]) d++;
  return d;
}

export function legalTargets(from: Sq, visited: boolean[]) {
  return NEIGHBORS[from]!
    .filter((n) => !visited[n])
    .map((n) => ({ sq: n, deg: degree(n, visited) }))
    .sort((a, b) => a.deg - b.deg);
}

/**
 * Closed tour search: Warnsdorff (first-fit best-fit) ordering with
 * backtracking and closed-loop re-entrancy lookahead.
 */
export function solveClosedTour(start: Sq, seed = 1): Sq[] | null {
  const visited = new Array<boolean>(64).fill(false);
  const path: Sq[] = [start];
  visited[start] = true;
  let rng = seed >>> 0 || 1;
  const rand = () => ((rng = (rng * 1664525 + 1013904223) >>> 0) / 4294967296);
  let nodes = 0;

  const dfs = (cur: Sq, depth: number): boolean => {
    if (++nodes > 3_000_000) return false;
    if (depth === 64) return isKnightMove(cur, start);

    const cands = NEIGHBORS[cur]!
      .filter((n) => !visited[n])
      .map((n) => ({ n, d: degree(n, visited), j: rand() }))
      .sort((a, b) => a.d - b.d || a.j - b.j);

    for (const { n, d } of cands) {
      // re-entrancy lookahead: don't strand the start square
      if (d === 0 && depth !== 63) continue;
      if (depth < 63 && n === start) continue;
      visited[n] = true;
      path.push(n);
      if (dfs(n, depth + 1)) return true;
      path.pop();
      visited[n] = false;
    }
    return false;
  };

  return dfs(start, 1) ? path.slice() : null;
}

const cache = new Map<Sq, Sq[]>();
export function closedTourFrom(start: Sq): Sq[] {
  const hit = cache.get(start);
  if (hit) return hit;
  for (let seed = 1; seed < 40; seed++) {
    const p = solveClosedTour(start, seed * 7919);
    if (p) {
      cache.set(start, p);
      return p;
    }
  }
  return [start];
}

export type Preset = { id: string; name: string; blurb: string; start: string };

export const PRESETS: Preset[] = [
  { id: "euler", name: "Euler's Classic", blurb: "Central launch, 1759", start: "e4" },
  { id: "vandermonde", name: "Vandermonde Loop", blurb: "Closed re-entrant", start: "d4" },
  { id: "beverley", name: "Beverley Semi-Magic", blurb: "Quadrant balanced", start: "a1" },
  { id: "mck-central", name: "McKinney Central", blurb: "Core-out spiral", start: "d5" },
  { id: "mck-corner", name: "McKinney Corner", blurb: "Edge-first sweep", start: "h8" },
];
