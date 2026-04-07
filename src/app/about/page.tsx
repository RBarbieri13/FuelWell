"use client";

import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";
import { GradientButton } from "@/components/ui/gradient-button";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  UserCheck,
  HeartHandshake,
  TrendingUp,
  Handshake,
  Infinity,
} from "lucide-react";
import Image from "next/image";


const principles = [
  {
    icon: UserCheck,
    title: "The user always runs the show",
  },
  {
    icon: HeartHandshake,
    title: "No guilt, no judgment, no \"failure\"",
  },
  {
    icon: TrendingUp,
    title: "Sustainable progress over perfection",
  },
  {
    icon: Handshake,
    title: "Enhancing trainers, not replacing them",
  },
  {
    icon: Infinity,
    title: "Fitness is a lifelong journey",
  },
];

const faqItems = [
  {
    value: "different",
    question: "What makes FuelWell different from other fitness apps?",
    answer:
      "Most fitness apps focus on tracking what you already did. FuelWell focuses on helping you make better decisions in the moment. Our AI adapts to your real life — your schedule, preferences, energy levels, and goals — so the guidance you get is always relevant and actionable.",
  },
  {
    value: "trainer",
    question: "Will FuelWell replace my personal trainer?",
    answer:
      "No, and that is by design. FuelWell is built to complement human coaching, not replace it. Think of it as your always-available assistant that fills in the gaps between sessions with your trainer, nutritionist, or coach.",
  },
  {
    value: "ai-coaching",
    question: "How does the AI coaching work?",
    answer:
      "FuelWell uses conversational AI that learns your patterns over time. It provides real-time guidance on nutrition, workouts, and recovery based on your goals, habits, and current context. The more you use it, the smarter it gets about what works for you.",
  },
  {
    value: "founders-100",
    question: "What is the Founders 100 program?",
    answer:
      "The Founders 100 is a limited early access program for our first 100 members. You get lifetime pricing locked in at the early access rate, a direct feedback channel to the founding team, and the ability to shape the product from day one.",
  },
  {
    value: "data-safety",
    question: "Is my data safe?",
    answer:
      "Absolutely. FuelWell is privacy-first. Your data belongs to you, period. We never sell your personal information to third parties, and you can export or delete your data at any time.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-200/20 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] rounded-full bg-violet-200/15 blur-[100px] animate-float-slower" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-12 md:pb-16">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <h1 className="gradient-text">Why FuelWell Was Created</h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
              A smarter approach to health — built for real life, not
              perfection.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Founder Story */}
      <Section className="bg-fw-surface">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto space-y-6">
            <h2>Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We got tired of the same cycle: start a plan on Monday, life
              happens by Wednesday, quit by Friday. Rigid diets and
              cookie-cutter workouts weren&apos;t built for people with real
              schedules, real budgets, and real appetites.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              So we built what we wished existed — a coach that actually
              understands your day. One that helps you pick the right thing at a
              restaurant, adjusts when you&apos;re sore, and doesn&apos;t make you feel
              guilty for eating pizza on a Saturday night.
            </p>
          </div>
        </AnimatedSection>
      </Section>

      {/* Meet the Founders */}
      <Section>
        <AnimatedSection className="text-center mb-10">
          <h2>Meet the Founders</h2>
        </AnimatedSection>

        <AnimatedSection>
          <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto mb-12">
            We&apos;re Max and Robby — two guys who got tired of nutrition
            apps that felt like spreadsheets. We&apos;ve both been through
            the cycle of tracking obsessively, burning out, and quitting.
            FuelWell is what we wished existed: a coach that meets you where
            you are, and adapts to your life.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-3xl mx-auto">
          <AnimatedSection delay={0.1}>
            <div className="group text-center space-y-5">
              <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-fw-accent/40 via-emerald-200/30 to-violet-300/30 group-hover:from-fw-accent/60 group-hover:via-emerald-300/40 group-hover:to-violet-400/40 transition-all duration-500 blur-sm" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-[3px] border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src="/max.png"
                    alt="Max — Founder & President"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Max</h3>
                <p className="text-base text-fw-accent font-semibold mt-1">Founder &amp; President</p>
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="group text-center space-y-5">
              <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-fw-accent/40 via-emerald-200/30 to-violet-300/30 group-hover:from-fw-accent/60 group-hover:via-emerald-300/40 group-hover:to-violet-400/40 transition-all duration-500 blur-sm" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-[3px] border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src="/robby.png"
                    alt="Robby — Co-Founder & CTO"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Robby</h3>
                <p className="text-base text-fw-accent font-semibold mt-1">Co-Founder &amp; Chief Technology Officer</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </Section>

      {/* Principles Grid */}
      <Section className="bg-fw-surface">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {principles.map((principle, index) => (
            <AnimatedSection key={principle.title} delay={index * 0.1}>
              <div className="group bg-white border border-fw-border rounded-xl p-8 text-center space-y-4 shadow-card hover:-translate-y-1 hover:border-fw-accent/30 transition-all duration-300">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 mx-auto transition-colors duration-200">
                  <principle.icon className="w-7 h-7 text-fw-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-lg font-semibold text-foreground">{principle.title}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-fw-surface">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-8">Frequently Asked Questions</h2>
            <Accordion className="space-y-2">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.value}
                  value={item.value}
                  className="bg-white border border-fw-border rounded-xl px-4 shadow-card"
                >
                  <AccordionTrigger className="text-lg font-semibold text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-base text-muted-foreground leading-relaxed">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AnimatedSection>
      </Section>

      {/* CTA */}
      <Section>
        <AnimatedSection>
          <div className="text-center space-y-6">
            <h2>Ready to try it?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Be one of the first 100 members to shape what FuelWell becomes.
            </p>
            <GradientButton href="/founders-100">
              Secure Your Spot
              <ArrowRight className="ml-2 h-4 w-4" />
            </GradientButton>
          </div>
        </AnimatedSection>
      </Section>
    </>
  );
}
