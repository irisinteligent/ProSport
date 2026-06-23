
'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/lib/checkout-actions';
import { PLAN_DETAILS, formatCentsToBRL, type PlanId } from '@/lib/plans';
import { AmexIcon, EloIcon, MastercardIcon, VisaIcon } from '@/components/icons/credit-cards';
import { Loader2 } from 'lucide-react';

function isPlanIdParam(value: string | null): value is PlanId {
  return !!value && value in PLAN_DETAILS;
}

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const planParam = searchParams.get('plan');
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isPlanIdParam(planParam)) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Plano não encontrado</CardTitle>
                <CardDescription>Por favor, selecione um plano válido.</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button onClick={() => router.push('/plans')}>Ver Planos</Button>
            </CardFooter>
        </Card>
    );
  }

  const plan = planParam;
  const details = PLAN_DETAILS[plan];
  const totalPriceCents = isAnnual ? details.annualPriceCents : details.monthlyPriceCents;
  const isCompanyPlan = details.role === 'company';

  const handleCheckout = () => {
    startTransition(async () => {
      const result = await createCheckoutSession({ planId: plan, isAnnual });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Não foi possível continuar",
          description: result.error,
        });
        if (result.error === "Você precisa estar logado.") {
          router.push(isCompanyPlan ? "/company/login" : "/athlete/login");
        }
        return;
      }

      window.location.href = result.url;
    });
  };

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Finalize sua Assinatura</CardTitle>
            <CardDescription>Você está a um passo de impulsionar sua carreira ou encontrar novos talentos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-bold text-lg">Plano Selecionado</h3>
                <p className="text-primary font-bold text-xl">{details.name}</p>
            </div>
            <div className="flex items-center space-x-4 rounded-lg border p-4">
                <Label htmlFor="billing-frequency" className="flex flex-col">
                  <span>Mensal</span>
                  <span className="font-bold">R$ {formatCentsToBRL(details.monthlyPriceCents)}</span>
                </Label>
                <Switch
                    id="billing-frequency"
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                    aria-label="Alterar para cobrança anual"
                />
                <Label htmlFor="billing-frequency" className="flex flex-col">
                  <span>Anual</span>
                  <span className="font-bold">R$ {formatCentsToBRL(details.annualPriceCents)}</span>
                  { !isCompanyPlan && <span className="text-xs text-green-400">Economize 2 meses!</span>}
                </Label>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
                <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {formatCentsToBRL(totalPriceCents)}</span>
                </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Pagamento seguro</CardTitle>
                <div className="flex items-center gap-2">
                    <VisaIcon className="h-6" />
                    <MastercardIcon className="h-6" />
                    <AmexIcon className="h-6" />
                    <EloIcon className="h-6" />
                </div>
            </div>
            <CardDescription>
              Cartão de crédito ou PIX, processado pelo Stripe. Você será redirecionado para um ambiente de pagamento seguro — nenhum dado de cartão passa pelos nossos servidores.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full font-headline" onClick={handleCheckout} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assinar Agora
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
