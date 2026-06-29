import { and, asc, eq, gte, lte } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { HabitChecklist, type ChecklistItem } from "@/components/habit-checklist";
import { MacroStats } from "@/components/macro-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { events, foodLogs, habitLogs, habits, nutritionGoals } from "@/db/schema";
import { formatHuman, todayISO, weekdayOf } from "@/lib/date";
import { eventLabel, formatTime, type EventType } from "@/lib/events";
import { sumTotals } from "@/lib/nutrition";

function SectionLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-sm text-primary">
      {title}
      <ChevronRight className="size-4" />
    </Link>
  );
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const date = todayISO();
  const weekday = weekdayOf(date);

  // Independent queries run concurrently — neon-http does one round-trip per
  // query, so serializing them stacks the latency to the (sa-east-1) database.
  const [goalsRows, logs, allHabits, todayHabitLogs, todayEvents] = await Promise.all([
    db.select().from(nutritionGoals).limit(1),
    db.select().from(foodLogs).where(eq(foodLogs.logDate, date)),
    db.select().from(habits).where(eq(habits.archived, false)).orderBy(habits.sortOrder),
    db.select().from(habitLogs).where(eq(habitLogs.logDate, date)),
    db
      .select()
      .from(events)
      .where(and(gte(events.eventDate, date), lte(events.eventDate, date)))
      .orderBy(asc(events.startTime)),
  ]);

  const goals = goalsRows[0] ?? { kcal: 2000, protein: 150, carbs: 200, fat: 60 };
  const totals = sumTotals(logs);
  const doneSet = new Set(todayHabitLogs.filter((l) => l.done).map((l) => l.habitId));
  const checklist: ChecklistItem[] = allHabits
    .filter((h) => h.weekdays.includes(weekday))
    .map((h) => ({ id: h.id, name: h.name, icon: h.icon, color: h.color, done: doneSet.has(h.id) }));
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-4 pt-2">
      <header className="py-2">
        <h1 className="text-2xl font-bold tracking-tight">Olá 👋</h1>
        <p className="text-sm capitalize text-muted-foreground">{formatHuman(date)}</p>
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Nutrição</CardTitle>
          <SectionLink href="/nutrition" title="Detalhes" />
        </CardHeader>
        <CardContent>
          <MacroStats totals={totals} goals={goals} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            Hábitos{" "}
            {checklist.length > 0 ? (
              <span className="text-sm font-normal text-muted-foreground">
                {doneCount}/{checklist.length}
              </span>
            ) : null}
          </CardTitle>
          <SectionLink href="/habits" title="Gerenciar" />
        </CardHeader>
        <CardContent>
          <HabitChecklist date={date} items={checklist} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Agenda de hoje</CardTitle>
          <SectionLink href="/calendar" title="Semana" />
        </CardHeader>
        <CardContent>
          {todayEvents.length === 0 ? (
            <p className="py-1 text-sm text-muted-foreground">Nenhum evento para hoje.</p>
          ) : (
            <ul className="divide-y divide-border">
              {todayEvents.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{ev.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatTime(ev.startTime) ? `${formatTime(ev.startTime)} · ` : ""}
                      {eventLabel(ev.type as EventType)}
                    </span>
                  </span>
                  {ev.done ? <span className="text-xs text-primary">✓</span> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
