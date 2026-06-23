
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { loginUser, logoutUser } from "@/lib/auth-actions";
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Endereço de e-mail inválido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

interface LoginFormProps {
  userType: "athlete" | "company" | "club";
}


export function LoginForm({ userType }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await loginUser(values);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: result.error,
      });
      return;
    }

    if (result.role === "admin") {
      router.push("/admin");
    } else if (userType === "athlete" && result.role === "athlete") {
      router.push("/dashboard");
    } else if ((userType === "company" || userType === "club") && result.role === "company") {
      router.push(userType === "club" ? "/club/dashboard" : "/company/dashboard");
    } else {
      await logoutUser();
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Esta conta não tem acesso a este portal.",
      });
      return;
    }

    toast({
      title: "Login bem-sucedido",
      description: "Redirecionando para o seu painel...",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <FormLabel>Senha</FormLabel>
                <Button variant="link" asChild className="p-0 text-sm h-auto">
                  <Link href="/forgot-password">Esqueceu a senha?</Link>
                </Button>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-headline" disabled={form.formState.isSubmitting}>
          Entrar
        </Button>
      </form>
    </Form>
  );
}
