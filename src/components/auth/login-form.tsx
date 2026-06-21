'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { auth } from '@/lib/firebase-client';
import { createSession } from '@/lib/user-actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Endereco de e-mail invalido.' }),
  password: z.string().min(1, { message: 'A senha e obrigatoria.' }),
});

interface LoginFormProps {
  userType: 'athlete' | 'company' | 'club';
}

export function LoginForm({ userType }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const idToken = await credential.user.getIdToken();
      await createSession(idToken);

      toast({ title: 'Login bem-sucedido', description: 'Redirecionando...' });

      if (values.email === 'admin@prosport.com') {
        router.push('/admin');
      } else if (userType === 'athlete') {
        router.push('/dashboard');
      } else if (userType === 'company') {
        router.push('/company/dashboard');
      } else {
        router.push('/club/dashboard');
      }
      router.refresh();
    } catch (error: any) {
      const msg =
        error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password'
          ? 'Email ou senha incorretos.'
          : error.code === 'auth/too-many-requests'
          ? 'Muitas tentativas. Aguarde alguns minutos.'
          : 'Erro ao fazer login. Tente novamente.';
      toast({ variant: 'destructive', title: 'Erro de login', description: msg });
    } finally {
      setLoading(false);
    }
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
        <Button type="submit" className="w-full font-headline" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Entrar
        </Button>
      </form>
    </Form>
  );
}
