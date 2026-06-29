"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteWorkout } from "../actions";

export function DeleteWorkoutButton({ id }: { id: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Excluir treino"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await deleteWorkout(id);
          router.push("/workouts");
        })
      }
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 />
    </Button>
  );
}
