"use client";

import { Pencil, Plus } from "lucide-react";
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
import { addExercise, updateExercise } from "../actions";

export type ExerciseData = {
  id: number;
  kind: ExerciseKind;
  name: string;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  durationMin: number | null;
  distanceKm: number | null;
  intensity: string | null;
  notes: string | null;
};

export function AddExerciseDialog({
  workoutId,
  defaultKind,
  exercise,
}: {
  workoutId: number;
  defaultKind: ExerciseKind;
  exercise?: ExerciseData;
}) {
  const editing = Boolean(exercise);
  const initialKind = exercise?.kind ?? defaultKind;
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ExerciseKind>(initialKind);
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
    const payload = {
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
    };
    start(async () => {
      if (editing && exercise) {
        await updateExercise({ ...payload, id: exercise.id });
      } else {
        await addExercise(payload);
      }
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setKind(initialKind);
      }}
    >
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="ghost" size="icon" aria-label="Editar exercício">
            <Pencil />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> Exercício
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar exercício" : "Novo exercício"}</DialogTitle>
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
              defaultValue={exercise?.name ?? ""}
              placeholder={kind === "strength" ? "Ex: Supino reto" : "Ex: Corrida leve"}
            />
          </div>

          {kind === "strength" ? (
            <div className="grid grid-cols-3 gap-2">
              <Field name="sets" label="Séries" value={exercise?.sets} />
              <Field name="reps" label="Reps" value={exercise?.reps} />
              <Field name="weightKg" label="Carga (kg)" value={exercise?.weightKg} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Field name="durationMin" label="Duração (min)" value={exercise?.durationMin} />
                <Field name="distanceKm" label="Distância (km)" value={exercise?.distanceKm} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ex-intensity">Intensidade</Label>
                <Input
                  id="ex-intensity"
                  name="intensity"
                  defaultValue={exercise?.intensity ?? ""}
                  placeholder="Ex: Z2, moderado"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="ex-notes">Notas (opcional)</Label>
            <Input id="ex-notes" name="notes" defaultValue={exercise?.notes ?? ""} />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando…" : editing ? "Salvar" : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value?: number | null;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={`ex-${name}`}>{label}</Label>
      <Input
        id={`ex-${name}`}
        name={name}
        type="number"
        inputMode="decimal"
        defaultValue={value ?? ""}
      />
    </div>
  );
}
