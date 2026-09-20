"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  lessons as seedLessons,
  type Lesson,
  type NoteKind,
  type TeachingNote,
  type TeachingUnit,
  type TaggedQuestion,
  type LiteraryPracticeItem
} from "@/lib/data";

const STORAGE_KEY = "adabiatyar-admin-content-v2";
const LEGACY_STORAGE_KEY = "adabiatyar-admin-content-v1";

type MainTab = "general" | "memorization" | "meaning" | "literary" | "grammar" | "domains" | "reading" | "final" | "summary";

const noteKinds: { value: NoteKind; label: string }[] = [
  { value: "meaning", label: "معنی" },
  { value: "concept", label: "مفهوم" },
  { value: "vocabulary", label: "واژه" },
  { value: "literary", label: "آرایه / ادبی" },
  { value: "grammar", label: "دستور / زبانی" },
  { value: "spelling", label: "املا" },
  { value: "exam", label: "نکته امتحانی" }
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function blankDomain() {
  return { normal: [] as TeachingUnit[], advanced: [] as TeachingUnit[] };
}

function createLesson(index: number): Lesson {
  return {
    slug: `lesson-${index + 1}`,
    title: `درس ${index + 1}`,
    subtitle: "عنوان یا توضیح کوتاه درس",
    textType: "prose",
    textTypeLabel: "نثر",
    intro: { author: "", format: "", notes: [] },
    vocabulary: [],
    spelling: [],
    meaningUnits: [],
    literaryUnits: [],
    literaryPractice: [],
    grammarUnits: [],
    domains: { thinking: blankDomain(), literary: blankDomain(), language: blankDomain() },
    reading: { kind: "ندارد", units: [] },
    summaryUnits: [],
    questions: []
  };
}

function migrateQuestion(q: any, index: number): TaggedQuestion {
  const anchor = q.lessonAnchor ?? "meaning";
  const tags = Array.isArray(q.tags) && q.tags.length
    ? q.tags
    : anchor === "vocabulary" ? ["واژه", "حفظیات"]
      : anchor === "literary" ? ["آرایه"]
        : anchor === "grammar" ? ["دستور زبان"]
          : ["معنی و مفهوم"];
  return {
    id: q.id ?? `q-${Date.now()}-${index}`,
    prompt: q.prompt ?? "",
    options: Array.isArray(q.options) && q.options.length ? q.options : ["", "", "", ""],
    answer: Number.isInteger(q.answer) ? q.answer : 0,
    explanation: q.explanation ?? "",
    lessonHint: q.lessonHint ?? "",
    lessonAnchor: anchor,
    tags,
    sourceType: q.sourceType === "final" ? "final" : "authored",
    examPeriod: q.examPeriod ?? ""
  };
}

function migrateLesson(raw: any, index: number): Lesson {
  if (raw?.meaningUnits && raw?.domains && raw?.reading) {
    return {
      ...createLesson(index),
      ...raw,
      questions: (raw.questions ?? []).map(migrateQuestion),
      domains: {
        thinking: { ...blankDomain(), ...(raw.domains?.thinking ?? {}) },
        literary: { ...blankDomain(), ...(raw.domains?.literary ?? {}) },
        language: { ...blankDomain(), ...(raw.domains?.language ?? {}) }
      },
      reading: { kind: raw.reading?.kind ?? "ندارد", units: raw.reading?.units ?? [] }
    };
  }

  const fallback = createLesson(index);
  return {
    ...fallback,
    slug: raw?.slug ?? fallback.slug,
    title: raw?.title ?? fallback.title,
    subtitle: raw?.subtitle ?? fallback.subtitle,
    textType: raw?.textType ?? "prose",
    textTypeLabel: raw?.textTypeLabel ?? "نثر",
    intro: raw?.intro ?? fallback.intro,
    vocabulary: raw?.vocabulary ?? [],
    meaningUnits: raw?.teachingUnits ?? [],
    questions: (raw?.questions ?? []).map(migrateQuestion)
  };
}

function downloadJson(data: Lesson[]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `adabiatyar-content-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminStudio() {
  const [lessons, setLessons] = useState<Lesson[]>(clone(seedLessons));
  const [selectedSlug, setSelectedSlug] = useState(seedLessons[0]?.slug ?? "");
  const [tab, setTab] = useState<MainTab>("general");
  const [subTab, setSubTab] = useState("lesson");
  const [savedLabel, setSavedLabel] = useState("ذخیره نشده");
  const [dirty, setDirty] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = parsed.map(migrateLesson);
        setLessons(migrated);
        setSelectedSlug(migrated[0].slug);
        setSavedLabel("نسخه ذخیره‌شده مرورگر بارگذاری شد");
      }
    } catch {
      setSavedLabel("نسخه ذخیره‌شده قابل خواندن نبود");
    }
  }, []);

  const lesson = lessons.find((item) => item.slug === selectedSlug) ?? lessons[0];

  const stats = useMemo(() => {
    if (!lesson) return { content: 0, vocab: 0, questions: 0, tags: 0 };
    const content = lesson.meaningUnits.length + lesson.literaryUnits.length + lesson.grammarUnits.length +
      lesson.domains.thinking.normal.length + lesson.domains.thinking.advanced.length +
      lesson.domains.literary.normal.length + lesson.domains.literary.advanced.length +
      lesson.domains.language.normal.length + lesson.domains.language.advanced.length +
      lesson.reading.units.length + lesson.summaryUnits.length;
    return {
      content,
      vocab: lesson.vocabulary.length,
      questions: lesson.questions.length,
      tags: new Set(lesson.questions.flatMap((q) => q.tags)).size
    };
  }, [lesson]);

  function mutateCurrent(mutator: (draft: Lesson) => void) {
    setLessons((current) => {
      const next = clone(current);
      const index = next.findIndex((item) => item.slug === selectedSlug);
      if (index < 0) return current;
      mutator(next[index]);
      return next;
    });
    setDirty(true);
    setSavedLabel("تغییرات ذخیره نشده");
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setDirty(false);
    setSavedLabel(`ذخیره شد — ${new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`);
  }

  function addLesson() {
    let suffix = lessons.length + 1;
    const next = createLesson(suffix - 1);
    while (lessons.some((item) => item.slug === next.slug)) {
      suffix += 1;
      next.slug = `lesson-${suffix}`;
      next.title = `درس ${suffix}`;
    }
    setLessons((current) => [...current, next]);
    setSelectedSlug(next.slug);
    setTab("general");
    setDirty(true);
    setSavedLabel("درس جدید اضافه شد؛ ذخیره کن");
  }

  function deleteLesson() {
    if (!lesson || lessons.length <= 1) return;
    if (!window.confirm(`درس «${lesson.title}» حذف شود؟`)) return;
    const next = lessons.filter((item) => item.slug !== lesson.slug);
    setLessons(next);
    setSelectedSlug(next[0]?.slug ?? "");
    setDirty(true);
    setSavedLabel("درس حذف شد؛ ذخیره کن");
  }

  function resetAll() {
    if (!window.confirm("همه تغییرات مرورگر پاک و محتوای نمونه اولیه برگردانده شود؟")) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const next = clone(seedLessons);
    setLessons(next);
    setSelectedSlug(next[0]?.slug ?? "");
    setDirty(false);
    setSavedLabel("محتوای نمونه اولیه بازگردانده شد");
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
      const migrated = parsed.map(migrateLesson);
      setLessons(migrated);
      setSelectedSlug(migrated[0].slug);
      setDirty(true);
      setSavedLabel("فایل وارد و به ساختار جدید تبدیل شد؛ ذخیره کن");
    } catch {
      window.alert("ساختار فایل JSON معتبر نیست.");
    } finally {
      event.target.value = "";
    }
  }

  if (!lesson) return null;

  const tabs: { key: MainTab; label: string }[] = [
    { key: "general", label: "اطلاعات درس" },
    { key: "memorization", label: "حفظیات" },
    { key: "meaning", label: "معنی و مفهوم" },
    { key: "literary", label: "آرایه" },
    { key: "grammar", label: "دستور" },
    { key: "domains", label: "قلمرو" },
    { key: "reading", label: "روان‌خوانی" },
    { key: "final", label: "امتحان نهایی" },
    { key: "summary", label: "جمع‌بندی" }
  ];

  return (
    <div className="adminStudio adminStudioV2">
      <aside className="adminSidebar">
        <div className="adminSidebarTop">
          <div><span className="adminSmallLabel">درس‌ها</span><strong>{lessons.length} درس</strong></div>
          <button className="adminIconButton" onClick={addLesson} title="افزودن درس">+</button>
        </div>
        <div className="adminLessonList">
          {lessons.map((item) => (
            <button key={item.slug} className={`adminLessonItem ${item.slug === lesson.slug ? "active" : ""}`} onClick={() => setSelectedSlug(item.slug)}>
              <span>{item.title}</span><small>{item.textTypeLabel}</small>
            </button>
          ))}
        </div>
        <div className="adminSidebarActions">
          <button onClick={() => importRef.current?.click()}>ورود فایل JSON</button>
          <button onClick={() => downloadJson(lessons)}>خروجی / بکاپ JSON</button>
          <button className="dangerText" onClick={resetAll}>بازگشت به نمونه اولیه</button>
          <input ref={importRef} hidden type="file" accept="application/json,.json" onChange={importJson} />
        </div>
      </aside>

      <div className="adminWorkspace">
        <div className="adminToolbar">
          <div><span className="adminSmallLabel">در حال ویرایش</span><h2>{lesson.title}</h2></div>
          <div className="adminSaveArea">
            <span className={dirty ? "saveStatus dirty" : "saveStatus"}>{savedLabel}</span>
            <button className="button secondary" disabled={lessons.length <= 1} onClick={deleteLesson}>حذف درس</button>
            <button className="button primary" onClick={saveLocal}>ذخیره تغییرات</button>
          </div>
        </div>

        <div className="adminStats">
          <div><strong>{stats.content}</strong><span>پارت محتوایی</span></div>
          <div><strong>{stats.vocab}</strong><span>واژه</span></div>
          <div><strong>{stats.questions}</strong><span>سؤال</span></div>
          <div><strong>{stats.tags}</strong><span>تگ سؤال</span></div>
        </div>

        <div className="adminTabs majorAdminTabs">
          {tabs.map((item) => <button key={item.key} className={tab === item.key ? "active" : ""} onClick={() => { setTab(item.key); setSubTab("lesson"); }}>{item.label}</button>)}
        </div>

        {tab === "general" && <GeneralEditor lesson={lesson} mutate={mutateCurrent} setLessons={setLessons} setSelectedSlug={setSelectedSlug} setDirty={setDirty} setSavedLabel={setSavedLabel} />}

        {tab === "memorization" && (
          <div className="adminPanel">
            <SubTabs value={subTab} onChange={setSubTab} items={[{ key: "lesson", label: "مقدمه" }, { key: "vocab", label: "واژه‌نامه" }, { key: "leitner", label: "جعبه لایتنر" }, { key: "spelling", label: "املا" }]} />
            {subTab === "lesson" && <IntroNotesEditor lesson={lesson} mutate={mutateCurrent} />}
            {subTab === "vocab" && <VocabularyEditor lesson={lesson} mutate={mutateCurrent} />}
            {subTab === "leitner" && <div className="adminInfoBox">جعبه لایتنر از همان واژه‌های «واژه‌نامه» ساخته می‌شود؛ محتوا را دوباره وارد نکن. دانش‌آموز وضعیت «بلد بودم / شک داشتم / بلد نبودم» را در بخش کاربری ثبت می‌کند.</div>}
            {subTab === "spelling" && <SpellingEditor lesson={lesson} mutate={mutateCurrent} />}
          </div>
        )}

        {tab === "meaning" && (
          <div className="adminPanel">
            <SubTabs value={subTab} onChange={setSubTab} items={[{ key: "lesson", label: "درسنامه" }, { key: "questions", label: "سؤالات" }]} />
            {subTab === "lesson" ? <UnitCollectionEditor title="درسنامه معنی و مفهوم" units={lesson.meaningUnits} textType={lesson.textType} onChange={(units) => mutateCurrent((d) => { d.meaningUnits = units; })} /> : <QuestionEditor questions={lesson.questions} requiredTag="معنی و مفهوم" mutate={mutateCurrent} />}
          </div>
        )}

        {tab === "literary" && (
          <div className="adminPanel">
            <SubTabs value={subTab} onChange={setSubTab} items={[{ key: "lesson", label: "درسنامه" }, { key: "practice", label: "تمرین تشخیص آرایه" }, { key: "questions", label: "سؤالات" }]} />
            {subTab === "lesson" && <UnitCollectionEditor title="درسنامه آرایه‌های ادبی" units={lesson.literaryUnits} textType={lesson.textType} onChange={(units) => mutateCurrent((d) => { d.literaryUnits = units; })} />}
            {subTab === "practice" && <LiteraryPracticeEditor items={lesson.literaryPractice} onChange={(items) => mutateCurrent((d) => { d.literaryPractice = items; })} />}
            {subTab === "questions" && <QuestionEditor questions={lesson.questions} requiredTag="آرایه" mutate={mutateCurrent} />}
          </div>
        )}

        {tab === "grammar" && (
          <div className="adminPanel">
            <SubTabs value={subTab} onChange={setSubTab} items={[{ key: "lesson", label: "درسنامه" }, { key: "questions", label: "سؤالات" }]} />
            {subTab === "lesson" ? <UnitCollectionEditor title="درسنامه دستور زبان" units={lesson.grammarUnits} textType={lesson.textType} onChange={(units) => mutateCurrent((d) => { d.grammarUnits = units; })} /> : <QuestionEditor questions={lesson.questions} requiredTag="دستور زبان" mutate={mutateCurrent} />}
          </div>
        )}

        {tab === "domains" && <DomainsEditor lesson={lesson} mutate={mutateCurrent} subTab={subTab} setSubTab={setSubTab} />}

        {tab === "reading" && (
          <div className="adminPanel">
            <div className="adminPanelHeading">
              <div><span className="adminSmallLabel">بخش F</span><h3>روان‌خوانی / حکایت / شعرخوانی</h3></div>
              <label className="inlineSelect"><span>نوع بخش</span><select value={lesson.reading.kind} onChange={(e) => mutateCurrent((d) => { d.reading.kind = e.target.value as Lesson["reading"]["kind"]; })}><option>ندارد</option><option>روان‌خوانی</option><option>حکایت</option><option>شعرخوانی</option><option>شعر حفظی</option></select></label>
            </div>
            <UnitCollectionEditor title={lesson.reading.kind} units={lesson.reading.units} textType={lesson.textType} onChange={(units) => mutateCurrent((d) => { d.reading.units = units; })} />
          </div>
        )}

        {tab === "final" && (
          <div className="adminPanel">
            <div className="adminInfoBox">هر سؤال نهایی فقط یک‌بار ثبت می‌شود. تگ‌های موضوعی مثل «آرایه» یا «معنی و مفهوم» باعث می‌شوند همان سؤال در بخش مربوط هم نمایش داده شود.</div>
            <QuestionEditor questions={lesson.questions} requiredTag="امتحان نهایی" forceFinal mutate={mutateCurrent} />
          </div>
        )}

        {tab === "summary" && (
          <div className="adminPanel"><UnitCollectionEditor title="جمع‌بندی این درس" units={lesson.summaryUnits} textType={lesson.textType} onChange={(units) => mutateCurrent((d) => { d.summaryUnits = units; })} /></div>
        )}
      </div>
    </div>
  );
}

function GeneralEditor({ lesson, mutate, setLessons, setSelectedSlug, setDirty, setSavedLabel }: any) {
  return (
    <div className="adminPanel">
      <div className="adminPanelHeading"><div><span className="adminSmallLabel">مشخصات پایه</span><h3>اطلاعات اصلی درس</h3></div></div>
      <div className="formGrid two">
        <label><span>عنوان درس</span><input value={lesson.title} onChange={(e) => mutate((d: Lesson) => { d.title = e.target.value; })} /></label>
        <label><span>شناسه لینک (slug)</span><input dir="ltr" value={lesson.slug} onChange={(e) => {
          const oldSlug = lesson.slug;
          const newSlug = e.target.value.trim().replace(/\s+/g, "-");
          setLessons((current: Lesson[]) => current.map((item) => item.slug === oldSlug ? { ...item, slug: newSlug } : item));
          setSelectedSlug(newSlug); setDirty(true); setSavedLabel("تغییرات ذخیره نشده");
        }} /></label>
        <label className="fullSpan"><span>توضیح کوتاه</span><input value={lesson.subtitle} onChange={(e) => mutate((d: Lesson) => { d.subtitle = e.target.value; })} /></label>
        <label><span>نوع درس</span><select value={lesson.textType} onChange={(e) => mutate((d: Lesson) => { d.textType = e.target.value as Lesson["textType"]; d.textTypeLabel = e.target.value === "poetry" ? "نظم / شعر" : e.target.value === "prose" ? "نثر" : "ترکیبی"; })}><option value="poetry">نظم / شعر</option><option value="prose">نثر</option><option value="mixed">ترکیبی</option></select></label>
        <label><span>شاعر / نویسنده</span><input value={lesson.intro.author} onChange={(e) => mutate((d: Lesson) => { d.intro.author = e.target.value; })} /></label>
        <label><span>قالب / نوع متن</span><input value={lesson.intro.format} onChange={(e) => mutate((d: Lesson) => { d.intro.format = e.target.value; })} /></label>
      </div>
    </div>
  );
}

function IntroNotesEditor({ lesson, mutate }: { lesson: Lesson; mutate: (fn: (d: Lesson) => void) => void }) {
  return (
    <div className="adminSubsection noTopBorder">
      <div className="adminSubsectionHeader"><div><h4>مقدمه درس</h4><p>شاعر، قالب و ویژگی‌های کلی در «اطلاعات درس» هستند؛ اینجا نکات مقدمه را اضافه کن.</p></div><button className="smallButton" onClick={() => mutate((d) => d.intro.notes.push(""))}>+ افزودن نکته</button></div>
      {lesson.intro.notes.map((note, index) => <div className="inlineEditor" key={index}><input value={note} onChange={(e) => mutate((d) => { d.intro.notes[index] = e.target.value; })} /><button className="deleteMini" onClick={() => mutate((d) => { d.intro.notes.splice(index, 1); })}>حذف</button></div>)}
      {lesson.intro.notes.length === 0 && <div className="adminEmpty">هنوز نکته‌ای برای مقدمه ثبت نشده است.</div>}
    </div>
  );
}

function VocabularyEditor({ lesson, mutate }: { lesson: Lesson; mutate: (fn: (d: Lesson) => void) => void }) {
  return (
    <div>
      <div className="adminPanelHeading"><div><h3>واژه‌نامه</h3><p>این داده هم در درسنامه واژه و هم در جعبه لایتنر استفاده می‌شود.</p></div><button className="button primary" onClick={() => mutate((d) => d.vocabulary.push({ word: "", quote: "", meaning: "", note: "" }))}>+ افزودن واژه</button></div>
      <div className="adminCardsGrid">{lesson.vocabulary.map((item, index) => <article className="adminMiniCard" key={index}><div className="adminMiniCardTop"><strong>واژه {index + 1}</strong><button className="deleteMini" onClick={() => mutate((d) => { d.vocabulary.splice(index, 1); })}>حذف</button></div><label><span>واژه</span><input value={item.word} onChange={(e) => mutate((d) => { d.vocabulary[index].word = e.target.value; })} /></label><label><span>بیت / جمله اصلی</span><textarea rows={3} value={item.quote} onChange={(e) => mutate((d) => { d.vocabulary[index].quote = e.target.value; })} /></label><label><span>معنی در بافت</span><textarea rows={2} value={item.meaning} onChange={(e) => mutate((d) => { d.vocabulary[index].meaning = e.target.value; })} /></label><label><span>نکته / ایهام / معنی دیگر</span><textarea rows={2} value={item.note ?? ""} onChange={(e) => mutate((d) => { d.vocabulary[index].note = e.target.value; })} /></label></article>)}</div>
      {lesson.vocabulary.length === 0 && <div className="adminEmpty large">هنوز واژه‌ای ثبت نشده است.</div>}
    </div>
  );
}

function SpellingEditor({ lesson, mutate }: { lesson: Lesson; mutate: (fn: (d: Lesson) => void) => void }) {
  return (
    <div><div className="adminPanelHeading"><div><h3>املا</h3><p>کلمه، جمله اصلی، هم‌آوا و نکته املایی.</p></div><button className="button primary" onClick={() => mutate((d) => d.spelling.push({ word: "", quote: "", homophone: "", note: "" }))}>+ افزودن کلمه املایی</button></div><div className="adminCardsGrid">{lesson.spelling.map((item, index) => <article className="adminMiniCard" key={index}><div className="adminMiniCardTop"><strong>مورد {index + 1}</strong><button className="deleteMini" onClick={() => mutate((d) => { d.spelling.splice(index, 1); })}>حذف</button></div><label><span>کلمه</span><input value={item.word} onChange={(e) => mutate((d) => { d.spelling[index].word = e.target.value; })} /></label><label><span>بیت / جمله</span><textarea rows={2} value={item.quote} onChange={(e) => mutate((d) => { d.spelling[index].quote = e.target.value; })} /></label><label><span>هم‌آوا / مشابه</span><input value={item.homophone ?? ""} onChange={(e) => mutate((d) => { d.spelling[index].homophone = e.target.value; })} /></label><label><span>نکته</span><textarea rows={2} value={item.note ?? ""} onChange={(e) => mutate((d) => { d.spelling[index].note = e.target.value; })} /></label></article>)}</div>{lesson.spelling.length === 0 && <div className="adminEmpty large">هنوز مورد املایی ثبت نشده است.</div>}</div>
  );
}

function UnitCollectionEditor({ title, units, textType, onChange }: { title: string; units: TeachingUnit[]; textType: Lesson["textType"]; onChange: (units: TeachingUnit[]) => void }) {
  const update = (fn: (draft: TeachingUnit[]) => void) => { const next = clone(units); fn(next); onChange(next); };
  return (
    <div>
      <div className="adminPanelHeading"><div><h3>{title || "محتوا"}</h3><p>{textType === "poetry" ? "هر بیت یا بخش مرتبط را جداگانه وارد کن." : "هر یک یا دو پاراگراف مرتبط را یک پارت در نظر بگیر."}</p></div><button className="button primary" onClick={() => update((d) => d.push({ id: `unit-${Date.now()}`, label: `بخش ${d.length + 1}`, text: [""], notes: [] }))}>+ افزودن پارت</button></div>
      <div className="adminUnitList">{units.map((unit, unitIndex) => <article className="adminUnitCard" key={unit.id}><div className="adminUnitTop"><div className="adminUnitNumber">{unitIndex + 1}</div><input className="unitTitleInput" value={unit.label} onChange={(e) => update((d) => { d[unitIndex].label = e.target.value; })} /><div className="reorderButtons"><button disabled={unitIndex === 0} onClick={() => update((d) => { const item = d.splice(unitIndex, 1)[0]; d.splice(unitIndex - 1, 0, item); })}>↑</button><button disabled={unitIndex === units.length - 1} onClick={() => update((d) => { const item = d.splice(unitIndex, 1)[0]; d.splice(unitIndex + 1, 0, item); })}>↓</button><button className="deleteMini" onClick={() => update((d) => { d.splice(unitIndex, 1); })}>حذف</button></div></div><label className="blockField"><span>متن اصلی</span><textarea rows={textType === "poetry" ? 3 : 6} value={unit.text.join(textType === "poetry" ? "\n" : "\n\n")} onChange={(e) => update((d) => { d[unitIndex].text = e.target.value.split(textType === "poetry" ? /\n/ : /\n\s*\n/); })} /></label><div className="notesEditor"><div className="adminSubsectionHeader"><h4>توضیحات این پارت</h4><button className="smallButton" onClick={() => update((d) => d[unitIndex].notes.push({ kind: "meaning", title: "توضیح", text: "" }))}>+ افزودن توضیح</button></div>{unit.notes.map((note, noteIndex) => <NoteEditor key={noteIndex} note={note} onChange={(next) => update((d) => { d[unitIndex].notes[noteIndex] = next; })} onDelete={() => update((d) => { d[unitIndex].notes.splice(noteIndex, 1); })} />)}</div></article>)}</div>
      {units.length === 0 && <div className="adminEmpty large">هنوز محتوایی برای این بخش ثبت نشده است.</div>}
    </div>
  );
}

function LiteraryPracticeEditor({ items, onChange }: { items: LiteraryPracticeItem[]; onChange: (items: LiteraryPracticeItem[]) => void }) {
  const update = (fn: (draft: LiteraryPracticeItem[]) => void) => { const next = clone(items); fn(next); onChange(next); };
  return <div><div className="adminPanelHeading"><div><h3>تمرین تشخیص آرایه</h3><p>بیت یا جمله را بنویس، آرایه‌های قابل انتخاب و پاسخ‌های صحیح را مشخص کن.</p></div><button className="button primary" onClick={() => update((d) => d.push({ id: `lp-${Date.now()}`, prompt: "", choices: ["تشبیه", "استعاره", "مجاز", "کنایه", "ایهام", "تلمیح"], correct: [], explanation: "" }))}>+ افزودن تمرین</button></div>{items.map((item, index) => <article className="adminQuestionEditor" key={item.id}><div className="adminMiniCardTop"><strong>تمرین {index + 1}</strong><button className="deleteMini" onClick={() => update((d) => { d.splice(index, 1); })}>حذف</button></div><label className="blockField"><span>بیت / جمله</span><textarea rows={3} value={item.prompt} onChange={(e) => update((d) => { d[index].prompt = e.target.value; })} /></label><label className="blockField"><span>آرایه‌های قابل انتخاب (با ویرگول جدا کن)</span><input value={item.choices.join("، ")} onChange={(e) => update((d) => { d[index].choices = splitTags(e.target.value); })} /></label><div className="artAnswerGrid">{item.choices.map((choice) => <label key={choice} className={`tagCheck ${item.correct.includes(choice) ? "active" : ""}`}><input type="checkbox" checked={item.correct.includes(choice)} onChange={(e) => update((d) => { d[index].correct = e.target.checked ? [...d[index].correct, choice] : d[index].correct.filter((x) => x !== choice); })} />{choice}</label>)}</div><label className="blockField"><span>توضیح پاسخ</span><textarea rows={3} value={item.explanation} onChange={(e) => update((d) => { d[index].explanation = e.target.value; })} /></label></article>)}{items.length === 0 && <div className="adminEmpty large">هنوز تمرین تشخیص آرایه ثبت نشده است.</div>}</div>;
}

function QuestionEditor({ questions, requiredTag, forceFinal = false, mutate }: { questions: TaggedQuestion[]; requiredTag: string; forceFinal?: boolean; mutate: (fn: (d: Lesson) => void) => void }) {
  const visible = questions.map((q, index) => ({ q, index })).filter(({ q }) => forceFinal ? q.sourceType === "final" || q.tags.includes("امتحان نهایی") : q.tags.includes(requiredTag));
  const add = () => mutate((d) => d.questions.push({ id: `q-${Date.now()}`, prompt: "", options: ["", "", "", ""], answer: 0, explanation: "", lessonHint: "", lessonAnchor: requiredTag, tags: forceFinal ? ["امتحان نهایی"] : [requiredTag], sourceType: forceFinal ? "final" : "authored", examPeriod: "" }));
  return <div><div className="adminPanelHeading"><div><h3>{forceFinal ? "سؤالات امتحان نهایی" : `سؤالات — ${requiredTag}`}</h3><p>تگ‌ها تعیین می‌کنند سؤال در چه بخش‌هایی نمایش داده شود.</p></div><button className="button primary" onClick={add}>+ افزودن سؤال</button></div>{visible.map(({ q: question, index }) => <article className="adminQuestionEditor" key={question.id}><div className="adminMiniCardTop"><strong>سؤال</strong><button className="deleteMini" onClick={() => mutate((d) => { d.questions.splice(index, 1); })}>حذف</button></div><label className="blockField"><span>صورت سؤال</span><textarea rows={3} value={question.prompt} onChange={(e) => mutate((d) => { d.questions[index].prompt = e.target.value; })} /></label><div className="questionOptionsEditor">{question.options.map((option, optionIndex) => <label key={optionIndex} className={`questionOptionField ${question.answer === optionIndex ? "correct" : ""}`}><input type="radio" checked={question.answer === optionIndex} onChange={() => mutate((d) => { d.questions[index].answer = optionIndex; })} /><span>گزینه {optionIndex + 1}</span><input value={option} onChange={(e) => mutate((d) => { d.questions[index].options[optionIndex] = e.target.value; })} /></label>)}</div><div className="formGrid two compact"><label><span>توضیح پاسخ</span><textarea rows={3} value={question.explanation} onChange={(e) => mutate((d) => { d.questions[index].explanation = e.target.value; })} /></label><label><span>ارجاع آموزشی</span><input placeholder="مثلاً: آرایه ← بیت ۳" value={question.lessonHint ?? ""} onChange={(e) => mutate((d) => { d.questions[index].lessonHint = e.target.value; })} /></label></div><div className="formGrid two compact"><label><span>تگ‌ها (با ویرگول جدا کن)</span><input value={question.tags.join("، ")} onChange={(e) => mutate((d) => { const tags = splitTags(e.target.value); if (!tags.includes(requiredTag)) tags.unshift(requiredTag); if (forceFinal && !tags.includes("امتحان نهایی")) tags.unshift("امتحان نهایی"); d.questions[index].tags = tags; })} /></label><label><span>دوره امتحان</span><input placeholder="مثلاً خرداد ۱۴۰۴" value={question.examPeriod ?? ""} onChange={(e) => mutate((d) => { d.questions[index].examPeriod = e.target.value; if (e.target.value && !d.questions[index].tags.includes(e.target.value)) d.questions[index].tags.push(e.target.value); })} /></label></div><div className="tagPreview">{question.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>)}{visible.length === 0 && <div className="adminEmpty large">هنوز سؤالی با تگ «{requiredTag}» ثبت نشده است.</div>}</div>;
}

function DomainsEditor({ lesson, mutate, subTab, setSubTab }: { lesson: Lesson; mutate: (fn: (d: Lesson) => void) => void; subTab: string; setSubTab: (v: string) => void }) {
  const [level, setLevel] = useState<"normal" | "advanced">("normal");
  const domainMap = { thinking: "قلمرو فکری", literary: "قلمرو ادبی", language: "قلمرو زبانی" } as const;
  const domain = (subTab === "literary" || subTab === "language" ? subTab : "thinking") as keyof Lesson["domains"];
  const units = lesson.domains[domain][level];
  return <div className="adminPanel"><SubTabs value={domain} onChange={setSubTab} items={[{ key: "thinking", label: "قلمرو فکری" }, { key: "literary", label: "قلمرو ادبی" }, { key: "language", label: "قلمرو زبانی" }]} /><div className="levelSwitch"><button className={level === "normal" ? "active" : ""} onClick={() => setLevel("normal")}>عادی</button><button className={level === "advanced" ? "active" : ""} onClick={() => setLevel("advanced")}>پیشرفته</button></div><UnitCollectionEditor title={`${domainMap[domain]} — ${level === "normal" ? "عادی" : "پیشرفته"}`} units={units} textType={lesson.textType} onChange={(next) => mutate((d) => { d.domains[domain][level] = next; })} /></div>;
}

function SubTabs({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: { key: string; label: string }[] }) {
  const valid = items.some((item) => item.key === value) ? value : items[0]?.key;
  return <div className="subTabs">{items.map((item) => <button key={item.key} className={valid === item.key ? "active" : ""} onClick={() => onChange(item.key)}>{item.label}</button>)}</div>;
}

function NoteEditor({ note, onChange, onDelete }: { note: TeachingNote; onChange: (note: TeachingNote) => void; onDelete: () => void }) {
  return <div className="noteEditorRow"><select value={note.kind} onChange={(e) => onChange({ ...note, kind: e.target.value as NoteKind })}>{noteKinds.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}</select><input value={note.title} placeholder="عنوان توضیح" onChange={(e) => onChange({ ...note, title: e.target.value })} /><textarea rows={2} value={note.text} placeholder="توضیح این نکته..." onChange={(e) => onChange({ ...note, text: e.target.value })} /><button className="deleteMini" onClick={onDelete}>حذف</button></div>;
}

function splitTags(value: string) {
  return value.split(/[،,]/).map((x) => x.trim()).filter(Boolean);
}
