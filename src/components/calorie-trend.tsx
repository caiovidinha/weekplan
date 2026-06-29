"use client";

import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export type TrendPoint = { label: string; kcal: number; isToday: boolean };

export function CalorieTrend({ data, goal }: { data: TrendPoint[]; goal: number }) {
  const hasData = data.some((d) => d.kcal > 0);

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          {goal > 0 ? (
            <ReferenceLine
              y={goal}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
          ) : null}
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value) => [`${Math.round(Number(value ?? 0))} kcal`, ""]}
          />
          <Bar dataKey="kcal" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.isToday ? "var(--primary)" : "var(--muted-foreground)"}
                fillOpacity={d.isToday ? 1 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {!hasData ? (
        <p className="-mt-24 text-center text-sm text-muted-foreground">
          Sem registros nesta semana ainda.
        </p>
      ) : null}
    </div>
  );
}
