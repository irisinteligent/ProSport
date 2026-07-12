
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signupAthlete } from "@/lib/auth-actions";
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
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z
  .object({
    fullName: z.string().min(1, { message: "O nome completo é obrigatório." }),
    email: z.string().min(1, { message: "O e-mail é obrigatório." }).email({ message: "Endereço de e-mail inválido." }),
    phone: z
      .string()
      .min(1, { message: "O celular (WhatsApp) é obrigatório." })
      .refine((v) => {
        const d = v.replace(/\D/g, "");
        return d.length >= 10 && d.length <= 13;
      }, { message: "Informe um celular válido com DDD, ex.: (11) 91234-5678." }),
    password: z
      .string()
      .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
    confirmPassword: z.string().min(1, { message: "A confirmação da senha é obrigatória." }),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Você deve aceitar os termos e condições." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await signupAthlete({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: result.error,
      });
      return;
    }

    toast({
      title: "Conta criada",
      description: "Enviamos um link de confirmação para o seu e-mail.",
    });
    router.push("/verificar-email");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Michael Jordan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu.email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Celular / WhatsApp</FormLabel>
              <FormControl>
                <Input type="tel" inputMode="tel" placeholder="(11) 91234-5678" {...field} />
              </FormControl>
              <FormDescription>
                Com DDD. É por ele que a ProSport e os patrocinadores falam com você.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Aceitar os Termos de Uso e a Política de Privacidade
                </FormLabel>
                <FormDescription>
                  Você concorda com os{" "}
                  <Link href="/termos" target="_blank" className="underline underline-offset-4">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" target="_blank" className="underline underline-offset-4">
                    Política de Privacidade
                  </Link>
                  , incluindo a licença para a ProSport usar as imagens fornecidas para gerar e
                  divulgar seu perfil conforme o plano contratado.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-headline" disabled={form.formState.isSubmitting}>
          Cadastrar
        </Button>
      </form>
    </Form>
  );
}
