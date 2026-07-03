
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";
import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  /**
   * Recursos ainda em desenvolvimento — exibidos SEPARADOS dos recursos
   * incluídos, com rótulo explícito, para não vender o que ainda não existe
   * (CDC: oferta vincula). Quando lançados, entram no plano sem custo extra.
   */
  comingSoon?: string[];
  cta: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "Básico",
    price: "R$ 29,90/mês",
    description: "O atleta recebe o link da sportpage e ele mesmo envia para empresas e patrocinadores.",
    features: [
      "Página Esportiva Padrão (Markdown)",
      "Link compartilhável",
      "Geração de apresentação para patrocinadores",
    ],
    cta: "Começar com o Básico",
  },
  {
    id: "plus",
    name: "Plus",
    price: "R$ 49,90/mês",
    description: "O atleta e a ProSport enviam o link da sportpage para empresas e clubes parceiros.",
    features: [
      "Tudo do plano Básico",
      "Página Esportiva Plus com design moderno",
      "Upload de foto de perfil",
      "Layout Plus",
      "Divulgação para empresas e clubes",
    ],
    cta: "Escolher Plano Plus",
    featured: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 79,90/mês",
    description: "Envio de links para empresas, clubes e para a grande mídia (TV, revistas, jornais).",
    features: [
      "Tudo do plano Plus",
      "Inclusão de Vídeo do YouTube",
      "Divulgação para mídias de TV e jornais",
      "Suporte Prioritário",
    ],
    comingSoon: [
      "Análise de Patrocinador",
      "Geração de Mídia com IA",
    ],
    cta: "Tornar-se Premium",
  },
];

export default function PlansPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <section className="container flex flex-col items-center gap-6 py-12 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-headline text-4xl font-bold md:text-5xl">
              Nossos Planos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Escolha o plano que melhor se adapta à sua jornada e comece a atrair os patrocinadores certos.
            </p>
          </div>
          <div className="grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col ${plan.featured ? "border-primary shadow-2xl" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="font-headline">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.comingSoon && (
                    <div className="rounded-md border border-dashed p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Em desenvolvimento
                      </p>
                      <ul className="mt-2 space-y-2">
                        {plan.comingSoon.map((feature) => (
                          <li key={feature} className="flex items-start text-muted-foreground">
                            <Clock className="mr-2 mt-1 h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Ainda não disponíveis — entram no plano sem custo extra quando lançarem.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full font-headline" variant={plan.featured ? "default" : "outline"}>
                    <Link href={`/checkout?plan=${plan.id}`}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Assinatura com renovação automática — cancele quando quiser. Veja os{" "}
            <Link href="/termos" className="underline underline-offset-4">Termos de Uso</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
