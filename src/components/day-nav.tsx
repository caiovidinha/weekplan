import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatHuman, shiftISO, todayISO, type ISODate } from "@/lib/date";

export function DayNav({ basePath, date }: { basePath: string; date: ISODate }) {
  const prev = shiftISO(date, -1);
  const next = shiftISO(date, 1);
  const today = todayISO();
  const isToday = date === today;

  return (
    <div className="flex items-center justify-between gap-2">
      <Button asChild variant="ghost" size="icon">
        <Link href={`${basePath}?d=${prev}`} aria-label="Dia anterior">
          <ChevronLeft />
        </Link>
      </Button>
      <div className="text-center">
        <p className="text-sm font-medium capitalize">{isToday ? "Hoje" : formatHuman(date)}</p>
        {!isToday ? (
          <Link href={basePath} className="text-xs text-primary">
            voltar para hoje
          </Link>
        ) : (
          <p className="text-xs capitalize text-muted-foreground">{formatHuman(date)}</p>
        )}
      </div>
      <Button asChild variant="ghost" size="icon">
        <Link href={`${basePath}?d=${next}`} aria-label="Próximo dia">
          <ChevronRight />
        </Link>
      </Button>
    </div>
  );
}
