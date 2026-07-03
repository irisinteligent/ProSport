// Fonte única dos planos pagos — usada tanto pela UI de checkout quanto
// pela criação da Checkout Session do Stripe (preço em centavos, BRL).
// Mudar preço aqui é o único lugar que precisa mudar.

export type PlanId = "basic" | "plus" | "premium" | "pro";

export interface PlanDetails {
  id: PlanId;
  name: string;
  role: "athlete" | "company";
  monthlyPriceCents: number;
  annualPriceCents: number;
}

export const PLAN_DETAILS: Record<PlanId, PlanDetails> = {
  // Anual = 10x o mensal (2 meses grátis) — vale para todos os planos,
  // coerente com o "Economize 2 meses!" exibido no checkout.
  basic: { id: "basic", name: "Básico", role: "athlete", monthlyPriceCents: 2990, annualPriceCents: 29900 },
  plus: { id: "plus", name: "Plus", role: "athlete", monthlyPriceCents: 4990, annualPriceCents: 49900 },
  premium: { id: "premium", name: "Premium", role: "athlete", monthlyPriceCents: 7990, annualPriceCents: 79900 },
  pro: { id: "pro", name: "Pro", role: "company", monthlyPriceCents: 200000, annualPriceCents: 2000000 },
};

export function isPlanId(value: string): value is PlanId {
  return value in PLAN_DETAILS;
}

export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
