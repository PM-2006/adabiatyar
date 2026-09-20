"use client";

import { useState } from "react";
import type { LiteraryPracticeItem } from "@/lib/data";

export default function LiteraryPractice({ items }: { items: LiteraryPracticeItem[] }) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (items.length === 0) return <div className="emptyState">هنوز تمرین تشخیص آرایه ثبت نشده است.</div>;

  return (
    <div className="practiceList">
      {items.map((item, index) => {
        const current = selected[item.id] ?? [];
        const isChecked = checked[item.id];
        return (
          <article className="practiceCard" key={item.id}>
            <span className="panelTag">تمرین {index + 1}</span>
            <blockquote>{item.prompt}</blockquote>
            <div className="artChips">
              {item.choices.map((choice) => {
                const active = current.includes(choice);
                const correct = isChecked && item.correct.includes(choice);
                const wrong = isChecked && active && !item.correct.includes(choice);
                return (
                  <button
                    key={choice}
                    disabled={isChecked}
                    className={`${active ? "active" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                    onClick={() => setSelected((old) => ({
                      ...old,
                      [item.id]: active ? current.filter((x) => x !== choice) : [...current, choice]
                    }))}
                  >{choice}</button>
                );
              })}
            </div>
            {!isChecked ? (
              <button className="button primary" onClick={() => setChecked((old) => ({ ...old, [item.id]: true }))}>بررسی پاسخ</button>
            ) : (
              <div className="feedback good"><b>پاسخ‌های صحیح:</b> {item.correct.join("، ")}<p>{item.explanation}</p></div>
            )}
          </article>
        );
      })}
    </div>
  );
}
