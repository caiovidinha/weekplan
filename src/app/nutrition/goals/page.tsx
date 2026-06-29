import { ChevronLeft, Utensils } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { nutritionGoals } from "@/db/schema";
import { GoalsForm } from "./goals-form";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const [goals] = await db.select().from(nutritionGoals).limit(1);
  const initial = goals ?? { kcal: 2000, protein: 150, carbs: 200, fat: 60 };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Metas diárias"
        subtitle="Seus alvos de calorias e macros"
        action={
          <Button asChild variant="ghost" size="icon">
            <Link href="/nutrition" aria-label="Voltar">
              <ChevronLeft />
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-4">
          <GoalsForm initial={initial} />
        </CardContent>
      </Card>
      <Button asChild variant="outline" className="w-full">
        <Link href="/foods">
          <Utensils /> Gerenciar alimentos personalizados
        </Link>
      </Button>
    </div>
  );
}
