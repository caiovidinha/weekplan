import { asc, desc, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { workoutExercises, workoutSessions, workouts } from "@/db/schema";
import { formatHuman } from "@/lib/date";
import {
  defaultKind,
  exerciseSummary,
  workoutLabel,
  type ExerciseKind,
  type WorkoutType,
} from "@/lib/workouts";
import { AddExerciseDialog } from "./add-exercise-dialog";
import { DeleteExerciseButton } from "./delete-exercise-button";
import { DeleteSessionButton } from "./delete-session-button";
import { DeleteWorkoutButton } from "./delete-workout-button";
import { LogSessionButton } from "./log-session-button";

export const dynamic = "force-dynamic";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workoutId = Number(id);
  if (!Number.isInteger(workoutId)) notFound();

  const [workoutRows, exercises, sessions] = await Promise.all([
    db.select().from(workouts).where(eq(workouts.id, workoutId)).limit(1),
    db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workoutId))
      .orderBy(asc(workoutExercises.sortOrder)),
    db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.workoutId, workoutId))
      .orderBy(desc(workoutSessions.sessionDate))
      .limit(10),
  ]);

  const workout = workoutRows[0];
  if (!workout) notFound();

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

      <LogSessionButton workoutId={workout.id} />

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
                  <AddExerciseDialog
                    workoutId={workout.id}
                    defaultKind={defaultKind(type)}
                    exercise={{
                      id: ex.id,
                      kind: ex.kind as ExerciseKind,
                      name: ex.name,
                      sets: ex.sets,
                      reps: ex.reps,
                      weightKg: ex.weightKg,
                      durationMin: ex.durationMin,
                      distanceKm: ex.distanceKm,
                      intensity: ex.intensity,
                      notes: ex.notes,
                    }}
                  />
                  <DeleteExerciseButton id={ex.id} workoutId={workout.id} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <h2 className="pt-2 font-semibold">Histórico</h2>
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma sessão registrada ainda.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => (
            <li key={session.id}>
              <Card>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm capitalize">{formatHuman(session.sessionDate)}</p>
                    {session.durationMin ? (
                      <p className="text-xs text-muted-foreground">
                        {session.durationMin} min
                      </p>
                    ) : null}
                  </div>
                  <DeleteSessionButton id={session.id} workoutId={workout.id} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
