import type { Metadata } from "next";
import Link from "next/link";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap"
});

export const metadata: Metadata = {
  title: "ادبیات‌یار",
  description: "پلتفرم آموزش و تمرین ادبیات فارسی"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.variable}>
        <header className="topbar">
          <div className="shell nav">
            <Link href="/" className="brand">
              <span className="brandMark">ا</span>
              <span className="brandCopy">
                <strong>ادبیات‌یار</strong>
                <small>آموزش هوشمند ادبیات فارسی</small>
              </span>
            </Link>
            <nav className="navlinks">
              <Link href="/lessons">درس‌به‌درس</Link>
              <Link href="/review">جمع‌بندی و مرور</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
