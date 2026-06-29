"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Food } from "@/db/schema";
import { macrosForGrams } from "@/lib/nutrition";
import { MEAL_LABELS } from "@/lib/nutrition";
import { addFoodLog, searchFoods } from "./actions";

export function AddFoodDialog({ date, meal }: { date: string; meal: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState("100");
  const [searching, startSearch] = useTransition();
  const [saving, startSave] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounce.current = setTimeout(() => {
      startSearch(async () => {
        setResults(await searchFoods(query));
      });
    }, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  function reset() {
    setQuery("");
    setResults([]);
    setSelected(null);
    setGrams("100");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleAdd() {
    if (!selected) return;
    const g = Number(grams);
    if (!Number.isFinite(g) || g <= 0) return;
    startSave(async () => {
      await addFoodLog({ date, meal: meal as never, foodId: selected.id, grams: g });
      handleOpenChange(false);
    });
  }

  const preview = selected ? macrosForGrams(selected, Number(grams) || 0) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Plus /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className={selected ? undefined : "h-[80dvh] overflow-hidden"}>
        <DialogHeader>
          <DialogTitle>{MEAL_LABELS[meal] ?? "Refeição"}</DialogTitle>
        </DialogHeader>

        {selected ? (
          <div className="space-y-4">
            <div>
              <p className="font-medium">{selected.name}</p>
              {selected.category ? (
                <p className="text-xs text-muted-foreground">{selected.category}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Quantidade (g)</label>
              <Input
                type="number"
                inputMode="decimal"
                value={grams}
                autoFocus
                onChange={(e) => setGrams(e.target.value)}
              />
            </div>
            {preview ? (
              <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/50 p-3 text-center text-sm">
                <Stat label="kcal" value={preview.kcal} />
                <Stat label="P" value={preview.protein} />
                <Stat label="C" value={preview.carbs} />
                <Stat label="G" value={preview.fat} />
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setSelected(null)}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={handleAdd} disabled={saving}>
                {saving ? "Salvando…" : "Adicionar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alimento (ex: arroz, frango)…"
                className="pl-9"
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {searching ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Buscando…</p>
              ) : null}
              {!searching && query.trim().length >= 2 && results.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nada encontrado.
                </p>
              ) : null}
              {results.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => setSelected(food)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{food.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {food.kcal ?? 0} kcal/100g · {food.category ?? "—"}
                    </span>
                  </span>
                  <Plus className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
