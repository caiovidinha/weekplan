import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  time,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*                                   Enums                                     */
/* -------------------------------------------------------------------------- */

export const foodSourceEnum = pgEnum("food_source", ["taco", "custom"]);
export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);
export const workoutTypeEnum = pgEnum("workout_type", [
  "gym",
  "running",
  "cycling",
  "other",
]);
export const exerciseKindEnum = pgEnum("exercise_kind", ["strength", "cardio"]);
export const eventTypeEnum = pgEnum("event_type", [
  "workout",
  "meal",
  "task",
  "appointment",
  "other",
]);

/* -------------------------------------------------------------------------- */
/*                                  Nutrition                                  */
/* -------------------------------------------------------------------------- */

/**
 * Food catalog. Holds both the imported TACO dataset (`source = 'taco'`) and
 * user-created entries (`source = 'custom'`). All nutrient values are per 100g
 * and nullable because the TACO table has gaps (marked `*`/`Tr` in the source).
 */
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  source: foodSourceEnum("source").notNull().default("custom"),
  tacoId: integer("taco_id"),
  name: text("name").notNull(),
  category: text("category"),
  kcal: real("kcal"),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  fiber: real("fiber"),
  sodium: real("sodium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Daily macro targets. Single-user app, so we keep (and read) a single row.
 */
export const nutritionGoals = pgTable("nutrition_goals", {
  id: serial("id").primaryKey(),
  kcal: integer("kcal").notNull().default(2000),
  protein: integer("protein").notNull().default(150),
  carbs: integer("carbs").notNull().default(200),
  fat: integer("fat").notNull().default(60),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * A logged food item for a given day/meal. Macro fields are a snapshot for the
 * logged quantity so editing or deleting the source food later doesn't rewrite
 * history.
 */
export const foodLogs = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  logDate: date("log_date").notNull(),
  meal: mealTypeEnum("meal").notNull(),
  foodId: integer("food_id").references(() => foods.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  grams: real("grams").notNull(),
  kcal: real("kcal").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*                                   Habits                                    */
/* -------------------------------------------------------------------------- */

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  /** Weekdays the habit is active on, 0 = Sunday … 6 = Saturday. */
  weekdays: jsonb("weekdays").$type<number[]>().notNull().default([0, 1, 2, 3, 4, 5, 6]),
  sortOrder: integer("sort_order").notNull().default(0),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: serial("id").primaryKey(),
    habitId: integer("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    done: boolean("done").notNull().default(true),
  },
  (t) => [unique("habit_logs_habit_date_unique").on(t.habitId, t.logDate)],
);

/* -------------------------------------------------------------------------- */
/*                                  Workouts                                   */
/* -------------------------------------------------------------------------- */

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: workoutTypeEnum("type").notNull().default("gym"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * One exercise within a workout. `strength` uses sets/reps/weight; `cardio`
 * uses duration/distance/intensity. Both share the table; unused fields stay
 * null.
 */
export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  kind: exerciseKindEnum("kind").notNull().default("strength"),
  name: text("name").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weightKg: real("weight_kg"),
  durationMin: real("duration_min"),
  distanceKm: real("distance_km"),
  intensity: text("intensity"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* -------------------------------------------------------------------------- */
/*                              Calendar / agenda                             */
/* -------------------------------------------------------------------------- */

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: eventTypeEnum("type").notNull().default("task"),
  eventDate: date("event_date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  notes: text("notes"),
  workoutId: integer("workout_id").references(() => workouts.id, {
    onDelete: "set null",
  }),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*                          Completed workout history                          */
/* -------------------------------------------------------------------------- */

/**
 * A record of a workout actually performed on a given day. `name`/`type` are
 * snapshots so history survives editing or deleting the source template.
 */
export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").references(() => workouts.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  type: workoutTypeEnum("type").notNull().default("gym"),
  sessionDate: date("session_date").notNull(),
  durationMin: real("duration_min"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*                              Inferred row types                             */
/* -------------------------------------------------------------------------- */

export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
export type NutritionGoals = typeof nutritionGoals.$inferSelect;
export type FoodLog = typeof foodLogs.$inferSelect;
export type NewFoodLog = typeof foodLogs.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitLog = typeof habitLogs.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type WeekEvent = typeof events.$inferSelect;
export type NewWeekEvent = typeof events.$inferInsert;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type NewWorkoutSession = typeof workoutSessions.$inferInsert;
