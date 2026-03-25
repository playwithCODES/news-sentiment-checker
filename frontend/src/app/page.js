import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 p-6">
      <div className="max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl">
        <h1 className="mb-4 text-4xl font-bold text-blue-700">News Sentiment Checker</h1>

        <p className="mb-6 text-slate-600">
          Analyze news articles and find whether they are Positive, Negative, or Neutral.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/login" className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            Login
          </Link>

          <Link href="/register" className="rounded-lg bg-slate-200 px-6 py-3 hover:bg-slate-300">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}