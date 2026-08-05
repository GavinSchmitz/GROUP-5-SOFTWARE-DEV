import Link from "next/link";
import {
  Clock,
  HandHeart,
  ArrowRight,
  GraduationCap,
  Home,
  Monitor,
  Palette,
  Dumbbell,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
  },
  {
    icon: Home,
    title: "Home & Garden",
    description: "Handyman repairs, gardening, cleaning tips, and home improvement projects.",
  },
  {
    icon: Monitor,
    title: "Technology",
    description: "Web design, coding help, device setup, and digital literacy coaching.",
  },
  {
    icon: Palette,
    title: "Creative",
    description: "Photography, graphic design, writing, crafts, and artistic projects.",
  },
  {
    icon: Dumbbell,
    title: "Health & Fitness",
    description: "Personal training, yoga coaching, nutrition advice, and wellness support.",
  },
  {
    icon: Briefcase,
    title: "Professional",
    description: "Career coaching, CV reviews, interview prep, and business mentoring.",
  },
];

const stats = [
  { value: "20+", label: "Skills" },
  { value: "5", label: "Demo Users" },
  { value: "1 Credit = 1 Hour", label: "Simple Exchange" },
  { value: "\u221E", label: "Possibilities" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white px-4 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_800px_at_50%_-20%,rgba(245,158,11,0.15),transparent)]" />
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800">
            <Clock className="h-4 w-4" />
            A time-banking community
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
            Exchange Skills,{" "}
            <span className="text-amber-600">Not Money</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
            HourBank is a community marketplace where everyone&apos;s time is
            equal. Teach a skill, earn a credit, spend it on help — no cash
            needed.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button render={<Link href="/auth/signup" />} size="lg" className="bg-amber-600 hover:bg-amber-700">
              Sign Up Free
            </Button>
            <Button render={<Link href="/skills" />} variant="outline" size="lg">
              Browse Skills
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Three simple steps to start exchanging skills with your community.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="absolute left-1/2 top-8 -z-10 hidden -translate-x-1/2 text-[120px] font-bold text-gray-100 sm:block">
                  {index + 1}
                </div>
                <h3 className="relative mt-6 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="relative mt-3 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Explore Categories
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              From tech to cooking, there&apos;s a skill for everyone — and
              everyone has a skill to share.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.title}
                className="group cursor-pointer transition-all hover:shadow-lg hover:ring-amber-200"
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Community in Numbers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Growing every day, powered by people helping people.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-amber-600">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amber-600 px-4 py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Start?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-amber-100">
            Join HourBank and discover what happens when a community trades
            skills instead of cash. Your first hour is waiting.
          </p>
          <div className="mt-10">
            <Button
              render={<Link href="/auth/signup" />}
              size="lg"
              className="bg-white text-amber-700 hover:bg-amber-50"
            >
              Sign Up Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
