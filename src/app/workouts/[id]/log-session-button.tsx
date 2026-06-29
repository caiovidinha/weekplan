"use client";

import { CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { todayISO } from "@/lib/date";
import { logWorkoutSession } from "../actions";

export function LogSessionButton({ workoutId }: { workoutId: number }) {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      await logWorkoutSession({ workoutId, date: todayISO() });
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    });
  }

  return (
    <Button onClick={handleClick} disabled={pending} className="w-full">
      <CheckCircle2 />
      {pending ? "Registrando…" : done ? "Registrado ✓" : "Marcar como feito hoje"}
    </Button>
  );
}
