export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { ROUTES } from '../../../../lib/routes';

export async function GET() {
  return new Response(JSON.stringify({ routes: ROUTES }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
