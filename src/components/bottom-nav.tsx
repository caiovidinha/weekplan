"use client";

import { CalendarDays, Dumbbell, Home, ListChecks, Utensils } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Hoje", icon: Home },
  { href: "/calendar", label: "Semana", icon: CalendarDays },
  { href: "/nutrition", label: "Nutrição", icon: Utensils },
  { href: "/habits", label: "Hábitos", icon: ListChecks },
  { href: "/workouts", label: "Treinos", icon: Dumbbell },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-safe">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "fill-primary/15")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
