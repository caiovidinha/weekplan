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
import { cn } from "@/lib/utils";
import type { ExerciseKind } from "@/lib/workouts";
import { addExercise } from "../actions";

export function AddExerciseDialog({
  workoutId,
  defaultKind,
}: {
  workoutId: number;
  defaultKind: ExerciseKind;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ExerciseKind>(defaultKind);
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) return;
    const num = (k: string) => {
      const v = fd.get(k);
      return v === null || v === "" ? null : Number(v);
    };
    start(async () => {
      await addExercise({
        workoutId,
        kind,
        name,
        sets: num("sets"),
        reps: num("reps"),
        weightKg: num("weightKg"),
        durationMin: num("durationMin"),
        distanceKm: num("distanceKm"),
        intensity: (String(fd.get("intensity") ?? "").trim() || null) as string | null,
        notes: (String(fd.get("notes") ?? "").trim() || null) as string | null,
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setKind(defaultKind); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Exercício
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo exercício</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["strength", "cardio"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-lg border py-2 text-sm font-medium transition-colors",
                  kind === k
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {k === "strength" ? "Força" : "Cardio"}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <Label htmlFor="ex-name">Nome</Label>
            <Input
              id="ex-name"
              name="name"
              autoFocus
              placeholder={kind === "strength" ? "Ex: Supino reto" : "Ex: Corrida leve"}
            />
          </div>

          {kind === "strength" ? (
            <div className="grid grid-cols-3 gap-2">
              <Field name="sets" label="Séries" />
              <Field name="reps" label="Reps" />
              <Field name="weightKg" label="Carga (kg)" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Field name="durationMin" label="Duração (min)" />
                <Field name="distanceKm" label="Distância (km)" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ex-intensity">Intensidade</Label>
                <Input id="ex-intensity" name="intensity" placeholder="Ex: Z2, moderado" />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="ex-notes">Notas (opcional)</Label>
            <Input id="ex-notes" name="notes" />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando…" : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={`ex-${name}`}>{label}</Label>
      <Input id={`ex-${name}`} name={name} type="number" inputMode="decimal" />
    </div>
  );
}
