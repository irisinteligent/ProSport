
"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import {
  createBasicPresentation,
  createEnhancedSportpage,
} from "@/app/dashboard/actions";
import { createBillingPortalSession } from "@/lib/billing-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { SendToSponsorForm } from "@/components/dashboard/send-to-sponsor-form";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "O nome completo é obrigatório."),
  dateOfBirth: z.date({
    required_error: "A data de nascimento é obrigatória.",
  }),
  sport: z.string().min(2, "O esporte é obrigatório."),
  isAmateur: z.string({ required_error: "Por favor, selecione um status." }),
  team: z.string().optional(),
  contact: z.string().min(1, "O contato é obrigatório."),
  details: z.string().min(1, "Os detalhes são obrigatórios."),
  achievements: z.string().min(1, "As conquistas são obrigatórias."),
  // Aceita só o @usuário (ex.: "@beto" ou "beto") OU a URL completa —
  // o link final é montado por buildSocialUrl() antes do envio.
  instagramUrl: z.string().max(120).regex(/^\S*$/, "Sem espaços — use @usuario ou a URL.").optional().or(z.literal('')),
  tiktokUrl: z.string().max(120).regex(/^\S*$/, "Sem espaços — use @usuario ou a URL.").optional().or(z.literal('')),
  facebookUrl: z.string().max(120).regex(/^\S*$/, "Sem espaços — use @usuario ou a URL.").optional().or(z.literal('')),
  photo: z.any().optional(),
  youtubeLink: z.string().url("Por favor, insira uma URL válida do YouTube.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

/** Converte "@usuario"/"usuario" no link oficial da rede; URLs completas passam direto. */
function buildSocialUrl(
  value: string | undefined,
  network: "instagram" | "tiktok" | "facebook"
): string | undefined {
  const v = (value ?? "").trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@+/, "");
  if (!handle) return undefined;
  if (network === "instagram") return `https://instagram.com/${handle}`;
  if (network === "tiktok") return `https://tiktok.com/@${handle}`;
  return `https://facebook.com/${handle}`;
}

interface AthleteDashboardClientProps {
  currentPlan: "basic" | "plus" | "premium";
}

export function AthleteDashboardClient({ currentPlan }: AthleteDashboardClientProps) {
  const { toast } = useToast();
  const [isBasicPending, startBasicTransition] = useTransition();
  const [isPlusPending, startPlusTransition] = useTransition();
  const [isBillingPending, startBillingTransition] = useTransition();

  const [basicHtml, setBasicHtml] = useState("");
  const [plusHtml, setPlusHtml] = useState("");
  const [photoDataUri, setPhotoDataUri] = useState("");
  const [basicUrl, setBasicUrl] = useState("");
  const [plusUrl, setPlusUrl] = useState("");

  const userPlan = currentPlan;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      sport: "",
      isAmateur: undefined,
      team: "",
      contact: "",
      details: "",
      achievements: "",
      instagramUrl: "",
      tiktokUrl: "",
      facebookUrl: "",
      photo: undefined,
      youtubeLink: "",
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "Por favor, envie uma imagem menor que 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBasic = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Formulário Inválido",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }
    const values = form.getValues();
    startBasicTransition(async () => {
      const result = await createBasicPresentation({
        fullName: values.fullName,
        dateOfBirth: format(values.dateOfBirth, "dd/MM/yyyy"),
        sport: values.sport,
        isAmateur: values.isAmateur === "true",
        achievements: values.achievements,
        details: values.details,
        team: values.team || undefined,
        contact: values.contact,
        instagramUrl: buildSocialUrl(values.instagramUrl, "instagram"),
        tiktokUrl: buildSocialUrl(values.tiktokUrl, "tiktok"),
        facebookUrl: buildSocialUrl(values.facebookUrl, "facebook"),
        photoDataUri: photoDataUri || undefined,
      });
      if (result.error) {
        toast({ variant: "destructive", title: "Erro", description: result.error });
      } else {
        setBasicHtml(result.presentation || "");
        setBasicUrl(result.presentationUrl || "");
        toast({ title: "Sucesso", description: "Página esportiva básica gerada!" });
      }
    });
  };

  const handleGeneratePlus = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
       toast({
        variant: "destructive",
        title: "Formulário Inválido",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }
    if (!photoDataUri) {
      toast({
        variant: "destructive",
        title: "Foto necessária",
        description: "Por favor, envie uma foto para a Página Esportiva Plus.",
      });
      return;
    }
    const values = form.getValues();
    startPlusTransition(async () => {
      const dataToSend = {
        fullName: values.fullName,
        dateOfBirth: format(values.dateOfBirth, "dd/MM/yyyy"),
        sport: values.sport,
        isAmateur: values.isAmateur === "true",
        details: values.details,
        achievements: values.achievements,
        team: values.team || undefined,
        contact: values.contact,
        instagramUrl: buildSocialUrl(values.instagramUrl, "instagram"),
        tiktokUrl: buildSocialUrl(values.tiktokUrl, "tiktok"),
        facebookUrl: buildSocialUrl(values.facebookUrl, "facebook"),
        photoDataUri: photoDataUri,
        youtubeLink: values.youtubeLink,
        plan: userPlan === 'premium' ? 'premium' as const : 'plus' as const,
      };
      
      const result = await createEnhancedSportpage(dataToSend);

      if (result.error) {
        toast({ variant: "destructive", title: "Erro", description: result.error });
      } else {
        setPlusHtml(result.sportpageHtml || "");
        setPlusUrl(result.sportpageUrl || "");
        toast({ title: "Sucesso", description: "Página Esportiva Melhorada gerada!" });
      }
    });
  };
  
  const isPlusPlan = userPlan === 'plus' || userPlan === 'premium';
  const isPremiumPlan = userPlan === 'premium';
  const isBasicPlan = userPlan === 'basic';
  const canGeneratePlus = isPlusPlan && form.formState.isValid && !!photoDataUri;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Painel do Atleta</CardTitle>
                <CardDescription>
                    Complete seu perfil para gerar suas Páginas Esportivas. Esta informação será usada para atrair patrocinadores.
                </CardDescription>
            </div>
            {userPlan && (
                <div className="text-right space-y-2">
                    <div>
                        <span className="text-sm text-muted-foreground">Plano Atual</span>
                        <p className="font-bold capitalize text-primary">{userPlan}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBillingPending}
                        onClick={() => {
                            startBillingTransition(async () => {
                                const result = await createBillingPortalSession();
                                if (result.success) {
                                    window.location.href = result.url;
                                } else {
                                    toast({ variant: "destructive", title: "Erro", description: result.error });
                                }
                            });
                        }}
                    >
                        {isBillingPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerenciar assinatura"}
                    </Button>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <Form {...form}>
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={ptBR}
                          captionLayout="dropdown-buttons"
                          fromYear={1960}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Esporte / Modalidade</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Jiu-Jitsu Brasileiro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipe / Clube</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Alliance BJJ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato (WhatsApp ou Email)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: +55 11 99999-9999 ou email@exemplo.com" {...field} />
                    </FormControl>
                    <FormDescription>Usado no botão de CTA da sua sport page.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isAmateur"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal">Amador</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Profissional
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva sua categoria de peso, faixa, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Isso ajuda os patrocinadores a entenderem seu perfil
                    atlético específico.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="achievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conquistas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste seus títulos, campeonatos e conquistas significativas."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Redes sociais (opcional)</p>
                <p className="text-sm text-muted-foreground">
                  Só o @usuário basta (ex.: @seunome) — nós montamos o link. Aparecem como botões na sua Sport Page.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="@seuusuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tiktokUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok</FormLabel>
                      <FormControl>
                        <Input placeholder="@seuusuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="@seuusuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Foto do Perfil{" "}
                    {isPlusPlan ? "(Obrigatória para o seu plano)" : ""}
                  </FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={handleFileChange} />
                  </FormControl>
                  <FormDescription>
                    Uma foto de alta qualidade para sua Página Esportiva. Máx
                    4MB.
                    {!isPlusPlan &&
                      " (O envio de fotos está disponível apenas para planos Plus e Premium)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             {isPlusPlan && (
              <FormField
                control={form.control}
                name="youtubeLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Vídeo (YouTube)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Adicione um link para um vídeo de destaque do YouTube.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
        
        <Separator />
        
        <div className="space-y-8">
            {(isBasicPlan || !isPlusPlan) && (
              <div className="space-y-4">
                  <CardHeader className="p-0">
                      <CardTitle className="font-headline">Sport Page Básica</CardTitle>
                      <CardDescription>Gere uma página limpa e profissional para compartilhar com potenciais patrocinadores.</CardDescription>
                  </CardHeader>
                  <Button onClick={handleGenerateBasic} disabled={isBasicPending || !form.formState.isValid}>
                      {isBasicPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Gerar Sport Page Básica
                  </Button>
                  {basicUrl && (
                      <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                          <Label>Link Compartilhável</Label>
                          <div className="flex items-center gap-2">
                              <Input value={new URL(basicUrl, window.location.origin).href} readOnly />
                              <CopyButton textToCopy={new URL(basicUrl, window.location.origin).href}>Copiar</CopyButton>
                          </div>
                      </div>
                      </div>
                  )}
                  {basicHtml && (
                      <div className="mt-4">
                      <h3 className="mb-2 text-lg font-semibold font-headline">Pré-visualização</h3>
                      <div className="rounded-lg border bg-background">
                          <iframe srcDoc={basicHtml} className="w-full h-[600px] border-0 rounded-lg" sandbox="allow-scripts" />
                      </div>
                      </div>
                  )}
              </div>
            )}

            {isPlusPlan && (
              <div className="space-y-4">
                   <CardHeader className="p-0">
                      <CardTitle className="font-headline">Sport Page <span className="capitalize">{userPlan}</span></CardTitle>
                      <CardDescription>Crie uma apresentação visualmente deslumbrante, no estilo NFL/NBA, para impressionar os patrocinadores.</CardDescription>
                  </CardHeader>
                  <Button onClick={handleGeneratePlus} disabled={isPlusPending || !canGeneratePlus}>
                    {isPlusPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Gerar Sport Page
                  </Button>
                  {plusUrl && (
                    <div className="mt-4 space-y-6">
                      <div className="space-y-2">
                         <Label>Link Compartilhável</Label>
                         <div className="flex items-center gap-2">
                           <Input value={new URL(plusUrl, window.location.origin).href} readOnly />
                           <CopyButton textToCopy={new URL(plusUrl, window.location.origin).href}>Copiar</CopyButton>
                         </div>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {isPremiumPlan
                            ? "Enviar por e-mail para patrocinador, clube ou imprensa"
                            : "Enviar para um patrocinador por e-mail"}
                        </Label>
                        <SendToSponsorForm
                          sportpageUrl={new URL(plusUrl, window.location.origin).href}
                          audienceLabel={isPremiumPlan ? "patrocinador/clube/imprensa" : "patrocinador"}
                        />
                      </div>
                    </div>
                  )}
                  {plusHtml && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-lg font-semibold font-headline">Pré-visualização</h3>
                      <div className="rounded-lg border bg-background">
                        <iframe srcDoc={plusHtml} className="w-full h-[600px] border-0 rounded-lg" sandbox="allow-scripts allow-same-origin" />
                      </div>
                    </div>
                  )}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
