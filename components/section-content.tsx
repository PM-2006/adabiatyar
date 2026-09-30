"use client";

import { useId, useRef, useState } from "react";
import { useContentLessons } from "@/lib/client-content";
import ContentLoading from "@/components/content-loading";
import Link from "next/link";
import { notFound } from "next/navigation";
import { questionsByTags, sectionCards, type TeachingUnit } from "@/lib/data";
import TaggedQuestionList from "@/components/tagged-question-list";
import LiteraryPractice from "@/components/literary-practice";

const noteLabels: Record<string, string> = {
  meaning: "معنی",
  concept: "مفهوم",
  vocabulary: "واژه",
  literary: "ادبی",
  grammar: "زبانی",
  exam: "امتحانی",
  spelling: "املا"
};

function Units({ units, poetry }: { units: TeachingUnit[]; poetry: boolean }) {
  if (!units.length) return <div className="emptyState">هنوز محتوایی برای این قسمت ثبت نشده است.</div>;
  if (poetry) return <PoetryUnits units={units} />;
  return (
    <div className="readingTimeline compactTimeline">
      {units.map((unit, index) => (
        <article className="readingUnit" key={unit.id}>
          <aside className="unitRail"><span className="unitNumber">{index + 1}</span><span className="railLine" /></aside>
          <div className="unitBody">
            <div className="unitLabel">{unit.label}</div>
            <div className={`sourceText ${poetry ? "poetryText" : "proseText"}`}>{unit.text.map((line, i) => <p key={i}>{line}</p>)}</div>
            <div className="unitNotes">
              {unit.notes.map((note, i) => <div className={`noteCard note-${note.kind}`} key={i}><div className="noteHead"><span className="noteKind">{noteLabels[note.kind] ?? note.kind}</span><h3>{note.title}</h3></div><p>{note.text}</p></div>)}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function PoetryUnits({ units }: { units: TeachingUnit[] }) {
  const [selectedId, setSelectedId] = useState(units[0].id);
  const [listOpen, setListOpen] = useState(false);
  const listId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const reader = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(0, units.findIndex((unit) => unit.id === selectedId));
  const unit = units[activeIndex];
  const number = (value: number) => value.toLocaleString("fa-IR");

  function selectUnit(index: number) {
    if (index < 0 || index >= units.length) return;
    setSelectedId(units[index].id);
    setListOpen(false);
    heading.current?.focus({ preventScroll: true });
    reader.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  return (
    <div ref={reader} className={`verseReader${listOpen ? " verseReaderWithList" : ""}`}>
      <aside className="verseIndex">
        <button className="verseIndexToggle" type="button" aria-expanded={listOpen} aria-controls={listId} onClick={() => setListOpen(!listOpen)}>
          <span aria-hidden="true">☰</span> فهرست بیت‌ها <span aria-hidden="true">{listOpen ? "−" : "+"}</span>
        </button>
        <nav id={listId} className="verseIndexList" aria-label="انتخاب بیت" hidden={!listOpen}>
          {units.map((item, index) => (
            <button key={item.id} type="button" aria-current={index === activeIndex ? "step" : undefined} onClick={() => selectUnit(index)}>
              <strong>بیت {number(index + 1)}</strong>
              <span>{item.text.find((line) => line.trim()) || item.label || "بدون متن"}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="versePage">
        <h3 className="verseProgress" ref={heading} tabIndex={-1} aria-live="polite" aria-atomic="true">بیت {number(activeIndex + 1)} از {number(units.length)}</h3>
        <article className="verseArticle" aria-label={`بیت ${number(activeIndex + 1)}`}>
          <div className="unitLabel">{unit.label}</div>
          <div className="sourceText poetryText">{unit.text.map((line, index) => <p key={index}>{line}</p>)}</div>
          <div className="unitNotes">
            {unit.notes.map((note, index) => <div className={`noteCard note-${note.kind}`} key={index}><div className="noteHead"><span className="noteKind">{noteLabels[note.kind] ?? note.kind}</span><h3>{note.title}</h3></div><p>{note.text}</p></div>)}
          </div>
        </article>
        <nav className="verseNavigation" aria-label="پیمایش بیت‌ها">
          <button className="button secondary" type="button" disabled={activeIndex === 0} onClick={() => selectUnit(activeIndex - 1)}><span aria-hidden="true">→</span> بیت قبلی</button>
          <span className="versePageNumber" aria-hidden="true">{number(activeIndex + 1)} / {number(units.length)}</span>
          <button className="button primary" type="button" disabled={activeIndex === units.length - 1} onClick={() => selectUnit(activeIndex + 1)}>بیت بعدی <span aria-hidden="true">←</span></button>
        </nav>
      </div>
    </div>
  );
}

export default function SectionContent({ slug, section }: { slug: string; section: string }) {
  const { lessons, ready } = useContentLessons();
  if (!ready) return <ContentLoading />;
  const lesson = lessons.find((item) => item.slug === slug);
  const meta = sectionCards.find((item) => item.key === section);
  if (!lesson || !meta) notFound();
  const poetry = lesson.textType === "poetry";

  return (
    <section className="shell section lessonSectionPage" key={`${slug}:${section}`}>
      <div className="breadcrumb"><Link href="/lessons">درس‌ها</Link><span>/</span><Link href={`/lessons/${slug}`}>{lesson.title}</Link><span>/</span><span>{meta.title}</span></div>
      <div className="sectionPageHeader"><span className="sectionLetter large">{meta.letter}</span><div><span className="eyebrow">{lesson.title}</span><h1>{meta.title}</h1><p>{meta.description}</p></div></div>

      {section === "memorization" && <>
        <SectionBlock title="۱. مقدمه"><article className="introCard"><div className="introFacts"><span><b>پدیدآورنده:</b> {lesson.intro.author || "—"}</span><span><b>قالب / نوع متن:</b> {lesson.intro.format || "—"}</span></div><ul className="noteList">{lesson.intro.notes.map((note) => <li key={note}>{note}</li>)}</ul></article></SectionBlock>
        <SectionBlock title="۲. واژه‌نامه — درسنامه"><div className="vocabList">{lesson.vocabulary.map((item) => <div className="vocabCard" key={item.word}><div className="word">{item.word}</div><blockquote>{item.quote}</blockquote><p><b>معنی:</b> {item.meaning}</p>{item.note && <p className="softNote">{item.note}</p>}</div>)}</div>{lesson.vocabulary.length === 0 && <div className="emptyState">هنوز واژه‌ای ثبت نشده است.</div>}</SectionBlock>
        <SectionBlock title="۲. واژه‌نامه — جعبه لایتنر"><div className="leitnerPreview"><p>کارت‌های این بخش از همان واژه‌نامه ساخته می‌شوند.</p>{lesson.vocabulary.slice(0, 3).map((item) => <div className="leitnerRow" key={item.word}><strong>{item.word}</strong><span>نمایش پاسخ و ثبت وضعیت یادگیری</span></div>)}</div></SectionBlock>
        <SectionBlock title="۳. املا"><div className="spellingGrid">{lesson.spelling.map((item, i) => <article className="spellingCard" key={i}><strong>{item.word}</strong><p>{item.quote}</p>{item.homophone && <small>هم‌آوا / مشابه: {item.homophone}</small>}{item.note && <span>{item.note}</span>}</article>)}</div>{lesson.spelling.length === 0 && <div className="emptyState">هنوز نکته املایی ثبت نشده است.</div>}</SectionBlock>
      </>}

      {section === "meaning" && <><SectionBlock title="۱. درسنامه"><Units units={lesson.meaningUnits} poetry={poetry} /></SectionBlock><SectionBlock title="۲. سؤالات"><TaggedQuestionList questions={questionsByTags(lesson, ["معنی و مفهوم"])} /></SectionBlock></>}

      {section === "literary" && <><SectionBlock title="۱. درسنامه"><Units units={lesson.literaryUnits} poetry={poetry} /></SectionBlock><SectionBlock title="۲. تمرین تشخیص آرایه"><LiteraryPractice items={lesson.literaryPractice} /></SectionBlock><SectionBlock title="۳. سؤالات"><TaggedQuestionList questions={questionsByTags(lesson, ["آرایه"])} /></SectionBlock></>}

      {section === "grammar" && <><SectionBlock title="۱. درسنامه"><Units units={lesson.grammarUnits} poetry={poetry} /></SectionBlock><SectionBlock title="۲. سؤالات"><TaggedQuestionList questions={questionsByTags(lesson, ["دستور زبان"])} /></SectionBlock></>}

      {section === "domains" && <>
        <DomainBlock title="۱. قلمرو فکری" normal={lesson.domains.thinking.normal} advanced={lesson.domains.thinking.advanced} poetry={poetry} />
        <DomainBlock title="۲. قلمرو ادبی" normal={lesson.domains.literary.normal} advanced={lesson.domains.literary.advanced} poetry={poetry} />
        <DomainBlock title="۳. قلمرو زبانی" normal={lesson.domains.language.normal} advanced={lesson.domains.language.advanced} poetry={poetry} />
      </>}

      {section === "reading" && <SectionBlock title={lesson.reading.kind === "ندارد" ? "روان‌خوانی / حکایت / شعرخوانی" : lesson.reading.kind}><Units units={lesson.reading.units} poetry={poetry} /></SectionBlock>}

      {section === "final" && <SectionBlock title="سؤالات امتحان نهایی"><div className="tagExplanation">هر سؤال با تگ موضوعی و دوره امتحان نمایش داده می‌شود؛ بنابراین همان سؤال می‌تواند در بخش موضوعی خودش هم دیده شود.</div><TaggedQuestionList questions={lesson.questions.filter((q) => q.sourceType === "final" || q.tags.includes("امتحان نهایی"))} /></SectionBlock>}

      {section === "summary" && <SectionBlock title="جمع‌بندی این درس"><Units units={lesson.summaryUnits} poetry={poetry} /></SectionBlock>}
    </section>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="lessonSectionBlock"><div className="lessonSectionHeading"><h2>{title}</h2></div>{children}</section>;
}

function DomainBlock({ title, normal, advanced, poetry }: { title: string; normal: TeachingUnit[]; advanced: TeachingUnit[]; poetry: boolean }) {
  return <SectionBlock title={title}><div className="domainLevelLabel">الف) عادی</div><Units units={normal} poetry={poetry} /><div className="domainLevelLabel advanced">ب) پیشرفته</div><Units units={advanced} poetry={poetry} /></SectionBlock>;
}
