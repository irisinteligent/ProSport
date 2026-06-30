
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

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
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await signupAthlete({
      fullName: values.fullName,
      email: values.email,
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
                  Aceitar Termos de Uso de Imagem
                </FormLabel>
                <FormDescription>
                  Você concorda com nossos Termos de Serviço e permite que o ProSport use suas imagens fornecidas para gerar e distribuir seu perfil.
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
