export type EventType = "workout" | "meal" | "task" | "appointment" | "other";

export const EVENT_TYPES: { value: EventType; label: string; colorVar: string }[] = [
  { value: "task", label: "Tarefa", colorVar: "--primary" },
  { value: "workout", label: "Treino", colorVar: "--protein" },
  { value: "meal", label: "Refeição", colorVar: "--carbs" },
  { value: "appointment", label: "Compromisso", colorVar: "--fat" },
  { value: "other", label: "Outro", colorVar: "--muted-foreground" },
];

const MAP = new Map(EVENT_TYPES.map((t) => [t.value, t]));

export function eventLabel(type: EventType): string {
  return MAP.get(type)?.label ?? "Evento";
}

export function eventColorVar(type: EventType): string {
  return MAP.get(type)?.colorVar ?? "--primary";
}

/** "HH:MM:SS" -> "HH:MM"; null -> "". */
export function formatTime(time: string | null): string {
  if (!time) return "";
  return time.slice(0, 5);
}
