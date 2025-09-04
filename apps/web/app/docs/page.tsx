
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Markdown from 'react-markdown';

type Doc = { title: string; slug: string; body: string };

export default async function DocsIndex() {
  const docsDir = path.join(process.cwd(), 'docs/public');
  const files = fs.readdirSync(docsDir).filter(f=>f.endsWith('.md'));
  const docs: Doc[] = files.map(fn => {
    const src = fs.readFileSync(path.join(docsDir, fn), 'utf8');
    const { data, content } = matter(src);
    const slug = fn.replace(/\.md$/,'');
    return { title: (data.title ?? slug), slug, body: content };
  }).sort((a,b)=>a.title.localeCompare(b.title));

  return (
    <div className="mx-auto max-w-4xl p-6 lg:grid lg:grid-cols-[240px,1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <nav className="sticky top-6">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Docs</h2>
          <ul className="mt-3 space-y-2">
            {docs.map(d=>(
              <li key={d.slug}><a href={`#${d.slug}`} className="text-sm text-blue-700 hover:underline">{d.title}</a></li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="prose max-w-none">
        <h1>EarlyBird Documentation</h1>
        {docs.map(d=>(
          <section id={d.slug} key={d.slug} className="mt-12">
            <h2>{d.title}</h2>
            <Markdown>{d.body}</Markdown>
          </section>
        ))}
      </main>
    </div>
  );
}
