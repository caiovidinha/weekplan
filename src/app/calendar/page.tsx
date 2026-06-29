import { and, asc, gte, lte } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { events, workouts } from "@/db/schema";
import {
  formatDayNumber,
  formatShort,
  formatWeekdayShort,
  shiftISO,
  todayISO,
  weekDays,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import type { EventType } from "@/lib/events";
import { EventDialog } from "./event-dialog";
import { EventRow } from "./event-row";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const anchor = d && ISO_RE.test(d) ? d : todayISO();
  const days = weekDays(anchor);
  const first = days[0];
  const last = days[days.length - 1];
  const today = todayISO();

  const weekEvents = await db
    .select()
    .from(events)
    .where(and(gte(events.eventDate, first), lte(events.eventDate, last)))
    .orderBy(asc(events.startTime));

  const workoutOptions = await db
    .select({ id: workouts.id, name: workouts.name })
    .from(workouts)
    .orderBy(workouts.name);

  const byDay = new Map<string, typeof weekEvents>();
  for (const day of days) byDay.set(day, []);
  for (const ev of weekEvents) byDay.get(ev.eventDate)?.push(ev);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Semana"
        subtitle={`${formatShort(first)} – ${formatShort(last)}`}
        action={<EventDialog defaultDate={today} workouts={workoutOptions} />}
      />

      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/calendar?d=${shiftISO(anchor, -7)}`} aria-label="Semana anterior">
            <ChevronLeft />
          </Link>
        </Button>
        <Link href="/calendar" className="text-sm text-primary">
          Semana atual
        </Link>
        <Button asChild variant="ghost" size="icon">
          <Link href={`/calendar?d=${shiftISO(anchor, 7)}`} aria-label="Próxima semana">
            <ChevronRight />
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {days.map((day) => {
          const dayEvents = byDay.get(day) ?? [];
          const isToday = day === today;
          return (
            <Card key={day} className={cn(isToday && "border-primary/60")}>
              <CardContent className="py-3">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-sm font-semibold capitalize",
                        isToday && "text-primary",
                      )}
                    >
                      {formatWeekdayShort(day)}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDayNumber(day)}</span>
                  </div>
                  <EventDialog
                    defaultDate={day}
                    workouts={workoutOptions}
                    trigger={
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                      >
                        + adicionar
                      </button>
                    }
                  />
                </div>
                {dayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem eventos.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {dayEvents.map((ev) => (
                      <EventRow
                        key={ev.id}
                        event={{
                          id: ev.id,
                          title: ev.title,
                          type: ev.type as EventType,
                          startTime: ev.startTime,
                          endTime: ev.endTime,
                          done: ev.done,
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
