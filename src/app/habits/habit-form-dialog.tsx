"use client";

import { Pencil, Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HABIT_ICON_KEYS, habitIcon } from "@/lib/habit-icons";
import { cn } from "@/lib/utils";
import { createHabit, updateHabit } from "./actions";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

type HabitData = {
  id: number;
  name: string;
  icon: string | null;
  weekdays: number[];
};

export function HabitFormDialog({ habit }: { habit?: HabitData }) {
  const editing = Boolean(habit);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(habit?.name ?? "");
  const [icon, setIcon] = useState(habit?.icon ?? "target");
  const [weekdays, setWeekdays] = useState<number[]>(habit?.weekdays ?? [0, 1, 2, 3, 4, 5, 6]);
  const [pending, start] = useTransition();

  function toggleDay(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || weekdays.length === 0) return;
    start(async () => {
      if (editing && habit) {
        await updateHabit({ id: habit.id, name: name.trim(), icon, weekdays });
      } else {
        await createHabit({ name: name.trim(), icon, weekdays });
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="ghost" size="icon" aria-label="Editar">
            <Pencil />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> Novo hábito
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar hábito" : "Novo hábito"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="habit-name">Nome</Label>
            <Input
              id="habit-name"
              value={name}
              autoFocus
              placeholder="Ex: Beber 3L de água"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICON_KEYS.map((key) => {
                const Icon = habitIcon(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg border transition-colors",
                      icon === key
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Dias da semana</Label>
            <div className="flex justify-between gap-1">
              {WEEKDAYS.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "size-9 rounded-full text-sm font-medium transition-colors",
                    weekdays.includes(day)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
