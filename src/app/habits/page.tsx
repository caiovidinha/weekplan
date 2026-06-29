import { eq } from "drizzle-orm";

import { HabitChecklist, type ChecklistItem } from "@/components/habit-checklist";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { habitLogs, habits } from "@/db/schema";
import { todayISO, weekdayOf } from "@/lib/date";
import { habitIcon } from "@/lib/habit-icons";
import { DeleteHabitButton } from "./delete-habit-button";
import { HabitFormDialog } from "./habit-form-dialog";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const date = todayISO();
  const weekday = weekdayOf(date);

  const allHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.archived, false))
    .orderBy(habits.sortOrder);

  const todayLogs = await db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.logDate, date));
  const doneSet = new Set(todayLogs.filter((l) => l.done).map((l) => l.habitId));

  const checklist: ChecklistItem[] = allHabits
    .filter((h) => h.weekdays.includes(weekday))
    .map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      done: doneSet.has(h.id),
    }));

  return (
    <div className="space-y-4">
      <PageHeader title="Hábitos" action={<HabitFormDialog />} />

      <Card>
        <CardHeader>
          <CardTitle>Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitChecklist date={date} items={checklist} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meus hábitos</CardTitle>
        </CardHeader>
        <CardContent>
          {allHabits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Crie seu primeiro hábito no botão acima.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {allHabits.map((habit) => {
                const Icon = habitIcon(habit.icon);
                const days = [...habit.weekdays]
                  .sort()
                  .map((d) => WEEKDAY_LABELS[d])
                  .join(", ");
                return (
                  <li key={habit.id} className="flex items-center gap-3 py-2">
                    <Icon className="size-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{habit.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {habit.weekdays.length === 7 ? "Todos os dias" : days}
                      </p>
                    </div>
                    <HabitFormDialog
                      habit={{
                        id: habit.id,
                        name: habit.name,
                        icon: habit.icon,
                        weekdays: habit.weekdays,
                      }}
                    />
                    <DeleteHabitButton id={habit.id} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
