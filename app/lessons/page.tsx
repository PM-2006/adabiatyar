import Link from "next/link";
import { lessons } from "@/lib/data";

export default function LessonsPage() {
  return (
    <section className="shell section">
      <div className="sectionHeading">
        <span className="eyebrow">درس‌به‌درس</span>
        <h1>درس موردنظر را انتخاب کن</h1>
        <p>بعد از ورود به هر درس، مستقیماً یکی از بخش‌های حفظیات، معنی و مفهوم، آرایه، دستور، قلمرو، امتحان نهایی یا جمع‌بندی را انتخاب کن.</p>
      </div>
      <div className="lessonGrid">
        {lessons.map((lesson) => {
          const contentCount = lesson.meaningUnits.length + lesson.literaryUnits.length + lesson.grammarUnits.length;
          return (
            <article className="lessonCard" key={lesson.slug}>
              <div className="lessonCardTop"><span className="lessonType">{lesson.textTypeLabel}</span><span className="dot">•</span><span>{contentCount} پارت درسنامه</span><span className="dot">•</span><span>{lesson.questions.length} سؤال</span></div>
              <h2>{lesson.title}</h2><p>{lesson.subtitle}</p>
              <Link className="button primary full" href={`/lessons/${lesson.slug}`}>ورود به درس</Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
