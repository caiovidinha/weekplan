"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { events } from "@/db/schema";

const timeField = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .optional()
  .or(z.literal("").transform(() => undefined));

const eventSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(["workout", "meal", "task", "appointment", "other"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: timeField,
  endTime: timeField,
  notes: z.string().max(500).optional(),
  workoutId: z.coerce.number().int().positive().nullish(),
});

export async function createEvent(input: z.infer<typeof eventSchema>): Promise<void> {
  const data = eventSchema.parse(input);
  await db.insert(events).values({
    title: data.title,
    type: data.type,
    eventDate: data.date,
    startTime: data.startTime ?? null,
    endTime: data.endTime ?? null,
    notes: data.notes ?? null,
    workoutId: data.workoutId ?? null,
  });
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function updateEvent(
  input: z.infer<typeof eventSchema> & { id: number },
): Promise<void> {
  const data = eventSchema.extend({ id: z.number().int().positive() }).parse(input);
  await db
    .update(events)
    .set({
      title: data.title,
      type: data.type,
      eventDate: data.date,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      notes: data.notes ?? null,
      workoutId: data.workoutId ?? null,
    })
    .where(eq(events.id, data.id));
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function deleteEvent(id: number): Promise<void> {
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function toggleEventDone(id: number, done: boolean): Promise<void> {
  await db.update(events).set({ done }).where(eq(events.id, id));
  revalidatePath("/calendar");
  revalidatePath("/");
}
