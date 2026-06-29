"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deleteWorkoutSession } from "../actions";

export function DeleteSessionButton({
  id,
  workoutId,
}: {
  id: number;
  workoutId: number;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Remover registro"
      disabled={pending}
      onClick={() => start(() => deleteWorkoutSession(id, workoutId))}
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive disabled:opacity-40"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
