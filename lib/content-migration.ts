import type { Lesson, TeachingUnit, TaggedQuestion } from "@/lib/data";

function blankDomain() {
  return { normal: [] as TeachingUnit[], advanced: [] as TeachingUnit[] };
}

export function createLesson(index: number): Lesson {
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

export function migrateLesson(raw: any, index: number): Lesson {
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

