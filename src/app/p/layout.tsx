/**
 * Layout isolado para sport pages públicas (/p/[slug]).
 * Remove o header e o footer da ProSport para que o patrocinador veja
 * apenas a página gerada pela IA — sem elementos da plataforma ao redor.
 */
export default function SportPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
