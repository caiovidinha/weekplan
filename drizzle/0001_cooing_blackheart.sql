CREATE TABLE "workout_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer,
	"name" text NOT NULL,
	"type" "workout_type" DEFAULT 'gym' NOT NULL,
	"session_date" date NOT NULL,
	"duration_min" real,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;