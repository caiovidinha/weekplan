"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { workoutExercises, workoutSessions, workouts } from "@/db/schema";

const workoutSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["gym", "running", "cycling", "other"]),
  description: z.string().max(500).optional(),
});

export async function createWorkout(
  input: z.infer<typeof workoutSchema>,
): Promise<number> {
  const data = workoutSchema.parse(input);
  const [row] = await db
    .insert(workouts)
    .values({ name: data.name, type: data.type, description: data.description ?? null })
    .returning({ id: workouts.id });
  revalidatePath("/workouts");
  return row.id;
}

export async function updateWorkout(
  input: z.infer<typeof workoutSchema> & { id: number },
): Promise<void> {
  const data = workoutSchema.extend({ id: z.number().int().positive() }).parse(input);
  await db
    .update(workouts)
    .set({ name: data.name, type: data.type, description: data.description ?? null })
    .where(eq(workouts.id, data.id));
  revalidatePath("/workouts");
  revalidatePath(`/workouts/${data.id}`);
}

export async function deleteWorkout(id: number): Promise<void> {
  await db.delete(workouts).where(eq(workouts.id, id));
  revalidatePath("/workouts");
}

const exerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  kind: z.enum(["strength", "cardio"]),
  name: z.string().min(1).max(80),
  sets: z.coerce.number().int().min(0).max(50).nullish(),
  reps: z.coerce.number().int().min(0).max(500).nullish(),
  weightKg: z.coerce.number().min(0).max(1000).nullish(),
  durationMin: z.coerce.number().min(0).max(1000).nullish(),
  distanceKm: z.coerce.number().min(0).max(1000).nullish(),
  intensity: z.string().max(40).nullish(),
  notes: z.string().max(300).nullish(),
});

export async function addExercise(input: z.infer<typeof exerciseSchema>): Promise<void> {
  const data = exerciseSchema.parse(input);
  const [max] = await db
    .select({ value: workoutExercises.sortOrder })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, data.workoutId))
    .orderBy(workoutExercises.sortOrder);
  await db.insert(workoutExercises).values({
    ...data,
    sets: data.sets ?? null,
    reps: data.reps ?? null,
    weightKg: data.weightKg ?? null,
    durationMin: data.durationMin ?? null,
    distanceKm: data.distanceKm ?? null,
    intensity: data.intensity ?? null,
    notes: data.notes ?? null,
    sortOrder: (max?.value ?? 0) + 1,
  });
  revalidatePath(`/workouts/${data.workoutId}`);
}

export async function updateExercise(
  input: z.infer<typeof exerciseSchema> & { id: number },
): Promise<void> {
  const data = exerciseSchema.extend({ id: z.number().int().positive() }).parse(input);
  await db
    .update(workoutExercises)
    .set({
      kind: data.kind,
      name: data.name,
      sets: data.sets ?? null,
      reps: data.reps ?? null,
      weightKg: data.weightKg ?? null,
      durationMin: data.durationMin ?? null,
      distanceKm: data.distanceKm ?? null,
      intensity: data.intensity ?? null,
      notes: data.notes ?? null,
    })
    .where(eq(workoutExercises.id, data.id));
  revalidatePath(`/workouts/${data.workoutId}`);
}

export async function deleteExercise(id: number, workoutId: number): Promise<void> {
  await db.delete(workoutExercises).where(eq(workoutExercises.id, id));
  revalidatePath(`/workouts/${workoutId}`);
}

/* ------------------------------- Sessions -------------------------------- */

const sessionSchema = z.object({
  workoutId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMin: z.coerce.number().min(0).max(1000).nullish(),
  notes: z.string().max(300).nullish(),
});

export async function logWorkoutSession(
  input: z.infer<typeof sessionSchema>,
): Promise<void> {
  const data = sessionSchema.parse(input);
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, data.workoutId))
    .limit(1);
  if (!workout) throw new Error("Treino não encontrado");

  await db.insert(workoutSessions).values({
    workoutId: workout.id,
    name: workout.name,
    type: workout.type,
    sessionDate: data.date,
    durationMin: data.durationMin ?? null,
    notes: data.notes ?? null,
  });
  revalidatePath(`/workouts/${data.workoutId}`);
  revalidatePath("/workouts");
  revalidatePath("/");
}

export async function deleteWorkoutSession(
  id: number,
  workoutId?: number,
): Promise<void> {
  await db.delete(workoutSessions).where(eq(workoutSessions.id, id));
  if (workoutId) revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/workouts");
  revalidatePath("/");
}
