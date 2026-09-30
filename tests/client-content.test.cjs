const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Use the project's TypeScript compiler so these tests need no extra runner.
const modules = new Map();
function load(name) {
  if (modules.has(name)) return modules.get(name).exports;
  const file = path.join(__dirname, "..", name + ".ts");
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const module = { exports: {} };
  modules.set(name, module);
  new Function("require", "module", "exports", source)(
    id => id.startsWith("@/") ? load(id.slice(2)) : require(id), module, module.exports
  );
  return module.exports;
}

const { lessons: seed } = load("lib/data");
const { loadContentLessons, saveContentLessons, resetContentLessons, STORAGE_KEY } = load("lib/client-content");
const legacyKey = "adabiatyar-admin-content-v1";
function browser() {
  const entries = new Map();
  const target = new EventTarget();
  target.localStorage = {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: key => entries.delete(key)
  };
  global.window = target;
  return entries;
}
afterEach(() => { delete global.window; });

test("server and empty browser safely fall back to independent seed copies", () => {
  assert.deepEqual(loadContentLessons().lessons, seed);
  browser();
  const result = loadContentLessons();
  assert.equal(result.source, "seed");
  result.lessons[0].title = "changed";
  assert.notEqual(loadContentLessons().lessons[0].title, "changed");
});

test("saved v2 lessons replace seed content and keep custom slugs and sections", () => {
  const entries = browser();
  const custom = structuredClone(seed[0]);
  custom.slug = "custom-admin-lesson";
  custom.title = "Saved lesson";
  custom.meaningUnits[0].text = ["Saved section text"];
  const raw = JSON.stringify([custom]);
  entries.set(STORAGE_KEY, raw);
  entries.set(legacyKey, JSON.stringify([{ title: "older" }]));
  const result = loadContentLessons();
  assert.equal(result.source, "saved");
  assert.deepEqual(result.lessons, [{ ...custom, questions: custom.questions.map(q => ({ ...q, examPeriod: q.examPeriod ?? "" })) }]);
  assert.equal(entries.get(STORAGE_KEY), raw, "reading must not rewrite saved content");
});

test("legacy lessons and questions use the same backward-compatible migration", () => {
  const entries = browser();
  const old = { slug: "legacy", title: "Old lesson", teachingUnits: [{ id: "old-unit", label: "Old", text: ["Old content"], notes: [] }], questions: [{ id: "old-q", prompt: "Question", lessonAnchor: "literary" }] };
  entries.set(legacyKey, JSON.stringify([old]));
  const result = loadContentLessons().lessons[0];
  assert.deepEqual(result.meaningUnits, old.teachingUnits);
  assert.deepEqual(result.literaryPractice, []);
  assert.deepEqual(result.domains.language, { normal: [], advanced: [] });
  assert.deepEqual(result.questions[0].tags, ["آرایه"]);
  assert.equal(result.questions[0].sourceType, "authored");
  assert.equal(result.reading.kind, "ندارد");
  assert.equal(entries.has(STORAGE_KEY), false);
});

test("older v2 exports get defaults for optional sections and question tags", () => {
  const entries = browser();
  const old = structuredClone(seed[0]);
  delete old.literaryPractice;
  delete old.summaryUnits;
  delete old.domains.language;
  delete old.questions[0].tags;
  entries.set(STORAGE_KEY, JSON.stringify([old]));
  const lesson = loadContentLessons().lessons[0];
  assert.deepEqual(lesson.literaryPractice, []);
  assert.deepEqual(lesson.summaryUnits, []);
  assert.deepEqual(lesson.domains.language, { normal: [], advanced: [] });
  assert.ok(lesson.questions[0].tags.length > 0);
});

test("invalid or inaccessible storage falls back without deleting the original", () => {
  const entries = browser();
  for (const raw of ["broken JSON", "{}", "[]", '[{"questions":{}}]']) {
    entries.set(STORAGE_KEY, raw);
    assert.equal(loadContentLessons().source, "unreadable");
    assert.deepEqual(loadContentLessons().lessons, seed);
    assert.equal(entries.get(STORAGE_KEY), raw);
  }
  window.localStorage.getItem = () => { throw new Error("storage blocked"); };
  assert.deepEqual(loadContentLessons().lessons, seed);
});

test("save and reset notify listeners after storage changes, using the unchanged key", () => {
  const entries = browser();
  entries.set(legacyKey, "old");
  const sources = [];
  window.addEventListener("adabiatyar-content-updated", () => sources.push(loadContentLessons().source));
  saveContentLessons(seed);
  assert.equal(STORAGE_KEY, "adabiatyar-admin-content-v2");
  assert.equal(entries.get(STORAGE_KEY), JSON.stringify(seed));
  assert.equal(entries.has(legacyKey), false);
  resetContentLessons();
  assert.equal(entries.has(STORAGE_KEY), false);
  assert.deepEqual(sources, ["saved", "seed"]);
});
