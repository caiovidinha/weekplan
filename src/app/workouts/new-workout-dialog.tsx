"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WORKOUT_TYPES, type WorkoutType } from "@/lib/workouts";
import { createWorkout } from "./actions";

export function NewWorkoutDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<WorkoutType>("gym");
  const [description, setDescription] = useState("");
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    start(async () => {
      const id = await createWorkout({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
      });
      setOpen(false);
      router.push(`/workouts/${id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Novo treino
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo treino</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="w-name">Nome</Label>
            <Input
              id="w-name"
              value={name}
              autoFocus
              placeholder="Ex: Treino A - Peito e tríceps"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="w-type">Tipo</Label>
            <Select
              id="w-type"
              value={type}
              onChange={(e) => setType(e.target.value as WorkoutType)}
            >
              {WORKOUT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="w-desc">Descrição (opcional)</Label>
            <Textarea
              id="w-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Criando…" : "Criar e adicionar exercícios"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
