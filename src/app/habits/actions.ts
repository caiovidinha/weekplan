"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { habitLogs, habits } from "@/db/schema";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().max(40).optional(),
  color: z.string().max(20).optional(),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1),
});

export async function createHabit(input: z.infer<typeof createSchema>): Promise<void> {
  const data = createSchema.parse(input);
  const [max] = await db
    .select({ value: habits.sortOrder })
    .from(habits)
    .orderBy(habits.sortOrder)
    .limit(1);
  await db.insert(habits).values({
    name: data.name,
    icon: data.icon ?? null,
    color: data.color ?? null,
    weekdays: data.weekdays,
    sortOrder: (max?.value ?? 0) + 1,
  });
  revalidatePath("/habits");
  revalidatePath("/");
}

const updateSchema = createSchema.extend({ id: z.number().int().positive() });

export async function updateHabit(input: z.infer<typeof updateSchema>): Promise<void> {
  const data = updateSchema.parse(input);
  await db
    .update(habits)
    .set({
      name: data.name,
      icon: data.icon ?? null,
      color: data.color ?? null,
      weekdays: data.weekdays,
    })
    .where(eq(habits.id, data.id));
  revalidatePath("/habits");
  revalidatePath("/");
}

export async function deleteHabit(id: number): Promise<void> {
  await db.delete(habits).where(eq(habits.id, id));
  revalidatePath("/habits");
  revalidatePath("/");
}

const toggleSchema = z.object({
  habitId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  done: z.boolean(),
});

export async function toggleHabit(input: z.infer<typeof toggleSchema>): Promise<void> {
  const { habitId, date, done } = toggleSchema.parse(input);
  if (done) {
    await db
      .insert(habitLogs)
      .values({ habitId, logDate: date, done: true })
      .onConflictDoUpdate({
        target: [habitLogs.habitId, habitLogs.logDate],
        set: { done: true },
      });
  } else {
    await db
      .delete(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.logDate, date)));
  }
  revalidatePath("/habits");
  revalidatePath("/");
}
