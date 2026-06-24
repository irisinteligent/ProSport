"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { sendSportpageToSponsor } from "@/lib/sponsor-email-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const sendToSponsorFormSchema = z.object({
  sponsorEmail: z.string().email("Informe um e-mail válido."),
  sponsorName: z.string().optional(),
  message: z.string().max(1000, "Mensagem muito longa.").optional(),
});

type SendToSponsorFormValues = z.infer<typeof sendToSponsorFormSchema>;

interface SendToSponsorFormProps {
  sportpageUrl: string;
  /** Plus só fala com patrocinador; Premium também alcança clubes e imprensa (ver CLAUDE.md §4.8). */
  audienceLabel?: string;
}

export function SendToSponsorForm({
  sportpageUrl,
  audienceLabel = "patrocinador",
}: SendToSponsorFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SendToSponsorFormValues>({
    resolver: zodResolver(sendToSponsorFormSchema),
    defaultValues: { sponsorEmail: "", sponsorName: "", message: "" },
  });

  const onSubmit = (values: SendToSponsorFormValues) => {
    startTransition(async () => {
      const result = await sendSportpageToSponsor({ ...values, sportpageUrl });
      if (result.success) {
        toast({ title: "Enviado!", description: `O e-mail com sua página esportiva foi enviado para o ${audienceLabel}.` });
        form.reset();
      } else {
        toast({ variant: "destructive", title: "Erro", description: result.error });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sponsorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail do {audienceLabel}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contato@empresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sponsorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do {audienceLabel} (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Empresa XYZ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Adicione uma mensagem pessoal para o ${audienceLabel}.`}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Enviar para {audienceLabel}
        </Button>
      </form>
    </Form>
  );
}
