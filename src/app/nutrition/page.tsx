import { and, eq, gte, lte, sql } from "drizzle-orm";
import { Settings2 } from "lucide-react";
import Link from "next/link";

import { CalorieTrend, type TrendPoint } from "@/components/calorie-trend";
import { DayNav } from "@/components/day-nav";
import { MacroStats } from "@/components/macro-stats";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { foodLogs, nutritionGoals } from "@/db/schema";
import { formatWeekdayShort, todayISO, weekDays } from "@/lib/date";
import { MEAL_LABELS, MEAL_ORDER, sumTotals, type MealType } from "@/lib/nutrition";
import { AddFoodDialog } from "./add-food-dialog";
import { FoodLogItem } from "./food-log-item";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const date = d && ISO_RE.test(d) ? d : todayISO();

  const week = weekDays(date);
  const weekStart = week[0];
  const weekEnd = week[week.length - 1];

  const [goalsRows, logs, dailyKcal] = await Promise.all([
    db.select().from(nutritionGoals).limit(1),
    db.select().from(foodLogs).where(eq(foodLogs.logDate, date)),
    db
      .select({
        day: foodLogs.logDate,
        kcal: sql<number>`coalesce(sum(${foodLogs.kcal}), 0)`,
      })
      .from(foodLogs)
      .where(and(gte(foodLogs.logDate, weekStart), lte(foodLogs.logDate, weekEnd)))
      .groupBy(foodLogs.logDate),
  ]);

  const goals = goalsRows[0] ?? { kcal: 2000, protein: 150, carbs: 200, fat: 60 };

  const totals = sumTotals(logs);
  const byMeal = new Map<MealType, typeof logs>();
  for (const meal of MEAL_ORDER) byMeal.set(meal, []);
  for (const log of logs) byMeal.get(log.meal as MealType)?.push(log);

  const kcalByDay = new Map(dailyKcal.map((r) => [r.day, Number(r.kcal)]));
  const today = todayISO();
  const trend: TrendPoint[] = week.map((day) => ({
    label: formatWeekdayShort(day),
    kcal: Math.round(kcalByDay.get(day) ?? 0),
    isToday: day === today,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Nutrição"
        action={
          <Button asChild variant="ghost" size="icon">
            <Link href="/nutrition/goals" aria-label="Metas">
              <Settings2 />
            </Link>
          </Button>
        }
      />

      <DayNav basePath="/nutrition" date={date} />

      <Card>
        <CardContent className="pt-4">
          <MacroStats totals={totals} goals={goals} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calorias na semana</CardTitle>
        </CardHeader>
        <CardContent>
          <CalorieTrend data={trend} goal={goals.kcal} />
        </CardContent>
      </Card>

      {MEAL_ORDER.map((meal) => {
        const items = byMeal.get(meal) ?? [];
        const mealTotals = sumTotals(items);
        return (
          <Card key={meal}>
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{MEAL_LABELS[meal]}</h2>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(mealTotals.kcal)} kcal
                  </p>
                </div>
                <AddFoodDialog date={date} meal={meal} />
              </div>

              {items.length === 0 ? (
                <p className="py-1 text-sm text-muted-foreground">Nada registrado.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((log) => (
                    <FoodLogItem key={log.id} log={log} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
