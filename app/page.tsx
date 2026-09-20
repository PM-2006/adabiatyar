import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="heroNoise" aria-hidden="true" />
        <div className="shell heroGrid">
          <div className="heroCopy">
            <span className="heroBadge">ادبیات فارسی، بخش‌بندی‌شده و هدفمند</span>
            <h1>از همان بخشی شروع کن که الان به آن نیاز داری.</h1>
            <p className="lead">هر درس به حفظیات، معنی و مفهوم، آرایه، دستور، قلمروها، بخش تکمیلی، امتحان نهایی و جمع‌بندی تقسیم می‌شود؛ هیچ مسیر اجباری وجود ندارد.</p>
            <div className="heroHighlights"><span>درسنامه موضوعی</span><span>تمرین تعاملی</span><span>سؤالات نهایی با تگ</span></div>
            <div className="actions"><Link className="button primary" href="/lessons">مشاهده درس‌ها</Link><Link className="button secondary" href="/review">جمع‌بندی و مرور</Link></div>
          </div>
          <div className="heroVisual" aria-label="ساختار بخش‌های درس">
            <div className="posterGlow" /><div className="visualOrbit visualOrbitOne" /><div className="visualOrbit visualOrbitTwo" />
            <div className="heroCard"><span className="heroCardKicker">داخل هر درس</span><div className="bookPreview"><span>انتخاب آزادانه</span><strong>آرایه‌های ادبی</strong><div className="previewLine" /><div className="previewLine short" /><div className="previewNotes"><i>درسنامه</i><i>تشخیص</i><i>سؤال</i></div></div><p className="heroCardText">هر بخش، آموزش و تمرین خودش را دارد.</p></div>
            <span className="floatingChip floatingChipTop">۸ بخش مستقل</span><span className="floatingChip floatingChipBottom">تگ‌گذاری سؤال‌ها</span>
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="sectionHeading centeredHeading"><span className="eyebrow">ساختار جدید</span><h2>یک درس، چند مسیر مستقل</h2><p>دانش‌آموز می‌تواند مستقیماً وارد واژگان، آرایه، دستور یا سؤال‌های نهایی شود.</p></div>
        <div className="twoCol">
          <article className="featureCard featureCardTeach"><div className="iconBox">۸</div><span className="featureKicker">موضوع‌بندی</span><h3>هر مبحث یک بخش مستقل</h3><p>حفظیات، معنی و مفهوم، آرایه، دستور، قلمرو، روان‌خوانی، امتحان نهایی و جمع‌بندی.</p><Link href="/lessons">مشاهده ساختار درس‌ها ←</Link></article>
          <article className="featureCard featureCardQuiz"><div className="iconBox">#</div><span className="featureKicker">تگ سؤال</span><h3>یک سؤال، چند کاربرد</h3><p>سؤال نهایی با تگ «آرایه» هم در امتحان نهایی دیده می‌شود و هم در بخش آرایه.</p><Link href="/lessons/lesson-1/section/final">نمونه سؤالات نهایی ←</Link></article>
        </div>
      </section>
    </>
  );
}
