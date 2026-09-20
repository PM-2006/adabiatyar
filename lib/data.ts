export type NoteKind =
  | "meaning"
  | "concept"
  | "vocabulary"
  | "literary"
  | "grammar"
  | "exam"
  | "spelling";

export type TeachingNote = {
  kind: NoteKind;
  title: string;
  text: string;
};

export type TeachingUnit = {
  id: string;
  label: string;
  text: string[];
  notes: TeachingNote[];
};

export type VocabularyItem = {
  word: string;
  quote: string;
  meaning: string;
  note?: string;
};

export type SpellingItem = {
  word: string;
  quote: string;
  note?: string;
  homophone?: string;
};

export type LiteraryPracticeItem = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string[];
  explanation: string;
};

export type TaggedQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  lessonHint?: string;
  lessonAnchor?: string;
  tags: string[];
  sourceType: "authored" | "final";
  examPeriod?: string;
};

export type DomainLevel = {
  normal: TeachingUnit[];
  advanced: TeachingUnit[];
};

export type Lesson = {
  slug: string;
  title: string;
  subtitle: string;
  textType: "poetry" | "prose" | "mixed";
  textTypeLabel: string;
  intro: {
    author: string;
    format: string;
    notes: string[];
  };
  vocabulary: VocabularyItem[];
  spelling: SpellingItem[];
  meaningUnits: TeachingUnit[];
  literaryUnits: TeachingUnit[];
  literaryPractice: LiteraryPracticeItem[];
  grammarUnits: TeachingUnit[];
  domains: {
    thinking: DomainLevel;
    literary: DomainLevel;
    language: DomainLevel;
  };
  reading: {
    kind: "روان‌خوانی" | "حکایت" | "شعرخوانی" | "شعر حفظی" | "ندارد";
    units: TeachingUnit[];
  };
  summaryUnits: TeachingUnit[];
  questions: TaggedQuestion[];
};

export const sectionCards = [
  { key: "memorization", letter: "A", title: "حفظیات", description: "مقدمه، واژه‌نامه، جعبه لایتنر و املا", icon: "ح" },
  { key: "meaning", letter: "B", title: "معنی و مفهوم", description: "درسنامه معنی و مفهوم + سؤال‌های آموزشی", icon: "م" },
  { key: "literary", letter: "C", title: "آرایه‌های ادبی", description: "درسنامه، تمرین تشخیص آرایه و سؤال‌ها", icon: "آ" },
  { key: "grammar", letter: "D", title: "دستور زبان", description: "درسنامه دستوری + سؤال‌ها", icon: "د" },
  { key: "domains", letter: "E", title: "قلمروها", description: "فکری، ادبی و زبانی در سطح عادی و پیشرفته", icon: "ق" },
  { key: "reading", letter: "F", title: "روان‌خوانی / حکایت / شعرخوانی", description: "بخش تکمیلی متناسب با نوع درس", icon: "ر" },
  { key: "final", letter: "G", title: "سؤالات امتحان نهایی", description: "سؤالات دوره‌های قبل با تگ موضوع و دوره", icon: "ن" },
  { key: "summary", letter: "H", title: "جمع‌بندی", description: "مرور سریع نکات مهم همان درس", icon: "ج" }
] as const;

export type SectionKey = (typeof sectionCards)[number]["key"];

export const lessons: Lesson[] = [
  {
    slug: "lesson-1",
    title: "درس ۱ — نمونه شعر",
    subtitle: "نمونه ساختار جدید درس با بخش‌های مستقل",
    textType: "poetry",
    textTypeLabel: "نظم / شعر",
    intro: {
      author: "نمونه: شاعر",
      format: "نمونه: غزل",
      notes: ["قالب و فضای کلی اثر", "ویژگی‌های مهم متن", "نکات کوتاه پیش از شروع درس"]
    },
    vocabulary: [
      { word: "دوش", quote: "دوش دیدم که ملائک در میخانه زدند", meaning: "دیشب", note: "در بافت دیگر می‌تواند به معنی شانه باشد." },
      { word: "طلب", quote: "دست از طلب ندارم تا کام من برآید", meaning: "جست‌وجو و کوشش", note: "در ترکیب «دست از طلب داشتن» معنای کنایی دارد." }
    ],
    spelling: [
      { word: "ملائک", quote: "دوش دیدم که ملائک در میخانه زدند", note: "به همزه و ترتیب حروف توجه شود." }
    ],
    meaningUnits: [
      {
        id: "meaning-1",
        label: "بیت ۱",
        text: ["دوش دیدم که ملائک در میخانه زدند", "گل آدم بسرشتند و به پیمانه زدند"],
        notes: [
          { kind: "meaning", title: "معنی روان", text: "دیشب در رؤیا دیدم که فرشتگان سرشت آدمی را با عشق آمیختند." },
          { kind: "concept", title: "مفهوم", text: "اشاره به آفرینش انسان و پیوند او با عشق." }
        ]
      }
    ],
    literaryUnits: [
      {
        id: "literary-1",
        label: "بیت ۱",
        text: ["دوش دیدم که ملائک در میخانه زدند", "گل آدم بسرشتند و به پیمانه زدند"],
        notes: [
          { kind: "literary", title: "آرایه‌های مهم", text: "میخانه و پیمانه ظرفیت معنایی نمادین دارند و باید در بافت بررسی شوند." }
        ]
      }
    ],
    literaryPractice: [
      {
        id: "lp-1",
        prompt: "دوش دیدم که ملائک در میخانه زدند",
        choices: ["تشبیه", "استعاره", "مجاز", "کنایه", "تلمیح", "واج‌آرایی"],
        correct: ["استعاره"],
        explanation: "این داده صرفاً نمونه است؛ پاسخ واقعی بر اساس محتوای نهایی درس جایگزین می‌شود."
      }
    ],
    grammarUnits: [
      {
        id: "grammar-1",
        label: "بیت ۲",
        text: ["دست از طلب ندارم تا کام من برآید"],
        notes: [{ kind: "grammar", title: "نکته دستوری", text: "نقش‌ها و ساختار جمله در این قسمت تحلیل می‌شود." }]
      }
    ],
    domains: {
      thinking: {
        normal: [{ id: "think-normal-1", label: "قلمرو فکری عادی", text: ["مفهوم بیت چیست؟"], notes: [{ kind: "concept", title: "پاسخ", text: "پایداری در راه رسیدن به هدف." }] }],
        advanced: [{ id: "think-advanced-1", label: "قلمرو فکری پیشرفته", text: ["این مفهوم با کدام بخش‌های دیگر کتاب پیوند دارد؟"], notes: [{ kind: "concept", title: "بررسی پیشرفته", text: "پیوندهای مفهومی و بیت‌های هم‌معنا اینجا بررسی می‌شوند." }] }]
      },
      literary: { normal: [], advanced: [] },
      language: { normal: [], advanced: [] }
    },
    reading: { kind: "شعرخوانی", units: [] },
    summaryUnits: [
      { id: "summary-1", label: "مرور سریع", text: ["واژه‌های مهم، مفهوم‌ها و نکات پرتکرار این درس"], notes: [{ kind: "exam", title: "برای جمع‌بندی", text: "این بخش بعداً با محتوای واقعی کامل می‌شود." }] }
    ],
    questions: [
      {
        id: "q1",
        prompt: "معنی «دوش» در این بیت چیست؟",
        options: ["شانه", "دیشب", "امروز", "صبح"],
        answer: 1,
        explanation: "در این بافت «دوش» به معنی دیشب است.",
        lessonHint: "حفظیات ← واژه‌نامه",
        lessonAnchor: "memorization",
        tags: ["واژه", "حفظیات"],
        sourceType: "authored"
      },
      {
        id: "q2",
        prompt: "مفهوم اصلی «دست از طلب ندارم...» چیست؟",
        options: ["ناامیدی", "پایداری", "سکوت", "ترس"],
        answer: 1,
        explanation: "بیت بر ادامه تلاش تا رسیدن به مقصود تأکید دارد.",
        lessonHint: "معنی و مفهوم",
        lessonAnchor: "meaning",
        tags: ["معنی و مفهوم", "قلمرو فکری"],
        sourceType: "authored"
      },
      {
        id: "q-final-1",
        prompt: "نمونه سؤال نهایی مرتبط با آرایه این درس",
        options: ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
        answer: 0,
        explanation: "توضیح نمونه پاسخ.",
        lessonHint: "آرایه‌های ادبی",
        lessonAnchor: "literary",
        tags: ["آرایه", "امتحان نهایی", "خرداد ۱۴۰۴"],
        sourceType: "final",
        examPeriod: "خرداد ۱۴۰۴"
      }
    ]
  }
];

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function questionsByTags(lesson: Lesson, tags: string[]) {
  return lesson.questions.filter((question) => tags.some((tag) => question.tags.includes(tag)));
}
