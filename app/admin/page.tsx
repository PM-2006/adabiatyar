import AdminStudio from "@/components/admin-studio";

export const metadata = { title: "پنل مدیریت محتوا | ادبیات‌یار" };

export default function AdminPage() {
  return (
    <section className="shell section adminPage">
      <div className="adminPageHeader">
        <div><span className="eyebrow">پنل مدیریت محتوا</span><h1>محتوای هر درس را موضوع‌به‌موضوع وارد کن</h1><p>حفظیات، معنی و مفهوم، آرایه، دستور، قلمروها، روان‌خوانی، امتحان نهایی و جمع‌بندی هرکدام تب مستقل دارند.</p></div>
        <div className="adminWarning">ذخیره‌ها فعلاً در همین مرورگر نگه داشته می‌شوند. بعد از هر جلسه «خروجی / بکاپ JSON» بگیر. فایل‌های JSON نسخه قبلی نیز هنگام Import به ساختار جدید تبدیل می‌شوند.</div>
      </div>
      <AdminStudio />
    </section>
  );
}
