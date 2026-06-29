"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPES, type EventType } from "@/lib/events";
import { createEvent } from "./actions";

type WorkoutOption = { id: number; name: string };

export function EventDialog({
  defaultDate,
  workouts,
  trigger,
}: {
  defaultDate: string;
  workouts: WorkoutOption[];
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EventType>("task");
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    if (!title) return;
    const workoutRaw = fd.get("workoutId");
    start(async () => {
      await createEvent({
        title,
        type,
        date: String(fd.get("date") ?? defaultDate),
        startTime: (String(fd.get("startTime") ?? "") || undefined) as string | undefined,
        endTime: (String(fd.get("endTime") ?? "") || undefined) as string | undefined,
        notes: String(fd.get("notes") ?? "").trim() || undefined,
        workoutId: workoutRaw ? Number(workoutRaw) : null,
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus /> Evento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="ev-title">Título</Label>
            <Input id="ev-title" name="title" autoFocus placeholder="Ex: Treino de pernas" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="ev-type">Tipo</Label>
              <Select
                id="ev-type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ev-date">Data</Label>
              <Input id="ev-date" name="date" type="date" defaultValue={defaultDate} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="ev-start">Início</Label>
              <Input id="ev-start" name="startTime" type="time" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ev-end">Fim</Label>
              <Input id="ev-end" name="endTime" type="time" />
            </div>
          </div>

          {type === "workout" && workouts.length > 0 ? (
            <div className="space-y-1">
              <Label htmlFor="ev-workout">Treino (opcional)</Label>
              <Select id="ev-workout" name="workoutId" defaultValue="">
                <option value="">Nenhum</option>
                {workouts.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          <div className="space-y-1">
            <Label htmlFor="ev-notes">Notas (opcional)</Label>
            <Textarea id="ev-notes" name="notes" />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando…" : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
