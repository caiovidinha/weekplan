"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";

import { eventColorVar, eventLabel, formatTime, type EventType } from "@/lib/events";
import { cn } from "@/lib/utils";
import { deleteEvent, toggleEventDone } from "./actions";
import { EventDialog } from "./event-dialog";

export type EventRowData = {
  id: number;
  title: string;
  type: EventType;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  workoutId: number | null;
  done: boolean;
};

export function EventRow({
  event,
  workouts,
}: {
  event: EventRowData;
  workouts: { id: number; name: string }[];
}) {
  const [pending, start] = useTransition();
  const time = formatTime(event.startTime);
  const endTime = formatTime(event.endTime);

  return (
    <div className="flex items-center gap-2 py-1.5">
      <button
        type="button"
        aria-label={event.done ? "Desmarcar" : "Concluir"}
        disabled={pending}
        onClick={() => start(() => toggleEventDone(event.id, !event.done))}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          event.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
        style={!event.done ? { borderColor: `var(${eventColorVar(event.type)})` } : undefined}
      >
        {event.done ? <Check className="size-3.5" /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", event.done && "text-muted-foreground line-through")}>
          {event.title}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {time ? `${time}${endTime ? `–${endTime}` : ""} · ` : ""}
          {eventLabel(event.type)}
        </p>
      </div>

      <EventDialog
        defaultDate={event.eventDate}
        workouts={workouts}
        event={event}
        trigger={
          <button
            type="button"
            aria-label="Editar evento"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent"
          >
            <Pencil className="size-4" />
          </button>
        }
      />

      <button
        type="button"
        aria-label="Remover"
        disabled={pending}
        onClick={() => start(() => deleteEvent(event.id))}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive disabled:opacity-40"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
