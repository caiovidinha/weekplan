import { eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { foods } from "@/db/schema";
import { CustomFoodDialog } from "./custom-food-dialog";
import { DeleteFoodButton } from "./delete-food-button";

export const dynamic = "force-dynamic";

export default async function FoodsPage() {
  const custom = await db
    .select()
    .from(foods)
    .where(eq(foods.source, "custom"))
    .orderBy(foods.name);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Alimentos"
        subtitle="Seus alimentos personalizados"
        action={
          <Button asChild variant="ghost" size="icon">
            <Link href="/nutrition" aria-label="Voltar">
              <ChevronLeft />
            </Link>
          </Button>
        }
      />

      <div className="flex justify-end">
        <CustomFoodDialog />
      </div>

      {custom.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhum alimento personalizado ainda. A base TACO (597 alimentos) já está
            disponível na busca da Nutrição.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {custom.map((food) => (
            <li key={food.id}>
              <Card>
                <CardContent className="flex items-center gap-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.kcal ?? 0} kcal · P {food.protein ?? 0} · C {food.carbs ?? 0} · G{" "}
                      {food.fat ?? 0} (por 100g)
                    </p>
                  </div>
                  <DeleteFoodButton id={food.id} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
