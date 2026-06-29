import { eq } from "drizzle-orm";
import { Settings2 } from "lucide-react";
import Link from "next/link";

import { DayNav } from "@/components/day-nav";
import { MacroStats } from "@/components/macro-stats";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { foodLogs, nutritionGoals } from "@/db/schema";
import { todayISO } from "@/lib/date";
import { MEAL_LABELS, MEAL_ORDER, sumTotals, type MealType } from "@/lib/nutrition";
import { AddFoodDialog } from "./add-food-dialog";
import { DeleteLogButton } from "./delete-log-button";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const date = d && ISO_RE.test(d) ? d : todayISO();

  const [goalsRow] = await db.select().from(nutritionGoals).limit(1);
  const goals = goalsRow ?? { kcal: 2000, protein: 150, carbs: 200, fat: 60 };

  const logs = await db.select().from(foodLogs).where(eq(foodLogs.logDate, date));

  const totals = sumTotals(logs);
  const byMeal = new Map<MealType, typeof logs>();
  for (const meal of MEAL_ORDER) byMeal.set(meal, []);
  for (const log of logs) byMeal.get(log.meal as MealType)?.push(log);

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
                    <li key={log.id} className="flex items-center gap-2 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{log.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(log.grams)}g · {Math.round(log.kcal)} kcal · P{" "}
                          {log.protein} · C {log.carbs} · G {log.fat}
                        </p>
                      </div>
                      <DeleteLogButton id={log.id} />
                    </li>
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
