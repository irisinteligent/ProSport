"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Users, FileText, Star, ShieldCheck, TrendingUp, Calendar, CalendarDays } from "lucide-react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import type { AdminStats } from "@/app/admin/actions"

const PLAN_LABELS: Record<string, string> = { basic: "Basic", plus: "Plus", premium: "Premium" }
const PLAN_VARIANT: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  basic: "secondary", plus: "default", premium: "destructive",
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function monthName(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleString("pt-BR", { month: "long", year: "numeric" });
}

type Props = { stats: AdminStats }

export function AdminDashboardClient({ stats }: Props) {
  const chartData = [
    { plan: "Basic", atletas: stats.planCounts.basic },
    { plan: "Plus", atletas: stats.planCounts.plus },
    { plan: "Premium", atletas: stats.planCounts.premium },
  ]

  const revenueVariation =
    stats.revenue.prevMonth > 0
      ? ((stats.revenue.thisMonth - stats.revenue.prevMonth) / stats.revenue.prevMonth) * 100
      : null;

  return (
    <div className="flex flex-col gap-6">

      {/* Cards de receita */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Receita</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{formatBRL(stats.revenue.today)}</div>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("pt-BR")}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{formatBRL(stats.revenue.thisMonth)}</div>
              <p className="text-xs text-muted-foreground capitalize">{monthName(0)}</p>
              {revenueVariation !== null && (
                <p className={`text-xs font-medium mt-1 ${revenueVariation >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {revenueVariation >= 0 ? "▲" : "▼"} {Math.abs(revenueVariation).toFixed(1)}% vs mês anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mês Anterior</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(stats.revenue.prevMonth)}</div>
              <p className="text-xs text-muted-foreground capitalize">{monthName(-1)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cards de atletas */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Plataforma</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAthletes}</div>
              <p className="text-xs text-muted-foreground">usuários cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sport Pages Geradas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSportPages}</div>
              <p className="text-xs text-muted-foreground">páginas no Firestore</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano Plus</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.planCounts.plus}</div>
              <p className="text-xs text-muted-foreground">assinantes ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano Premium</CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.planCounts.premium}</div>
              <p className="text-xs text-muted-foreground">assinantes ativos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grafico + Tabela */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Distribuição por Plano</CardTitle>
            <CardDescription>Atletas por plano de assinatura — dados em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ atletas: { label: "Atletas", color: "hsl(var(--primary))" } }}
              className="h-[260px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <XAxis dataKey="plan" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Bar dataKey="atletas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Últimos Cadastros</CardTitle>
            <CardDescription>Os 10 atletas cadastrados mais recentemente.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Nome</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Email</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Plano</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((user) => (
                      <tr key={user.uid} className="border-b last:border-0">
                        <td className="py-2 pr-3 font-medium">{user.name}</td>
                        <td className="py-2 pr-3 text-muted-foreground truncate max-w-[160px]">{user.email}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={PLAN_VARIANT[user.plan] ?? "secondary"}>
                            {PLAN_LABELS[user.plan] ?? user.plan}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground">{user.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
