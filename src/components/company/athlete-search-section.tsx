import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchAthletes } from "@/lib/athlete-search";

export async function AthleteSearchSection({ query }: { query?: string }) {
  const athletes = await searchAthletes(query);

  return (
    <>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Buscar Atletas</CardTitle>
          <CardDescription>
            Filtre atletas Plus/Premium pelo nome ou pela modalidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2">
            <Input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar por nome ou modalidade..."
            />
            <Button type="submit">Buscar</Button>
          </form>
        </CardContent>
      </Card>

      {athletes.length === 0 ? (
        <Card className="lg:col-span-3">
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum atleta encontrado.
          </CardContent>
        </Card>
      ) : (
        athletes.map((athlete) => (
          <Card key={athlete.uid}>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              {athlete.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={athlete.photoUrl}
                  alt={athlete.fullName}
                  className="h-14 w-14 rounded-full object-cover"
                />
              )}
              <div>
                <CardTitle className="text-base">{athlete.fullName}</CardTitle>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary">{athlete.sport}</Badge>
                  <Badge variant="outline">
                    {athlete.isAmateur ? "Amador" : "Profissional"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {athlete.achievements}
              </p>
              <a
                href={athlete.sportpageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Ver Sportpage
              </a>
            </CardContent>
          </Card>
        ))
      )}
    </>
  );
}
