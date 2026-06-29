import { Bike, Dumbbell, Footprints, HeartPulse, type LucideIcon } from "lucide-react";

export type WorkoutType = "gym" | "running" | "cycling" | "other";
export type ExerciseKind = "strength" | "cardio";

export const WORKOUT_TYPES: { value: WorkoutType; label: string; icon: LucideIcon }[] = [
  { value: "gym", label: "Academia", icon: Dumbbell },
  { value: "running", label: "Corrida", icon: Footprints },
  { value: "cycling", label: "Bike", icon: Bike },
  { value: "other", label: "Outro", icon: HeartPulse },
];

const TYPE_MAP = new Map(WORKOUT_TYPES.map((t) => [t.value, t]));

export function workoutLabel(type: WorkoutType): string {
  return TYPE_MAP.get(type)?.label ?? "Treino";
}

export function workoutIcon(type: WorkoutType): LucideIcon {
  return TYPE_MAP.get(type)?.icon ?? Dumbbell;
}

/** Default exercise kind for a workout type. */
export function defaultKind(type: WorkoutType): ExerciseKind {
  return type === "gym" ? "strength" : "cardio";
}

/** A short human summary of an exercise's prescription. */
export function exerciseSummary(ex: {
  kind: ExerciseKind;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  durationMin: number | null;
  distanceKm: number | null;
  intensity: string | null;
}): string {
  if (ex.kind === "cardio") {
    const parts: string[] = [];
    if (ex.durationMin) parts.push(`${ex.durationMin} min`);
    if (ex.distanceKm) parts.push(`${ex.distanceKm} km`);
    if (ex.intensity) parts.push(ex.intensity);
    return parts.join(" · ") || "Cardio";
  }
  const parts: string[] = [];
  if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
  else if (ex.sets) parts.push(`${ex.sets} séries`);
  if (ex.weightKg) parts.push(`${ex.weightKg} kg`);
  return parts.join(" · ") || "—";
}
