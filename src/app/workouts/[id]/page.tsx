import { asc, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { workoutExercises, workouts } from "@/db/schema";
import {
  defaultKind,
  exerciseSummary,
  workoutLabel,
  type ExerciseKind,
  type WorkoutType,
} from "@/lib/workouts";
import { AddExerciseDialog } from "./add-exercise-dialog";
import { DeleteExerciseButton } from "./delete-exercise-button";
import { DeleteWorkoutButton } from "./delete-workout-button";

export const dynamic = "force-dynamic";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workoutId = Number(id);
  if (!Number.isInteger(workoutId)) notFound();

  const [workout] = await db.select().from(workouts).where(eq(workouts.id, workoutId)).limit(1);
  if (!workout) notFound();

  const exercises = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(workoutExercises.sortOrder));

  const type = workout.type as WorkoutType;

  return (
    <div className="space-y-4">
      <PageHeader
        title={workout.name}
        subtitle={workoutLabel(type)}
        action={
          <div className="flex items-center">
            <Button asChild variant="ghost" size="icon">
              <Link href="/workouts" aria-label="Voltar">
                <ChevronLeft />
              </Link>
            </Button>
            <DeleteWorkoutButton id={workout.id} />
          </div>
        }
      />

      {workout.description ? (
        <Card>
          <CardContent className="py-3 text-sm text-muted-foreground">
            {workout.description}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Exercícios</h2>
        <AddExerciseDialog workoutId={workout.id} defaultKind={defaultKind(type)} />
      </div>

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhum exercício ainda.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <Card>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {exerciseSummary({ ...ex, kind: ex.kind as ExerciseKind })}
                      {ex.notes ? ` · ${ex.notes}` : ""}
                    </p>
                  </div>
                  <DeleteExerciseButton id={ex.id} workoutId={workout.id} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
