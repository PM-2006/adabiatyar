import SectionContent from "@/components/section-content";

export default async function Page({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const resolvedParams = await params;
  return <SectionContent {...resolvedParams} />;
}
