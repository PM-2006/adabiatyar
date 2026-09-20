import Link from "next/link";
export default function NotFound() {
  return <section className="shell section center"><h1>این صفحه پیدا نشد.</h1><Link className="button primary" href="/">بازگشت به خانه</Link></section>;
}
