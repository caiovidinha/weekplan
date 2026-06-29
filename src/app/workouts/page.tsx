import { desc } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { workoutIcon, workoutLabel, type WorkoutType } from "@/lib/workouts";
import { NewWorkoutDialog } from "./new-workout-dialog";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const list = await db.select().from(workouts).orderBy(desc(workouts.createdAt));

  return (
    <div className="space-y-4">
      <PageHeader title="Treinos" action={<NewWorkoutDialog />} />

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhum treino ainda. Crie modelos de academia, corrida ou bike e adicione os
            exercícios.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {list.map((workout) => {
            const type = workout.type as WorkoutType;
            const Icon = workoutIcon(type);
            return (
              <li key={workout.id}>
                <Link href={`/workouts/${workout.id}`}>
                  <Card className="transition-colors hover:border-primary/50">
                    <CardContent className="flex items-center gap-3 py-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{workout.name}</p>
                        <p className="text-xs text-muted-foreground">{workoutLabel(type)}</p>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
