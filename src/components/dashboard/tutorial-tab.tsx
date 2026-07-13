import {
  Camera,
  CheckCircle2,
  Eye,
  HeartHandshake,
  Lightbulb,
  ListChecks,
  Megaphone,
  Trophy,
  Video,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Aba "Tutorial & Dicas" do painel do atleta — conteúdo estático que ensina a
 * criar uma Sport Page forte e a usá-la para conquistar patrocínio.
 */

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
      <span className="text-sm leading-relaxed">{children}</span>
    </li>
  );
}

function Avoid({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
      <span className="text-sm leading-relaxed">{children}</span>
    </li>
  );
}

export function TutorialTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Como criar uma Sport Page que conquista patrocinadores
          </CardTitle>
          <CardDescription>
            A qualidade da sua página depende do que você conta pra gente. Quanto mais completo e
            verdadeiro o seu perfil, mais profissional fica o resultado — e mais fácil um
            patrocinador dizer sim.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-headline flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              1. Antes de começar, reúna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              <Tip>
                <b>Sua melhor foto</b> — de preferência de corpo inteiro, com o uniforme/kimono da
                sua modalidade, boa luz e rosto visível. É ela que vira a capa da página.
              </Tip>
              <Tip>
                <b>Lista de conquistas com ano</b> — títulos, pódios, convocações, graduações.
                Escreva uma por linha, ex.: <i>2024 — Campeão Estadual peso-pena</i>. Elas viram a
                sua linha do tempo.
              </Tip>
              <Tip>
                <b>Seus números</b> — anos de treino, quantidade de lutas/jogos, seguidores. Números
                reais dão credibilidade.
              </Tip>
              <Tip>
                <b>Um vídeo de destaque no YouTube</b> (planos Plus/Premium) — seu melhor momento em
                30–90 segundos vale mais que mil palavras.
              </Tip>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-headline flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              2. Capriche em cada campo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              <Tip>
                <b>Detalhes sobre você</b>: conte sua história — como começou, rotina de treinos,
                estilo de jogo/luta, objetivos para a temporada. A IA escreve a sua bio a partir
                disso: quanto mais contexto, melhor o texto.
              </Tip>
              <Tip>
                <b>Conquistas</b>: sempre com ano e nome oficial da competição. Evite abreviações
                que só quem é do meio entende.
              </Tip>
              <Tip>
                <b>Redes sociais</b>: basta o @usuário — nós montamos o link. Patrocinador clica
                para ver seu alcance de verdade.
              </Tip>
              <Tip>
                <b>Contato</b>: use o WhatsApp com DDD. É por ele que a proposta chega.
              </Tip>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-headline flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              3. O que o patrocinador quer ver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              <Tip>
                <b>Visibilidade</b>: onde a marca dele vai aparecer — competições que você disputa,
                público das arquibancadas, seguidores e engajamento nas redes, mídia local que já
                falou de você.
              </Tip>
              <Tip>
                <HeartHandshake className="mr-1 inline h-4 w-4 text-primary" />
                <b>Projeto social</b>: se você dá aula em projeto comunitário, treina crianças da
                sua região ou apoia alguma causa, DESTAQUE isso nos detalhes. Marcas amam associar o
                nome a impacto social — muitas têm verba específica pra isso.
              </Tip>
              <Tip>
                <b>Regularidade</b>: calendário de competições do ano mostra que o investimento terá
                exposição contínua, não um evento só.
              </Tip>
              <Tip>
                <b>Profissionalismo</b>: responder rápido, ter os números na ponta da língua e uma
                página bem-feita já diferenciam você de 90% dos atletas.
              </Tip>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-headline flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              4. Depois de gerar: use sua página
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              <Tip>
                <b>Link na bio</b> do Instagram e TikTok — é o seu cartão de visitas permanente.
              </Tip>
              <Tip>
                <b>Envie direto a patrocinadores</b> pela plataforma (planos Plus/Premium): a
                mensagem sai profissional, com seu link, em nome da ProSport.
              </Tip>
              <Tip>
                <b>Mande antes de reuniões</b> com empresas, clubes e imprensa — quem recebe chega
                sabendo quem você é.
              </Tip>
              <Tip>
                <b>Atualize após cada conquista</b>: título novo entra na página, e a página nova
                entra na conversa. Você pode gerar até 2 Sport Pages — use com estratégia.
              </Tip>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-headline flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Erros que afastam patrocinador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            <Avoid>Preencher pouco: 2 linhas de detalhes geram uma página genérica.</Avoid>
            <Avoid>Foto escura, cortada ou de baixa resolução na capa.</Avoid>
            <Avoid>Conquistas sem ano ou impossíveis de verificar.</Avoid>
            <Avoid>Inventar números de seguidores ou títulos — patrocinador confere.</Avoid>
            <Avoid>
              <Video className="mr-1 inline h-4 w-4" />
              Vídeo longo demais: ninguém assiste 20 minutos — edite o melhor momento.
            </Avoid>
            <Avoid>Deixar a página parada: perfil desatualizado passa impressão de inatividade.</Avoid>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
