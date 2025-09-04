
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Markdown from 'react-markdown';

export default async function ChangelogPage() {
  const dir = path.join(process.cwd(), 'docs/public/changelog');
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.md')).sort().reverse();
  const entries = files.map(fn => {
    const src = fs.readFileSync(path.join(dir, fn), 'utf8');
    const { data, content } = matter(src);
    return { title: data.title ?? fn, body: content };
  });
  return (
    <div className="prose max-w-3xl mx-auto p-6">
      <h1>Changelog</h1>
      {entries.map((e,i)=>(
        <section key={i} className="mt-8">
          <h2>{e.title}</h2>
          <Markdown>{e.body}</Markdown>
        </section>
      ))}
    </div>
  );
}
