import { FILES, algebraic, colOf, rowOf, type Sq } from "@/lib/knight";

const CELL = 100 / 8;
const center = (s: Sq) => ({
  x: colOf(s) * CELL + CELL / 2,
  y: (7 - rowOf(s)) * CELL + CELL / 2,
});

type Props = {
  path: Sq[];
  cursor: number; // number of squares revealed (1..64)
  closed: boolean;
  targets: { sq: Sq; deg: number }[];
  onSquare: (s: Sq) => void;
};

export function KnightBoard({ path, cursor, closed, targets, onSquare }: Props) {
  const shown = path.slice(0, Math.max(cursor, 1));
  const knight = shown[shown.length - 1];
  const orderMap = new Map<Sq, number>();
  shown.forEach((s, i) => orderMap.set(s, i + 1));
  const targetMap = new Map(targets.map((t) => [t.sq, t.deg]));
  const complete = closed && cursor >= 64;

  const trail = shown.map((s) => center(s));
  const d = trail.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const kc = knight !== undefined ? center(knight) : { x: 0, y: 0 };

  return (
    <div className="board-frame">
      <div className="relative aspect-square w-full">
        <div className="grid h-full w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-[4px]">
          {Array.from({ length: 64 }, (_, i) => {
            const r = 7 - Math.floor(i / 8);
            const c = i % 8;
            const s = r * 8 + c;
            const light = (r + c) % 2 === 1;
            const n = orderMap.get(s);
            const deg = targetMap.get(s);
            return (
              <button
                key={s}
                onClick={() => onSquare(s)}
                className={`sq ${light ? "sq-light" : "sq-dark"} ${n ? "sq-visited" : ""}`}
              >
                {c === 0 && <span className="coord coord-rank">{r + 1}</span>}
                {r === 0 && <span className="coord coord-file">{FILES[c]}</span>}
                {n && <span className="sq-num">{n}</span>}
                {deg !== undefined && <span className="sq-deg">{deg}°</span>}
              </button>
            );
          })}
        </div>

        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--trail-from)" />
              <stop offset="100%" stopColor="var(--trail-to)" />
            </linearGradient>
          </defs>
          <path
            d={d}
            fill="none"
            stroke="url(#trailGrad)"
            strokeWidth={0.7}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="trail-glow"
          />
          {complete && knight !== undefined && path[0] !== undefined && (
            <line
              x1={kc.x}
              y1={kc.y}
              x2={center(path[0]).x}
              y2={center(path[0]).y}
              stroke="var(--closure)"
              strokeWidth={1.1}
              strokeLinecap="round"
              className="closure-ribbon"
            />
          )}
          {trail.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={0.55} fill="var(--trail-to)" opacity={0.7} />
          ))}
        </svg>

        {knight !== undefined && (
          <div
            className="knight"
            style={{ left: `${kc.x}%`, top: `${kc.y}%` }}
            aria-label={`Knight on ${algebraic(knight)}`}
          >
            ♞
          </div>
        )}
      </div>
    </div>
  );
}
