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

/** The app's reference timezone — everything is "today" in Brasília. */
export const APP_TIMEZONE = "America/Sao_Paulo";

/**
 * Today's date in the app timezone as an ISO date string. Uses `Intl` with a
 * fixed timezone so it's correct regardless of where the code runs (e.g. a
 * Vercel function in UTC). The `en-CA` locale formats as `YYYY-MM-DD`.
 */
export function todayISO(): ISODate {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(new Date());
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
