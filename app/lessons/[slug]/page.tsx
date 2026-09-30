import LessonContent from "@/components/lesson-content";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <LessonContent {...resolvedParams} />;
}
