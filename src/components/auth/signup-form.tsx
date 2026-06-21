'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { auth } from '@/lib/firebase-client';
import { createSession, createUserProfile } from '@/lib/user-actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const formSchema = z
  .object({
    fullName: z.string().min(1, { message: 'O nome completo e obrigatorio.' }),
    email: z.string().email({ message: 'Endereco de e-mail invalido.' }),
    password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
    confirmPassword: z.string().min(1, { message: 'Confirmacao de senha obrigatoria.' }),
    terms: z.literal(true, { errorMap: () => ({ message: 'Voce deve aceitar os termos.' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas nao coincidem.',
    path: ['confirmPassword'],
  });

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(credential.user, { displayName: values.fullName });
      const idToken = await credential.user.getIdToken();

      await createUserProfile({
        uid: credential.user.uid,
        email: values.email,
        fullName: values.fullName,
        userType: 'athlete',
      });

      await createSession(idToken);

      toast({ title: 'Conta criada!', description: 'Bem-vindo ao ProSport!' });
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      const msg =
        error.code === 'auth/email-already-in-use'
          ? 'Este e-mail ja esta cadastrado.'
          : 'Erro ao criar conta. Tente novamente.';
      toast({ variant: 'destructive', title: 'Erro no cadastro', description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="fullName" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo</FormLabel>
            <FormControl><Input placeholder="Michael Jordan" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input placeholder="seu.email@exemplo.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Senha</FormLabel>
            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar Senha</FormLabel>
            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="terms" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Aceitar Termos de Uso de Imagem</FormLabel>
              <FormDescription>
                Voce concorda com nossos Termos de Servico e permite que o ProSport use suas imagens para gerar e distribuir seu perfil.
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )} />
        <Button type="submit" className="w-full font-headline" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Cadastrar
        </Button>
      </form>
    </Form>
  );
}
