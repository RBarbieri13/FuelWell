"use client";

import { AnimatedSection } from "@/components/animated-section";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  UserCheck,
  HeartHandshake,
  TrendingUp,
  Handshake,
  Infinity,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ───── Data ───── */

const principles = [
  { icon: UserCheck, title: "The user always runs the show" },
  { icon: HeartHandshake, title: 'No guilt, no judgment, no "failure"' },
  { icon: TrendingUp, title: "Sustainable progress over perfection" },
  { icon: Handshake, title: "Enhancing trainers, not replacing them" },
  { icon: Infinity, title: "Fitness is a lifelong journey" },
];

const faqItems = [
  {
    question: "What makes FuelWell different from other fitness apps?",
    answer:
      "Most fitness apps focus on tracking what you already did. FuelWell focuses on helping you make better decisions in the moment. Our AI adapts to your real life — your schedule, preferences, energy levels, and goals — so the guidance you get is always relevant and actionable.",
  },
  {
    question: "Will FuelWell replace my personal trainer?",
    answer:
      "No, and that is by design. FuelWell is built to complement human coaching, not replace it. Think of it as your always-available assistant that fills in the gaps between sessions with your trainer, nutritionist, or coach.",
  },
  {
    question: "How does the AI coaching work?",
    answer:
      "FuelWell uses conversational AI that learns your patterns over time. It provides real-time guidance on nutrition, workouts, and recovery based on your goals, habits, and current context. The more you use it, the smarter it gets about what works for you.",
  },
  {
    question: "What is the Founders 100 program?",
    answer:
      "The Founders 100 is a limited early access program for our first 100 members. You get lifetime pricing locked in at the early access rate, a direct feedback channel to the founding team, and the ability to shape the product from day one.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Absolutely. FuelWell is privacy-first. Your data belongs to you, period. We never sell your personal information to third parties, and you can export or delete your data at any time.",
  },
];

/* ───── FAQ Accordion ───── */

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-[#e7e8e8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left px-6 py-5 gap-4"
      >
        <span className="text-base font-semibold text-[#191c1d]">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-[#6c7a71] shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm text-[#3c4a42] leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───── Page ───── */

export default function V2AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#f8f9fa] pt-24 md:pt-36 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="v2-label">Our Story</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191c1d] mt-3 leading-[1.08] tracking-tight">
              Why FuelWell Was{" "}
              <span className="v2-gradient-text">Created</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#3c4a42] leading-relaxed">
              A smarter approach to health — built for real life, not
              perfection.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-[#191c1d]">Our Story</h2>
              <span className="v2-underline-bar" />
              <p className="text-lg text-[#3c4a42] leading-relaxed">
                We got tired of the same cycle: start a plan on Monday, life
                happens by Wednesday, quit by Friday. Rigid diets and
                cookie-cutter workouts weren&apos;t built for people with real
                schedules, real budgets, and real appetites.
              </p>
              <p className="text-lg text-[#3c4a42] leading-relaxed">
                So we built what we wished existed — a coach that actually
                understands your day. One that helps you pick the right thing at
                a restaurant, adjusts when you&apos;re sore, and doesn&apos;t
                make you feel guilty for eating pizza on a Saturday night.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Meet the Founders */}
      <section className="py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <span className="v2-label">Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              Meet the Founders
            </h2>
            <span className="v2-underline-bar mx-auto" />
          </AnimatedSection>

          <AnimatedSection>
            <p className="text-lg text-[#3c4a42] leading-relaxed text-center max-w-3xl mx-auto mb-12">
              We&apos;re Max and Robby — two guys who got tired of nutrition
              apps that felt like spreadsheets. We&apos;ve both been through the
              cycle of tracking obsessively, burning out, and quitting. FuelWell
              is what we wished existed: a coach that meets you where you are
              and adapts to your life.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-3xl mx-auto">
            <AnimatedSection delay={0.1}>
              <div className="text-center space-y-5">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#006c49] to-[#10b981] blur-md opacity-20" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#e7e8e8] shadow-[0_20px_40px_rgba(0,105,68,0.06)]">
                    <Image
                      src="/max.png"
                      alt="Max — Founder & President"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#191c1d]">Max</h3>
                  <p className="text-base text-[#006c49] font-semibold mt-1">
                    Founder &amp; President
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="text-center space-y-5">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#006c49] to-[#10b981] blur-md opacity-20" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#e7e8e8] shadow-[0_20px_40px_rgba(0,105,68,0.06)]">
                    <Image
                      src="/robby.png"
                      alt="Robby — Co-Founder & CTO"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#191c1d]">Robby</h3>
                  <p className="text-base text-[#006c49] font-semibold mt-1">
                    Co-Founder &amp; Chief Technology Officer
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <span className="v2-label">Principles</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              What We Believe
            </h2>
            <span className="v2-underline-bar mx-auto" />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <AnimatedSection key={principle.title} delay={index * 0.1}>
                  <div className="rounded-2xl border border-[#e7e8e8] bg-white p-8 text-center space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,105,68,0.06)] transition-all duration-300">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#006c49]/10 mx-auto">
                      <Icon className="w-7 h-7 text-[#006c49]" />
                    </div>
                    <p className="text-lg font-semibold text-[#191c1d]">
                      {principle.title}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="v2-label">FAQ</span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
                  Frequently Asked Questions
                </h2>
                <span className="v2-underline-bar mx-auto" />
              </div>
              <div className="space-y-3">
                {faqItems.map((item) => (
                  <FaqItem key={item.question} {...item} />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="v2-cta-green py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to try it?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Be one of the first 100 members to shape what FuelWell becomes.
            </p>
            <Link
              href="/v2/founders-100"
              className="inline-flex items-center gap-2 h-12 px-8 text-base font-semibold text-[#006c49] bg-white rounded-full hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
            >
              Secure Your Spot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
