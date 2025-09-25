import { notFound } from "next/navigation";
import { PLASMIC } from "@/lib/plasmic";
import { PlasmicComponent, PlasmicRootProvider } from "@plasmicapp/loader-nextjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlasmicCatchallPage({ params }: { params: { slug?: string[] } }) {
  const slug = (params.slug && params.slug.length > 0) ? params.slug.join("/") : "homepage";
  try {
    if (!PLASMIC) return notFound();
    const plasmicData = await PLASMIC.fetchComponentData(slug);
    if (!plasmicData) return notFound();
    return (
      <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData}>
        <PlasmicComponent component={slug} />
      </PlasmicRootProvider>
    );
  } catch {
    return notFound();
  }
}
