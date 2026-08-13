import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KnightBoard } from "@/components/KnightBoard";
import { Compass } from "@/components/Compass";
import { GitHubBar } from "@/components/GitHubBar";
import { playFanfare, playHop, playError } from "@/lib/audio";
import {
  PRESETS,
  algebraic,
  closedTourFrom,
  isKnightMove,
  legalTargets,
  maskHex,
  maskOf,
  moveIndex,
  parseSquare,
  type Sq,
} from "@/lib/knight";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Closed Knight's Tour — Interactive Visualizer & Solver" },
      {
        name: "description",
        content:
          "Solve and replay closed knight's tours on an 8x8 board: Warnsdorff solver, 64-bit bitmask, vector compass, playback engine and algebraic notation export.",
      },
      { property: "og:title", content: "Closed Knight's Tour Visualizer" },
      {
        property: "og:description",
        content:
          "An obsidian-and-gold interactive solver for closed knight's tours with live bitboard state and playback controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

type Mode = "solve" | "play";

function Page() {
  const [start, setStart] = useState<Sq>(parseSquare("e4"));
  const [tour, setTour] = useState<Sq[]>(() => [parseSquare("e4")]);
  const [cursor, setCursor] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [mode, setMode] = useState<Mode>("solve");
  const [manual, setManual] = useState<Sq[]>([parseSquare("e4")]);
  const [sound, setSound] = useState(true);
  const [solving, setSolving] = useState(false);
  const [copied, setCopied] = useState("");
  const fanfared = useRef(false);

  const path = mode === "solve" ? tour : manual;
  const shown = mode === "solve" ? cursor : manual.length;
  const current = path[shown - 1]!;

  const visited = useMemo(() => {
    const v = new Array<boolean>(64).fill(false);
    path.slice(0, shown).forEach((s) => (v[s] = true));
    return v;
  }, [path, shown]);

  const closed = path.length === 64 && isKnightMove(path[63]!, path[0]!);
  const targets = mode === "play" && manual.length < 64 ? legalTargets(current, visited) : [];
  const mask = maskOf(path, shown);
  const activeDir = shown > 1 ? moveIndex(path[shown - 2]!, current) : null;

  const solve = useCallback(
    (from: Sq) => {
      setSolving(true);
      setTimeout(() => {
        const p = closedTourFrom(from);
        setTour(p);
        setCursor(1);
        setStart(from);
        setSolving(false);
        fanfared.current = false;
      }, 20);
    },
    [],
  );

  useEffect(() => {
    solve(parseSquare("e4"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing || mode !== "solve") return;
    if (cursor >= tour.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setCursor((c) => Math.min(c + 1, tour.length)), 1000 / speed);
    return () => clearTimeout(t);
  }, [playing, cursor, tour.length, speed, mode]);

  useEffect(() => {
    if (shown > 1 && sound) playHop(shown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  useEffect(() => {
    if (mode === "solve" && cursor === 64 && closed && !fanfared.current) {
      fanfared.current = true;
      if (sound) playFanfare();
    }
  }, [cursor, closed, mode, sound]);

  const onSquare = (s: Sq) => {
    if (mode !== "play") {
      solve(s);
      return;
    }
    if (manual.length === 1 && manual[0] !== s && !isKnightMove(current, s)) {
      setManual([s]);
      return;
    }
    if (!visited[s] && isKnightMove(current, s)) {
      setManual((m) => [...m, s]);
    } else if (sound) playError();
  };

  const notation = path
    .slice(0, shown)
    .map((s, i) => `${i + 1}. ${algebraic(s).toUpperCase()}`)
    .join("  ");

  const copy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1400);
  };

  const json = JSON.stringify(
    {
      start: algebraic(path[0]!),
      closed,
      squares: path.map(algebraic),
      bitmask: maskHex(maskOf(path, path.length)),
    },
    null,
    2,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <GitHubBar />

      <header className="mb-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.45em] text-primary/80">
          Storing · Sending · Processing · Saving
        </p>
        <h1 className="font-display mt-3 text-3xl font-bold tracking-wide text-foreground sm:text-5xl">
          Closed Knight&rsquo;s Tour
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          An interactive visualizer and algorithmic solver — Warnsdorff first-fit best-fit ordering
          with closed-loop re-entrancy lookahead across all 64 squares.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section>
          <KnightBoard
            path={path}
            cursor={shown}
            closed={closed}
            targets={targets}
            onSquare={onSquare}
          />

          <div className="panel mt-4 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn" onClick={() => setCursor(1)}>⏮</button>
              <button className="btn" onClick={() => setCursor((c) => Math.max(1, c - 1))}>◀ Step</button>
              <button
                className="btn btn-gold"
                onClick={() => setPlaying((p) => !p)}
                disabled={mode !== "solve"}
              >
                {playing ? "❚❚ Pause" : "▶ Play"}
              </button>
              <button
                className="btn"
                onClick={() => setCursor((c) => Math.min(tour.length, c + 1))}
              >
                Step ▶
              </button>
              <button className="btn" onClick={() => setCursor(tour.length)}>
                Instant Solve ⏭
              </button>
              <button className="btn" onClick={() => solve(start)} disabled={solving}>
                {solving ? "Computing…" : "↻ Recompute"}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setMode((m) => (m === "solve" ? "play" : "solve"));
                  setManual([start]);
                }}
              >
                {mode === "solve" ? "🕹 Play Mode" : "🧠 Solver Mode"}
              </button>
              <button className="btn" onClick={() => setSound((s) => !s)}>
                {sound ? "🔊 Audio" : "🔇 Muted"}
              </button>
            </div>

            <label className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Speed
              <input
                type="range"
                min={1}
                max={30}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-1 flex-1 accent-[var(--primary)]"
              />
              <span className="font-mono-x text-primary">{speed}/s</span>
            </label>

            <label className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Move
              <input
                type="range"
                min={1}
                max={Math.max(tour.length, 1)}
                value={cursor}
                onChange={(e) => setCursor(Number(e.target.value))}
                disabled={mode !== "solve"}
                className="h-1 flex-1 accent-[var(--primary)]"
              />
              <span className="font-mono-x text-primary">{shown}/64</span>
            </label>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="panel p-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Live 64-bit Bitmask Register
            </div>
            <div className="font-mono-x mt-2 break-all text-lg text-primary">{maskHex(mask)}</div>
            <div className="font-mono-x mt-2 grid grid-cols-8 gap-[2px] text-[9px] leading-tight text-muted-foreground">
              {Array.from({ length: 64 }, (_, i) => {
                const bit = (mask >> BigInt(63 - i)) & 1n;
                return (
                  <span key={i} className={bit ? "text-primary" : "opacity-40"}>
                    {bit ? "1" : "0"}
                  </span>
                );
              })}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Square" value={algebraic(current).toUpperCase()} />
              <Stat label="Step" value={`${shown} / 64`} />
              <Stat label="Onward degree" value={String(legalTargets(current, visited).length)} />
              <Stat
                label="Closure"
                value={closed && shown === 64 ? "CLOSED ✓" : shown === 64 ? "OPEN" : "pending"}
              />
            </dl>
          </div>

          <Compass active={activeDir} />

          <div className="panel p-4">
            <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Preset Library
            </div>
            <div className="grid gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => solve(parseSquare(p.start))}
                  className="preset"
                >
                  <span className="font-display text-sm text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.blurb}</span>
                  <span className="font-mono-x text-xs text-primary">
                    {p.start.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Trajectory Record
              </span>
              <div className="flex gap-2">
                <button className="btn btn-sm" onClick={() => copy("alg", notation)}>
                  {copied === "alg" ? "Copied" : "Algebraic"}
                </button>
                <button className="btn btn-sm" onClick={() => copy("json", json)}>
                  {copied === "json" ? "Copied" : "JSON"}
                </button>
              </div>
            </div>
            <p className="font-mono-x max-h-48 overflow-auto text-xs leading-6 text-muted-foreground">
              {notation}
            </p>
          </div>
        </aside>
      </div>

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        Move 64 must re-enter move 1 in a single legal leap — the closure ribbon confirms it.
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="font-mono-x text-primary">{value}</dd>
    </div>
  );
}
