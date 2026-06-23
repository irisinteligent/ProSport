"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Users, FileText, Star } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { AdminMetrics } from "@/lib/admin-metrics"

export function AdminDashboardClient({
  totalAthletes,
  totalSportpages,
  plusSubscriptions,
  premiumSubscriptions,
  planBreakdown,
}: AdminMetrics) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAthletes}</div>
          <p className="text-xs text-muted-foreground">Contas com role &quot;athlete&quot;</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Páginas Geradas
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSportpages}</div>
          <p className="text-xs text-muted-foreground">Documentos na coleção sportpages</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assinaturas Plus</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{plusSubscriptions}</div>
          <p className="text-xs text-muted-foreground">Atletas com plan = &quot;plus&quot;</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assinaturas Premium</CardTitle>
          <Star className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{premiumSubscriptions}</div>
          <p className="text-xs text-muted-foreground">Atletas com plan = &quot;premium&quot;</p>
        </CardContent>
      </Card>
      <Card className="col-span-1 lg:col-span-4">
        <CardHeader>
          <CardTitle className="font-headline">Visão Geral das Assinaturas</CardTitle>
          <CardDescription>Uma análise dos atletas por plano de assinatura.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={{
            users: {
              label: "Usuários",
              color: "hsl(var(--primary))",
            },
          }} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={planBreakdown}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                 <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <XAxis dataKey="plan" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
