"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateGoals } from "../actions";

type Goals = { kcal: number; protein: number; carbs: number; fat: number };

export function GoalsForm({ initial }: { initial: Goals }) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function set(key: keyof Goals, value: string) {
    setValues((v) => ({ ...v, [key]: Number(value) }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await updateGoals(values);
      setSaved(true);
    });
  }

  const fields: { key: keyof Goals; label: string; unit: string }[] = [
    { key: "kcal", label: "Calorias", unit: "kcal" },
    { key: "protein", label: "Proteína", unit: "g" },
    { key: "carbs", label: "Carboidrato", unit: "g" },
    { key: "fat", label: "Gordura", unit: "g" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ key, label, unit }) => (
        <div key={key} className="space-y-1">
          <Label htmlFor={key}>
            {label} ({unit})
          </Label>
          <Input
            id={key}
            type="number"
            inputMode="numeric"
            value={values[key]}
            onChange={(e) => set(key, e.target.value)}
          />
        </div>
      ))}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando…" : saved ? "Salvo ✓" : "Salvar metas"}
      </Button>
    </form>
  );
}
