"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteHabit } from "./actions";

export function DeleteHabitButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Remover"
      disabled={pending}
      onClick={() => start(() => deleteHabit(id))}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 />
    </Button>
  );
}
