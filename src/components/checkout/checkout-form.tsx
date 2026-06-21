'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { updateUserPlan } from '@/lib/user-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AmexIcon, EloIcon, MastercardIcon, VisaIcon } from '@/components/icons/credit-cards';

const planDetails = {
  basic:   { name: 'Basico',   monthlyPrice: 9.90,    annualPrice: 99.90 },
  plus:    { name: 'Plus',     monthlyPrice: 29.90,   annualPrice: 299.90 },
  premium: { name: 'Premium',  monthlyPrice: 59.90,   annualPrice: 599.90 },
  pro:     { name: 'Pro',      monthlyPrice: 2000.00, annualPrice: 20000.00 },
};

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  const plan = searchParams.get('plan') as keyof typeof planDetails | null;

  if (!plan || !planDetails[plan]) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plano nao encontrado</CardTitle>
          <CardDescription>Por favor, selecione um plano valido.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/plans')}>Ver Planos</Button>
        </CardFooter>
      </Card>
    );
  }

  const details = planDetails[plan];
  const totalPrice = isAnnual ? details.annualPrice : details.monthlyPrice;
  const isCompanyPlan = plan === 'pro';

  const handleSubscription = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Faca login primeiro', description: 'Voce precisa estar logado para assinar um plano.' });
      router.push('/athlete/login');
      return;
    }
    setLoading(true);
    try {
      // TODO: Integrar Mercado Pago / Stripe aqui antes de atualizar o plano
      const planKey = isCompanyPlan ? 'premium' : (plan as 'basic' | 'plus' | 'premium');
      await updateUserPlan(user.uid, planKey);

      toast({
        title: 'Inscricao realizada!',
        description: `Bem-vindo ao plano ${details.name}. Redirecionando...`,
      });
      router.push(isCompanyPlan ? '/company/dashboard' : '/dashboard');
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erro', description: 'Nao foi possivel processar a inscricao.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Finalize sua Assinatura</CardTitle>
            <CardDescription>Voce esta a um passo de impulsionar sua carreira.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-lg">Plano Selecionado</h3>
              <p className="text-primary font-bold text-xl">{details.name}</p>
            </div>
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <Label htmlFor="billing-frequency" className="flex flex-col">
                <span>Mensal</span>
                <span className="font-bold">R$ {details.monthlyPrice.toFixed(2)}</span>
              </Label>
              <Switch id="billing-frequency" checked={isAnnual} onCheckedChange={setIsAnnual} />
              <Label htmlFor="billing-frequency" className="flex flex-col">
                <span>Anual</span>
                <span className="font-bold">R$ {details.annualPrice.toFixed(2)}</span>
                {!isCompanyPlan && <span className="text-xs text-green-400">Economize 2 meses!</span>}
              </Label>
            </div>
            <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Pagamento:</strong> Integracao com Mercado Pago em breve. Por ora, o plano e ativado diretamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados de Pagamento</CardTitle>
            <CardDescription>Aceitamos os principais cartoes de credito.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-2">
              <VisaIcon /><MastercardIcon /><AmexIcon /><EloIcon />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-number">Numero do Cartao</Label>
              <Input id="card-number" placeholder="0000 0000 0000 0000" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade</Label>
                <Input id="expiry" placeholder="MM/AA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-name">Nome no Cartao</Label>
              <Input id="card-name" placeholder="Nome completo" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {totalPrice.toFixed(2)}/{isAnnual ? 'ano' : 'mes'}</span>
            </div>
            <Button className="w-full font-headline" size="lg" onClick={handleSubscription} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Assinar Agora
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
