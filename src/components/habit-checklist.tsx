"use client";

import { Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import { toggleHabit } from "@/app/habits/actions";
import { habitIcon } from "@/lib/habit-icons";
import { cn } from "@/lib/utils";

export type ChecklistItem = {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  done: boolean;
};

export function HabitChecklist({
  date,
  items,
}: {
  date: string;
  items: ChecklistItem[];
}) {
  const [optimistic, setOptimistic] = useOptimistic(items);
  const [, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">Nenhum hábito para este dia.</p>
    );
  }

  function toggle(item: ChecklistItem) {
    const done = !item.done;
    startTransition(async () => {
      setOptimistic((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, done } : i)),
      );
      await toggleHabit({ habitId: item.id, date, done });
    });
  }

  return (
    <ul className="space-y-1">
      {optimistic.map((item) => {
        const Icon = habitIcon(item.icon);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  item.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {item.done ? <Check className="size-5" /> : <Icon className="size-5" />}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.done && "text-muted-foreground line-through",
                )}
              >
                {item.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
