"use server";

import { and, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { foodLogs, foods, nutritionGoals, type Food } from "@/db/schema";
import { macrosForGrams } from "@/lib/nutrition";

export async function searchFoods(query: string): Promise<Food[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const pattern = `%${q}%`;
  return db
    .select()
    .from(foods)
    .where(or(ilike(foods.name, pattern), ilike(foods.category, pattern)))
    .orderBy(foods.name)
    .limit(40);
}

const addLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  foodId: z.coerce.number().int().positive(),
  grams: z.coerce.number().positive().max(5000),
});

export async function addFoodLog(input: z.infer<typeof addLogSchema>): Promise<void> {
  const { date, meal, foodId, grams } = addLogSchema.parse(input);

  const [food] = await db.select().from(foods).where(eq(foods.id, foodId)).limit(1);
  if (!food) throw new Error("Alimento não encontrado");

  const macros = macrosForGrams(food, grams);
  await db.insert(foodLogs).values({
    logDate: date,
    meal,
    foodId: food.id,
    name: food.name,
    grams,
    ...macros,
  });

  revalidatePath("/nutrition");
  revalidatePath("/");
}

export async function deleteFoodLog(id: number): Promise<void> {
  await db.delete(foodLogs).where(eq(foodLogs.id, id));
  revalidatePath("/nutrition");
  revalidatePath("/");
}

const customFoodSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().max(120).optional(),
  kcal: z.coerce.number().min(0).max(2000),
  protein: z.coerce.number().min(0).max(200),
  carbs: z.coerce.number().min(0).max(200),
  fat: z.coerce.number().min(0).max(200),
  fiber: z.coerce.number().min(0).max(200).optional(),
  sodium: z.coerce.number().min(0).max(50000).optional(),
});

export async function createCustomFood(
  input: z.infer<typeof customFoodSchema>,
): Promise<Food> {
  const data = customFoodSchema.parse(input);
  const [food] = await db
    .insert(foods)
    .values({
      source: "custom",
      name: data.name,
      category: data.category ?? "Personalizado",
      kcal: data.kcal,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber ?? null,
      sodium: data.sodium ?? null,
    })
    .returning();
  revalidatePath("/nutrition");
  revalidatePath("/foods");
  return food;
}

const goalsSchema = z.object({
  kcal: z.coerce.number().int().min(0).max(10000),
  protein: z.coerce.number().int().min(0).max(1000),
  carbs: z.coerce.number().int().min(0).max(2000),
  fat: z.coerce.number().int().min(0).max(1000),
});

export async function updateGoals(input: z.infer<typeof goalsSchema>): Promise<void> {
  const data = goalsSchema.parse(input);
  const [existing] = await db.select({ id: nutritionGoals.id }).from(nutritionGoals).limit(1);
  if (existing) {
    await db
      .update(nutritionGoals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(nutritionGoals.id, existing.id));
  } else {
    await db.insert(nutritionGoals).values(data);
  }
  revalidatePath("/nutrition");
  revalidatePath("/");
}

export async function deleteCustomFood(id: number): Promise<void> {
  await db.delete(foods).where(and(eq(foods.id, id), eq(foods.source, "custom")));
  revalidatePath("/foods");
}

export async function listFoodLogs(date: string) {
  return db
    .select()
    .from(foodLogs)
    .where(eq(foodLogs.logDate, date))
    .orderBy(desc(foodLogs.createdAt));
}
