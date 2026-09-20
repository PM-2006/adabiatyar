"use client";

import { useState } from "react";
import type { TaggedQuestion } from "@/lib/data";

export default function TaggedQuestionList({ questions }: { questions: TaggedQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (questions.length === 0) {
    return <div className="emptyState">هنوز سؤالی برای این بخش ثبت نشده است.</div>;
  }

  return (
    <div className="questionList">
      {questions.map((question, index) => {
        const selected = answers[question.id];
        const answered = selected !== undefined;
        const correct = answered && selected === question.answer;
        return (
          <article className="questionCard" key={question.id}>
            <div className="questionTop">
              <span>سؤال {index + 1}</span>
              <div className="questionTags">
                {question.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
            {question.examPeriod && <div className="examPeriod">{question.examPeriod}</div>}
            <h3>{question.prompt}</h3>
            <div className="options">
              {question.options.map((option, optionIndex) => {
                const isCorrect = answered && optionIndex === question.answer;
                const isWrong = answered && selected === optionIndex && optionIndex !== question.answer;
                return (
                  <button
                    key={optionIndex}
                    disabled={answered}
                    className={`option ${isCorrect ? "correctOption" : ""} ${isWrong ? "wrongOption" : ""}`}
                    onClick={() => setAnswers((old) => ({ ...old, [question.id]: optionIndex }))}
                  >
                    <span className="optionBullet">{optionIndex + 1}</span>
                    {option}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className={correct ? "feedback good" : "feedback bad"}>
                <b>{correct ? "پاسخ درست است." : "پاسخ درست:"}</b>
                <p>{question.explanation}</p>
                {question.lessonHint && <small>مرور مرتبط: {question.lessonHint}</small>}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
