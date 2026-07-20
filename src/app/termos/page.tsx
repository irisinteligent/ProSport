import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Termos de Uso · ProSport",
  description: "Termos de Uso da plataforma ProSport (prosport.ia.br).",
};

const ATUALIZACAO = "3 de julho de 2026";

export default function TermosPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container max-w-3xl flex-1 py-12">
        <h1 className="font-headline text-3xl font-bold">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {ATUALIZACAO}</p>

        <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-base leading-relaxed [&_h2]:font-headline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8">
          <section>
            <h2>1. Sobre a ProSport</h2>
            <p>
              A ProSport (prosport.ia.br) é uma plataforma online que gera, com auxílio de
              inteligência artificial, páginas esportivas profissionais ("Sport Pages") e materiais
              de apresentação para atletas, além de canais de divulgação dessas páginas para
              empresas, clubes e imprensa, conforme o plano contratado. Ao criar uma conta ou usar
              a plataforma, você concorda com estes Termos.
            </p>
          </section>

          <section>
            <h2>2. Cadastro e conta</h2>
            <p>
              Para usar a plataforma você deve fornecer informações verdadeiras e manter seus dados
              de acesso em sigilo. Você é responsável pelas atividades realizadas na sua conta.
              Menores de 18 anos só podem usar a plataforma com autorização e supervisão dos pais ou
              responsáveis legais, que respondem pela contratação.
            </p>
          </section>

          <section>
            <h2>3. Planos, pagamento e cancelamento</h2>
            <p>
              A ProSport é oferecida por assinatura (mensal ou anual), com cobrança processada pela
              Stripe. A assinatura renova automaticamente ao fim de cada ciclo, até que seja
              cancelada. Você pode cancelar a qualquer momento pelo portal de assinatura
              ("Gerenciar assinatura"); o acesso permanece ativo até o fim do período já pago e não
              há reembolso proporcional do período em curso, salvo o direito de arrependimento
              abaixo.
            </p>
            <p>
              <strong>Direito de arrependimento (art. 49 do CDC):</strong> na primeira contratação
              de um plano, você pode desistir em até 7 (sete) dias corridos após o pagamento e
              receber reembolso integral. Basta solicitar pelo e-mail de contato indicado ao final
              destes Termos.
            </p>
            <p>
              Os preços vigentes são os exibidos na página de planos no momento da contratação e
              podem ser reajustados para ciclos futuros, com aviso prévio.
            </p>
          </section>

          <section>
            <h2>4. Conteúdo do atleta e licença de uso de imagem</h2>
            <p>
              As fotos, dados esportivos e demais conteúdos que você envia continuam sendo seus.
              Ao enviá-los, você concede à ProSport uma licença não exclusiva para armazenar,
              processar (inclusive com ferramentas de IA, como composição de foto e cenário), exibir
              na sua Sport Page pública e divulgar a terceiros (empresas, clubes e imprensa),
              conforme o plano contratado. Essa licença termina quando o conteúdo ou a conta forem
              excluídos, exceto por cópias já distribuídas a terceiros a seu pedido.
            </p>
            <p>
              Você declara ter o direito de usar as imagens e informações enviadas e que elas não
              violam direitos de terceiros.
            </p>
          </section>

          <section>
            <h2>5. Conteúdo gerado por IA</h2>
            <p>
              As Sport Pages e apresentações são geradas por inteligência artificial a partir dos
              dados fornecidos e podem conter imprecisões. Revise o conteúdo antes de divulgá-lo.
              A ProSport não garante a obtenção de patrocínio, contrato ou qualquer resultado
              comercial — a plataforma é uma ferramenta de apresentação e divulgação.
            </p>
          </section>

          <section>
            <h2>6. Uso proibido</h2>
            <p>
              É proibido usar a plataforma para conteúdo ilícito, difamatório, discriminatório ou
              que viole direitos de terceiros; enviar e-mails pela plataforma com finalidade de
              spam ou phishing; tentar burlar limites técnicos ou de plano; ou usar dados de outros
              usuários sem autorização. Contas em violação podem ser suspensas ou encerradas.
            </p>
          </section>

          <section>
            <h2>7. Marca e propriedade intelectual</h2>
            <p>
              A marca ProSport, o logotipo, o nome de domínio prosport.ia.br, o layout da
              plataforma, os templates das Sport Pages, os textos institucionais e o software que
              opera o serviço são de titularidade exclusiva da ProSport e protegidos pela
              legislação de propriedade intelectual (Lei 9.279/96 e Lei 9.610/98). É proibida a
              reprodução, imitação ou uso desses elementos — inclusive do nome "ProSport" em
              produtos, serviços, domínios ou perfis — sem autorização prévia e por escrito.
              O conteúdo enviado pelos atletas permanece de titularidade deles, nos termos da
              seção 4.
            </p>
          </section>

          <section>
            <h2>8. Disponibilidade e alterações</h2>
            <p>
              Trabalhamos para manter a plataforma disponível, mas não garantimos operação
              ininterrupta. Funcionalidades identificadas como "em breve" ou "em desenvolvimento"
              nas páginas de planos ainda não estão disponíveis e não integram a oferta contratada —
              quando lançadas, serão incluídas nos planos indicados sem custo adicional. Podemos
              atualizar estes Termos; mudanças relevantes serão comunicadas e valem a partir da
              publicação.
            </p>
          </section>

          <section>
            <h2>9. Privacidade</h2>
            <p>
              O tratamento de dados pessoais é descrito na nossa{" "}
              <Link href="/privacidade" className="underline underline-offset-4">
                Política de Privacidade
              </Link>
              , que integra estes Termos.
            </p>
          </section>

          <section>
            <h2>10. Lei aplicável e contato</h2>
            <p>
              Estes Termos são regidos pelas leis brasileiras, incluindo o Código de Defesa do
              Consumidor e a LGPD. Dúvidas, solicitações e pedidos de reembolso: {" "}
              <a href="mailto:contato@prosport.ia.br" className="underline underline-offset-4">
                contato@prosport.ia.br
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
