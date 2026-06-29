import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/** A calendar date with no time component, e.g. "2026-06-28". */
export type ISODate = string;

/** Today's local date as an ISO date string (no timezone surprises). */
export function todayISO(): ISODate {
  return format(new Date(), "yyyy-MM-dd");
}

export function toISODate(date: Date): ISODate {
  return format(date, "yyyy-MM-dd");
}

export function fromISODate(date: ISODate): Date {
  return parseISO(date);
}

export function shiftISO(date: ISODate, days: number): ISODate {
  return toISODate(addDays(fromISODate(date), days));
}

/** Weekday index for an ISO date: 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: ISODate): number {
  return fromISODate(date).getDay();
}

/** The 7 ISO dates of the week containing `date`, Monday-first. */
export function weekDays(date: ISODate): ISODate[] {
  const base = fromISODate(date);
  const start = startOfWeek(base, { weekStartsOn: 1 });
  const end = endOfWeek(base, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(toISODate);
}

export function formatHuman(date: ISODate): string {
  return format(fromISODate(date), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatShort(date: ISODate): string {
  return format(fromISODate(date), "d MMM", { locale: ptBR });
}

export function formatWeekdayShort(date: ISODate): string {
  return format(fromISODate(date), "EEEEEE", { locale: ptBR });
}

export function formatDayNumber(date: ISODate): string {
  return format(fromISODate(date), "d");
}
