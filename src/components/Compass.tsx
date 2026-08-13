import { MOVES, MOVE_LABELS } from "@/lib/knight";

export function Compass({ active }: { active: number | null }) {
  const R = 62;
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="mb-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        8-Direction Vector Compass
      </div>
      <svg viewBox="-80 -80 160 160" className="mx-auto h-40 w-40">
        <circle r={R} className="fill-none stroke-border" strokeWidth={1} />
        <circle r={R * 0.55} className="fill-none stroke-border/60" strokeWidth={0.6} />
        <line x1={-R} y1={0} x2={R} y2={0} className="stroke-border/50" strokeWidth={0.6} />
        <line x1={0} y1={-R} x2={0} y2={R} className="stroke-border/50" strokeWidth={0.6} />
        {MOVES.map(([dr, dc], i) => {
          const len = Math.hypot(dr, dc);
          const x = (dc / len) * R;
          const y = (-dr / len) * R;
          const on = active === i;
          return (
            <g key={i}>
              <line
                x1={0}
                y1={0}
                x2={x}
                y2={y}
                className={on ? "stroke-primary" : "stroke-muted-foreground/35"}
                strokeWidth={on ? 3 : 1.2}
                strokeLinecap="round"
                style={on ? { filter: "drop-shadow(0 0 6px var(--primary))" } : undefined}
              />
              <circle
                cx={x}
                cy={y}
                r={on ? 5 : 2.5}
                className={on ? "fill-primary" : "fill-muted-foreground/40"}
              />
              <text
                x={x * 1.22}
                y={y * 1.22 + 3}
                textAnchor="middle"
                className={on ? "fill-primary" : "fill-muted-foreground/60"}
                style={{ fontSize: 8, letterSpacing: "0.08em" }}
              >
                {MOVE_LABELS[i]}
              </text>
            </g>
          );
        })}
        <circle r={4} className="fill-primary/80" />
      </svg>
    </div>
  );
}
