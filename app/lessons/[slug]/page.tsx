import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, sectionCards } from "@/lib/data";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const finalCount = lesson.questions.filter((q) => q.sourceType === "final" || q.tags.includes("امتحان نهایی")).length;

  return (
    <section className="shell section">
      <div className="breadcrumb"><Link href="/lessons">درس‌ها</Link><span>/</span><span>{lesson.title}</span></div>

      <div className="lessonHero">
        <div>
          <div className="lessonMeta"><span>{lesson.textTypeLabel}</span><span>{lesson.questions.length} سؤال</span><span>{finalCount} سؤال نهایی</span></div>
          <h1>{lesson.title}</h1>
          <p>{lesson.subtitle}</p>
        </div>
      </div>

      <div className="sectionCardsGrid">
        {sectionCards.map((section) => (
          <Link className={`sectionRouteCard section-${section.key}`} href={`/lessons/${slug}/section/${section.key}`} key={section.key}>
            <div className="sectionRouteTop"><span className="sectionLetter">{section.letter}</span><span className="sectionIcon">{section.icon}</span></div>
            <h2>{section.title}</h2>
            <p>{section.description}</p>
            <strong>ورود به بخش ←</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
