const groups = [
  { title: "حفظیات", items: ["واژگان", "املا", "تاریخ ادبیات", "شعرهای حفظی"] },
  { title: "قلمرو ادبی", items: ["همه ایهام‌ها", "اسلوب معادله", "تلمیح‌ها", "دام‌های آرایه‌ای"] },
  { title: "قلمرو زبانی", items: ["کاربردهای «را»", "حذف", "نقش دستوری", "فعل و گروه اسمی"] },
  { title: "قلمرو فکری", items: ["مفاهیم پرتکرار", "بیت‌های هم‌مفهوم", "معنی‌های متفاوت واژه‌ها", "پیوند مفهومی درس‌ها"] }
];

export default function ReviewPage() {
  return (
    <section className="shell section">
      <div className="sectionHeading">
        <span className="eyebrow">همه کتاب در یک نگاه</span>
        <h1>جمع‌بندی و مرور</h1>
        <p>اطلاعات کل کتاب را بر اساس موضوع و قلمرو کنار هم می‌گذاریم، نه صرفاً شماره درس.</p>
      </div>
      <div className="reviewGrid">
        {groups.map((group) => (
          <article className="reviewCard" key={group.title}>
            <h2>{group.title}</h2>
            <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            <div className="comingSoon">در حال آماده‌سازی محتوا</div>
          </article>
        ))}
      </div>
    </section>
  );
}
