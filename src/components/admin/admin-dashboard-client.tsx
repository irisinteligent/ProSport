"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Users, FileText, Star, ShieldCheck } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import type { AdminStats } from "@/app/admin/actions"

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  plus: "Plus",
  premium: "Premium",
}

const PLAN_VARIANT: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  basic: "secondary",
  plus: "default",
  premium: "destructive",
}

type Props = { stats: AdminStats }

export function AdminDashboardClient({ stats }: Props) {
  const chartData = [
    { plan: "Basic", atletas: stats.planCounts.basic },
    { plan: "Plus", atletas: stats.planCounts.plus },
    { plan: "Premium", atletas: stats.planCounts.premium },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Cards de métricas */}
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

      {/* Gráfico + Tabela de recentes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Distribuição por Plano</CardTitle>
            <CardDescription>Atletas por plano de assinatura — dados em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                atletas: { label: "Atletas", color: "hsl(var(--primary))" },
              }}
              className="h-[260px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarC