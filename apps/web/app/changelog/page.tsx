import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

const CHANGELOG_DIR = path.join(process.cwd(), 'docs', 'public', 'changelog');

function safeList(dir: string) {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  } catch {
    return [];
  }
}

export default function ChangelogPage() {
  const files = safeList(CHANGELOG_DIR);
  return (
    <main className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-6">Changelog</h1>
      {files.length === 0 ? (
        <p className="text-neutral-600">No changelog entries yet. Add markdown files to <code>apps/web/docs/public/changelog</code>.</p>
      ) : (
        <ul className="list-disc pl-6 space-y-2">
          {files.map(f => <li key={f}>{f}</li>)}
        </ul>
      )}
    </main>
  );
}
