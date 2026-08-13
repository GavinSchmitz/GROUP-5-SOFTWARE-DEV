export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Clock,
  HandHeart,
  ArrowRight,
  GraduationCap,
  Monitor,
  Palette,
  Dumbbell,
  Users,
  Star,
  Zap,
  Wrench,
  Music,
  Heart,
  Coffee,
  Megaphone,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const steps = [
  {
    icon: Clock,
    title: "Offer a Skill",
    description:
      "Share what you know — teach guitar, tutor math, fix a bike, or cook a meal. List your skill and set your availability.",
  },
  {
    icon: HandHeart,
    title: "Earn Time-Credits",
    description:
      "Every hour you help someone earns you one time-credit. Your time is valuable, and now it's backed by a real system.",
  },
  {
    icon: ArrowRight,
    title: "Spend on Help",
    description:
      "Use your credits to get help from others. Learn something new, get your garden tended, or have your CV reviewed.",
  },
];

const categories = [
  {
    icon: GraduationCap,
    title: "Education",
    description: "Tutoring, language lessons, music instruction, and academic support.",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
  },
  {
    icon: Wrench,
    title: "DIY & Trades",
    description: "Handyman repairs, carpentry, and practical home improvement projects.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Monitor,
    title: "Technology",
    description: "Web design, coding help, device setup, and digital literacy coaching.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
  },
  {
    icon: Palette,
    title: "Creative",
    description: "Photography, graphic design, writing, crafts, and artistic projects.",
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50",
  },
  {
    icon: Music,
    title: "Music",
    description: "Guitar, piano, vocals, and music production lessons.",
    color: "from-amber-500 to-yellow-600",
    bg: "bg-amber-50",
  },
  {
    icon: Dumbbell,
    title: "Fitness",
    description: "Personal training, workout coaching, and fitness guidance.",
    color: "from-orange-500 to-red-600",
    bg: "bg-orange-50",
  },
  {
    icon: Heart,
    title: "Wellness",
    description: "Yoga, meditation, and mindfulness sessions.",
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50",
  },
  {
    icon: Coffee,
    title: "Lifestyle",
    description: "Cooking classes and everyday life skills.",
    color: "from-stone-500 to-amber-700",
    bg: "bg-stone-50",
  },
  {
    icon: Megaphone,
    title: "Communication & Leadership",
    description:
      "Public speaking, mentoring, teamwork, and leadership skills that transfer to any career.",
    color: "from-fuchsia-500 to-purple-600",
    bg: "bg-fuchsia-50",
  },
];

const stats = [
  { value: "20+", label: "Skills", icon: Zap },
  { value: "5", label: "Demo Users", icon: Users },
  { value: "1:1", label: "Credit = Hour", icon: Clock },
  { value: "\u221E", label: "Possibilities", icon: Star },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gray-900 px-4 py-32 sm:py-44">
        {/* Background image */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage:
              "url('https://live.staticflickr.com/4475/37336676174_04010f1e8d_b.jpg')",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-900/95 to-amber-900/40" />
        {/* SVG dot pattern */}
        <div
          className="absolute inset-0 -z-[5] opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #f59e0b 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 -z-[4] h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 -z-[4] h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-5 py-2 text-sm font-medium text-amber-300 backdrop-blur-sm">
            <Clock className="h-4 w-4" />
            A time-banking community
          </div>
          <h1 className="text-5xl font-bold tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
            Exchange Skills,{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Not Money
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-300 sm:text-xl">
            HourBank is a community marketplace where everyone&apos;s time is
            equal. Teach a skill, earn a credit, spend it on help — no cash
            needed.
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/30"
            >
              Sign Up Free
            </Link>
            <Link
              href="/skills"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-white/15 hover:text-amber-300 hover:shadow-md"
            >
              Browse Skills
            </Link>
          </div>
          {/* Social proof avatars */}
          <div className="mt-16 flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-gray-900 bg-gradient-to-br from-amber-400 to-orange-500"
                  style={{ zIndex: 5 - i }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              Join <span className="font-semibold text-white">5+ users</span>{" "}
              already exchanging skills
            </p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative overflow-hidden bg-white px-4 py-24 sm:py-32">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{
            backgroundImage:
              "url('https://live.staticflickr.com/1912/45262367872_b0ec56f741_b.jpg')",
          }}
        />
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center">
            <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
              Simple Process
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Three simple steps to start exchanging skills with your
              community.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-2xl bg-gray-50 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-amber-100/50"
              >
                <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white shadow-lg shadow-amber-200">
                  {index + 1}
                </div>
                <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-200">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="relative bg-gray-50 px-4 py-24 sm:py-32">
        {/* Decorative SVG wave top */}
        <div className="absolute inset-x-0 top-0 -z-10 h-24 overflow-hidden">
          <svg
            className="h-full w-full"
            viewBox="0 0 1440 100"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 C360,100 1080,0 1440,50 L1440,0 L0,0 Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
              Discover
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-gray-900 sm:text-4xl">
              Explore Categories
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              From tech to cooking, there&apos;s a skill for everyone — and
              everyone has a skill to share.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.title}
                href={`/skills/category/${encodeURIComponent(category.title)}`}
              >
                <Card className="group h-full cursor-pointer overflow-hidden border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                  <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.15]`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${category.bg} text-gray-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                      >
                        <category.icon className="h-8 w-8" />
                      </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gray-100" />
                    <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gray-100" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-600 to-orange-600 px-8 py-16 shadow-2xl shadow-amber-300/30 sm:px-16 sm:py-20">
            {/* SVG pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative text-center">
              <h2 className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                Community in Numbers
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-amber-100">
                Growing every day, powered by people helping people.
              </p>
            </div>
            <div className="relative mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto mb-2 h-6 w-6 text-amber-200" />
                  <div className="text-4xl font-bold text-white drop-shadow-sm">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-amber-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonial-style Section ─── */}
      <section className="relative bg-white px-4 py-24 sm:py-32">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
          style={{
            backgroundImage:
              "url('https://live.staticflickr.com/3484/3962134615_a716811892_b.jpg')",
          }}
        />
        <div className="container mx-auto max-w-4xl text-center">
          <div className="relative rounded-3xl bg-gray-50 p-12 sm:p-16">
            {/* Decorative quote marks */}
            <div className="absolute left-8 top-6 text-6xl font-bold text-amber-200">
              &ldquo;
            </div>
            <p className="relative text-xl leading-relaxed text-gray-700 sm:text-2xl">
              I taught someone guitar for an hour and got my sink fixed the
              next day. No money, no apps, no hassle — just people helping
              people.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Demo User</p>
                <p className="text-sm text-gray-500">
                  HourBank Community Member
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-20 text-center shadow-2xl sm:px-16">
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{
                backgroundImage:
                  "url('https://live.staticflickr.com/3882/14635357121_060a0ab53a_b.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-amber-900/30" />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #f59e0b 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                Ready to Start?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
                Join HourBank and discover what happens when a community
                trades skills instead of cash. Your first hour is waiting.
              </p>
              <div className="mt-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
