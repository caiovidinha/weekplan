import { cn } from "@/lib/utils";
import type { MacroTotals } from "@/lib/nutrition";

type Goals = { kcal: number; protein: number; carbs: number; fat: number };

function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const size = 132;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const remaining = Math.max(goal - consumed, 0);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{Math.round(consumed)}</span>
        <span className="text-xs text-muted-foreground">de {goal} kcal</span>
        <span className="mt-0.5 text-[11px] text-primary">{Math.round(remaining)} restam</span>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  consumed,
  goal,
  colorVar,
}: {
  label: string;
  consumed: number;
  goal: number;
  colorVar: string;
}) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium" style={{ color: `var(${colorVar})` }}>
          {label}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {Math.round(consumed)}/{goal}g
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, backgroundColor: `var(${colorVar})` }}
        />
      </div>
    </div>
  );
}

export function MacroStats({
  totals,
  goals,
  className,
}: {
  totals: MacroTotals;
  goals: Goals;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-5", className)}>
      <CalorieRing consumed={totals.kcal} goal={goals.kcal} />
      <div className="flex-1 space-y-3">
        <MacroBar label="Proteína" consumed={totals.protein} goal={goals.protein} colorVar="--protein" />
        <MacroBar label="Carbo" consumed={totals.carbs} goal={goals.carbs} colorVar="--carbs" />
        <MacroBar label="Gordura" consumed={totals.fat} goal={goals.fat} colorVar="--fat" />
      </div>
    </div>
  );
}
