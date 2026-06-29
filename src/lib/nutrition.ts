import type { Food } from "@/db/schema";

export type MacroTotals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const EMPTY_TOTALS: MacroTotals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

/** Scale a food's per-100g nutrients to the given quantity in grams. */
export function macrosForGrams(food: Food, grams: number): MacroTotals {
  const factor = grams / 100;
  const scale = (v: number | null) => Math.round((v ?? 0) * factor * 10) / 10;
  return {
    kcal: Math.round((food.kcal ?? 0) * factor),
    protein: scale(food.protein),
    carbs: scale(food.carbs),
    fat: scale(food.fat),
  };
}

export function sumTotals(items: MacroTotals[]): MacroTotals {
  return items.reduce<MacroTotals>(
    (acc, t) => ({
      kcal: acc.kcal + t.kcal,
      protein: acc.protein + t.protein,
      carbs: acc.carbs + t.carbs,
      fat: acc.fat + t.fat,
    }),
    { ...EMPTY_TOTALS },
  );
}

export const MEAL_LABELS: Record<string, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

export const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_ORDER)[number];
