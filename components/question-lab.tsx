"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "@/lib/data";

export default function QuestionLab({ lesson }: { lesson: Lesson }) {
  const [tab, setTab] = useState<"flash" | "mcq">("flash");
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [ratings, setRatings] = useState<Record<string, "know" | "unsure" | "dont">>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const vocab = lesson.vocabulary;
  const currentCard = vocab[cardIndex];

  const knownCount = useMemo(
    () => Object.values(ratings).filter((x) => x === "know").length,
    [ratings]
  );

  function rateCurrent(value: "know" | "unsure" | "dont") {
    if (!currentCard) return;
    setRatings((old) => ({ ...old, [currentCard.word]: value }));
    setShowAnswer(false);
    setCardIndex((old) => (old + 1) % vocab.length);
  }

  return (
    <div>
      <div className="tabs">
        <button className={tab === "flash" ? "active" : ""} onClick={() => setTab("flash")}>فلش‌کارت واژگان</button>
        <button className={tab === "mcq" ? "active" : ""} onClick={() => setTab("mcq")}>سؤال‌های گزینه‌ای</button>
      </div>

      {tab === "flash" && (
        <section className="quizPanel">
          <div className="quizMeta">
            <span>کارت {vocab.length ? cardIndex + 1 : 0} از {vocab.length}</span>
            <span>بلد بودم: {knownCount}</span>
          </div>
          {!currentCard ? (
            <div className="emptyState">برای این درس هنوز واژه‌ای وارد نشده است.</div>
          ) : (
            <div className="flashcard">
              <div className="word">{currentCard.word}</div>
              <blockquote>{currentCard.quote}</blockquote>
              {!showAnswer ? (
                <button className="button primary" onClick={() => setShowAnswer(true)}>نمایش پاسخ</button>
              ) : (
                <>
                  <div className="answerBox">
                    <p><b>معنی:</b> {currentCard.meaning}</p>
                    {currentCard.note && <p><b>نکته:</b> {currentCard.note}</p>}
                  </div>
                  <p className="selfCheck">این واژه را چقدر بلد بودی؟</p>
                  <div className="ratingButtons">
                    <button onClick={() => rateCurrent("know")}>بلد بودم</button>
                    <button onClick={() => rateCurrent("unsure")}>شک داشتم</button>
                    <button onClick={() => rateCurrent("dont")}>بلد نبودم</button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {tab === "mcq" && (
        <section className="questionList">
          {lesson.questions.length === 0 && <div className="emptyState">برای این درس هنوز سؤال وارد نشده است.</div>}
          {lesson.questions.map((question, index) => {
            const selected = answers[question.id];
            const answered = selected !== undefined;
            const correct = answered && selected === question.answer;

            return (
              <article className="questionCard" key={question.id}>
                <div className="questionTop">
                  <span>سؤال {index + 1}</span>
                  {answered && <span className={correct ? "status correct" : "status wrong"}>{correct ? "پاسخ درست" : "نیاز به مرور"}</span>}
                </div>
                <h3>{question.prompt}</h3>
                <div className="options">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selected === optionIndex;
                    const isCorrectOption = answered && optionIndex === question.answer;
                    const isWrongSelected = answered && isSelected && optionIndex !== question.answer;
                    let cls = "option";
                    if (isCorrectOption) cls += " correctOption";
                    if (isWrongSelected) cls += " wrongOption";
                    if (isSelected) cls += " selected";
                    return (
                      <button
                        key={option}
                        className={cls}
                        disabled={answered}
                        onClick={() => setAnswers((old) => ({ ...old, [question.id]: optionIndex }))}
                      >
                        <span className="optionBullet">{String.fromCharCode(65 + optionIndex)}</span>{option}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className={correct ? "feedback good" : "feedback bad"}>
                    <b>{correct ? "درست است." : "پاسخ درست را ببین:"}</b>
                    <p>{question.explanation}</p>
                    {!correct && <a className="lessonHint" href={`../teach#${question.lessonAnchor}`}>مرور آموزش مرتبط: {question.lessonHint}</a>}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
