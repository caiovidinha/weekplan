"use client";

import { Plus } from "lucide-react";
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
import { createCustomFood } from "../nutrition/actions";

const numericFields = [
  { key: "kcal", label: "Calorias (kcal)" },
  { key: "protein", label: "Proteína (g)" },
  { key: "carbs", label: "Carboidrato (g)" },
  { key: "fat", label: "Gordura (g)" },
] as const;

export function CustomFoodDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) {
      setError("Informe um nome.");
      return;
    }
    start(async () => {
      try {
        await createCustomFood({
          name,
          category: String(fd.get("category") ?? "") || undefined,
          kcal: Number(fd.get("kcal") ?? 0),
          protein: Number(fd.get("protein") ?? 0),
          carbs: Number(fd.get("carbs") ?? 0),
          fat: Number(fd.get("fat") ?? 0),
        });
        setOpen(false);
      } catch {
        setError("Não foi possível salvar. Verifique os valores.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Novo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo alimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-xs text-muted-foreground">Valores por 100g.</p>
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" autoFocus placeholder="Ex: Whey baunilha" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Input id="category" name="category" placeholder="Ex: Suplementos" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {numericFields.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key}>{label}</Label>
                <Input id={key} name={key} type="number" inputMode="decimal" defaultValue="0" />
              </div>
            ))}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
