
import { getPageContent } from '@/lib/storage';
import { notFound } from 'next/navigation';

export default async function SportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getPageContent(slug);

  if (!content) {
    notFound();
  }

  return (
    <iframe
      srcDoc={content}
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      sandbox="allow-scripts"
      title="Sport Page"
    />
  );
}
