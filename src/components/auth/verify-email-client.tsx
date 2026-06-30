"use client";

import { useState } from "react";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";

import { resendVerificationEmail, logoutUser } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function VerifyEmailClient({ email }: { email: string }) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleResend() {
    setSending(true);
    const result = await resendVerificationEmail();
    setSending(false);
    if (result.success) {
      toast({ title: "E-mail reenviado", description: "Confira sua caixa de entrada e o spam." });
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
  }

  function handleCheck() {
    setChecking(true);
    // A página é Server Component e revalida a verificação no carregamento:
    // recarregar redireciona automaticamente se o e-mail já estiver confirmado.
    window.location.reload();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/70 backdrop-blur-[1px]">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-7 w-7 text-primary" />
            </span>
          </div>
          <CardTitle className="font-headline text-2xl font-bold">Confirme seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para
            ativar sua conta e acessar seu portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleCheck} className="w-full font-headline" disabled={checking}>
            {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Já confirmei — continuar
          </Button>
          <Button onClick={handleResend} variant="outline" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reenviar e-mail de confirmação
          </Button>
          <p className="pt-2 text-center text-sm text-muted-foreground">
            E-mail errado?{" "}
            <button type="submit" form="verify-logout" className="text-primary underline">
              Sair e cadastrar novamente
            </button>
          </p>
        </CardContent>
      </Card>
      <form id="verify-logout" action={logoutUser} />
    </div>
  );
}
