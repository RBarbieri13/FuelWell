import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <header className="border-b border-neutral-200">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">FuelWell</span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
            Your AI-Powered
            <span className="text-primary-500"> Nutrition Coach</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-600 leading-8">
            Track meals, hit your macros, and reach your fitness goals with
            personalized AI coaching. FuelWell adapts to your lifestyle and
            preferences.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 text-base font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
            >
              Start Free
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 text-base font-semibold text-neutral-700 hover:text-neutral-900"
            >
              Learn more &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            Everything you need to fuel your goals
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Meal Coaching",
                desc: "Get personalized suggestions based on your goals, preferences, and what you've eaten today.",
              },
              {
                title: "Smart Macro Tracking",
                desc: "Automatic calorie and macro calculations tailored to your body and activity level.",
              },
              {
                title: "Progress Insights",
                desc: "Visual dashboards showing your trends, streaks, and areas for improvement.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-neutral-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-neutral-500 border-t border-neutral-200">
        &copy; {new Date().getFullYear()} FuelWell. All rights reserved.
      </footer>
    </div>
  );
}
