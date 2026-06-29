"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteFoodLog, updateFoodLog } from "./actions";

export type FoodLogItemData = {
  id: number;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function FoodLogItem({ log }: { log: FoodLogItemData }) {
  const [open, setOpen] = useState(false);
  const [grams, setGrams] = useState(String(Math.round(log.grams)));
  const [pending, start] = useTransition();

  function handleSave() {
    const g = Number(grams);
    if (!Number.isFinite(g) || g <= 0) return;
    start(async () => {
      await updateFoodLog({ id: log.id, grams: g });
      setOpen(false);
    });
  }

  return (
    <li className="flex items-center gap-2 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{log.name}</p>
        <p className="text-xs text-muted-foreground">
          {Math.round(log.grams)}g · {Math.round(log.kcal)} kcal · P {log.protein} · C{" "}
          {log.carbs} · G {log.fat}
        </p>
      </div>

      <button
        type="button"
        aria-label="Editar"
        onClick={() => {
          setGrams(String(Math.round(log.grams)));
          setOpen(true);
        }}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Remover"
        disabled={pending}
        onClick={() => start(() => deleteFoodLog(log.id))}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive disabled:opacity-40"
      >
        <Trash2 className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{log.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`grams-${log.id}`}>Quantidade (g)</Label>
              <Input
                id={`grams-${log.id}`}
                type="number"
                inputMode="decimal"
                value={grams}
                autoFocus
                onChange={(e) => setGrams(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={pending}>
              {pending ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}
