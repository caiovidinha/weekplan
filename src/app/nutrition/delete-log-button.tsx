"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deleteFoodLog } from "./actions";

export function DeleteLogButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Remover"
      disabled={pending}
      onClick={() => start(() => deleteFoodLog(id))}
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive disabled:opacity-40"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
