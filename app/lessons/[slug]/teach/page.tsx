import { redirect } from "next/navigation";

export default async function LegacyTeachPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/lessons/${slug}/section/meaning`);
}
