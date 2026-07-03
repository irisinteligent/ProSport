import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Política de Privacidade · ProSport",
  description: "Como a ProSport trata dados pessoais (LGPD).",
};

const ATUALIZACAO = "3 de julho de 2026";

export default function PrivacidadePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container max-w-3xl flex-1 py-12">
        <h1 className="font-headline text-3xl font-bold">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {ATUALIZACAO}</p>

        <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-base leading-relaxed [&_h2]:font-headline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8">
          <section>
            <h2>1. Quem somos</h2>
            <p>
              Esta política explica como a ProSport (prosport.ia.br), na condição de controladora,
              trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei
              13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2>2. Dados que coletamos</h2>
            <p>
              <strong>Cadastro:</strong> nome ou razão social, e-mail e senha (armazenada de forma
              criptografada pelo Firebase Authentication). Contas de empresa incluem CNPJ, tipo de
              patrocínio e modalidade de interesse.
            </p>
            <p>
              <strong>Perfil do atleta:</strong> foto, modalidade, conquistas, data de nascimento,
              equipe, contato e redes sociais — dados fornecidos por você para gerar a Sport Page.
            </p>
            <p>
              <strong>Pagamento:</strong> processado integralmente pela Stripe. A ProSport não
              armazena números de cartão; guardamos apenas identificadores da assinatura (status e
              plano).
            </p>
            <p>
              <strong>Uso:</strong> registros técnicos (logs) necessários à operação e segurança da
              plataforma, e um cookie de sessão essencial para manter você conectado.
            </p>
          </section>

          <section>
            <h2>3. Para que usamos</h2>
            <p>
              Usamos os dados para: criar e manter sua conta (execução de contrato); gerar sua
              Sport Page e materiais com IA (execução de contrato); publicar sua Sport Page em link
              público e divulgá-la a empresas, clubes e imprensa conforme o plano contratado
              (execução de contrato e consentimento manifestado na contratação); enviar e-mails
              transacionais como confirmação de cadastro e envio a patrocinadores (execução de
              contrato); e cumprir obrigações legais e fiscais.
            </p>
            <p>
              <strong>Atenção:</strong> a Sport Page é, por natureza, uma página pública — qualquer
              pessoa com o link pode acessá-la. Não inclua nela informações que não queira tornar
              públicas.
            </p>
          </section>

          <section>
            <h2>4. Com quem compartilhamos</h2>
            <p>
              Compartilhamos dados apenas com operadores necessários ao serviço: Google Firebase
              (autenticação, banco de dados e armazenamento de fotos), Vercel (hospedagem), Stripe
              (pagamentos), Resend (envio de e-mails), Google Gemini e fal.ai (geração de conteúdo e
              composição de imagem por IA). Esses provedores podem processar dados fora do Brasil,
              com salvaguardas contratuais adequadas. Não vendemos dados pessoais.
            </p>
          </section>

          <section>
            <h2>5. Retenção e segurança</h2>
            <p>
              Mantemos os dados enquanto a conta existir ou enquanto forem necessários para
              obrigações legais. Ao excluir a conta, os dados de perfil e as Sport Pages são
              removidos em prazo razoável, salvo retenção exigida por lei. Adotamos medidas técnicas
              de segurança como criptografia em trânsito, sessões protegidas e controle de acesso.
            </p>
          </section>

          <section>
            <h2>6. Seus direitos (LGPD)</h2>
            <p>
              Você pode solicitar a qualquer momento: confirmação de tratamento, acesso, correção,
              anonimização, portabilidade, exclusão de dados, informação sobre compartilhamentos e
              revogação de consentimento. Para exercer esses direitos, escreva para{" "}
              <a href="mailto:contato@prosport.ia.br" className="underline underline-offset-4">
                contato@prosport.ia.br
              </a>
              . Responderemos nos prazos da LGPD. Você também pode peticionar à ANPD.
            </p>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>
              Usamos apenas um cookie essencial de sessão (httpOnly) para autenticação. Não usamos
              cookies de publicidade ou rastreamento de terceiros.
            </p>
          </section>

          <section>
            <h2>8. Alterações</h2>
            <p>
              Esta política pode ser atualizada; mudanças relevantes serão comunicadas na
              plataforma. Veja também nossos{" "}
              <Link href="/termos" className="underline underline-offset-4">
                Termos de Uso
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
