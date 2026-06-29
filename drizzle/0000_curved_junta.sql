CREATE TYPE "public"."event_type" AS ENUM('workout', 'meal', 'task', 'appointment', 'other');--> statement-breakpoint
CREATE TYPE "public"."exercise_kind" AS ENUM('strength', 'cardio');--> statement-breakpoint
CREATE TYPE "public"."food_source" AS ENUM('taco', 'custom');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TYPE "public"."workout_type" AS ENUM('gym', 'running', 'cycling', 'other');--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" "event_type" DEFAULT 'task' NOT NULL,
	"event_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"notes" text,
	"workout_id" integer,
	"done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"log_date" date NOT NULL,
	"meal" "meal_type" NOT NULL,
	"food_id" integer,
	"name" text NOT NULL,
	"grams" real NOT NULL,
	"kcal" real NOT NULL,
	"protein" real NOT NULL,
	"carbs" real NOT NULL,
	"fat" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" "food_source" DEFAULT 'custom' NOT NULL,
	"taco_id" integer,
	"name" text NOT NULL,
	"category" text,
	"kcal" real,
	"protein" real,
	"carbs" real,
	"fat" real,
	"fiber" real,
	"sodium" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"habit_id" integer NOT NULL,
	"log_date" date NOT NULL,
	"done" boolean DEFAULT true NOT NULL,
	CONSTRAINT "habit_logs_habit_date_unique" UNIQUE("habit_id","log_date")
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"color" text,
	"weekdays" jsonb DEFAULT '[0,1,2,3,4,5,6]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"kcal" integer DEFAULT 2000 NOT NULL,
	"protein" integer DEFAULT 150 NOT NULL,
	"carbs" integer DEFAULT 200 NOT NULL,
	"fat" integer DEFAULT 60 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer NOT NULL,
	"kind" "exercise_kind" DEFAULT 'strength' NOT NULL,
	"name" text NOT NULL,
	"sets" integer,
	"reps" integer,
	"weight_kg" real,
	"duration_min" real,
	"distance_km" real,
	"intensity" text,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "workout_type" DEFAULT 'gym' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;