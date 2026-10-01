"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, Check, Clock, Signal } from "lucide-react";
import { TrainingForm, type TrainingFormHandle } from "@/components/forms/training-form";
import { courseCategories, courses } from "@/content/training";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function TrainingCatalogue() {
  const [category, setCategory] = useState<string>("All");
  const formRef = useRef<TrainingFormHandle>(null);
  const formSection = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => (category === "All" ? courses : courses.filter((course) => course.category === category)), [category]);

  function enquire(slug: string) {
    formRef.current?.selectCourse(slug);
    formSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div role="group" aria-label="Filter courses" className="flex flex-wrap gap-2">
        {["All", ...courseCategories].map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              category === item ? "border-navy bg-navy text-white" : "border-mist bg-white text-charcoal hover:border-navy/40",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <motion.ul layout className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((course) => {
            return (
              <motion.li
                key={course.slug}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col rounded-card border border-mist bg-white p-7 transition-shadow duration-500 hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-blue-tint text-navy">
                    <Icon name={course.icon} className="size-[1.35rem]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-cloud px-3 py-1 text-xs font-semibold text-slate ring-1 ring-mist">{course.category}</span>
                </div>
                <h3 className="mt-6 font-display text-xl leading-snug font-bold text-navy">{course.title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-slate">{course.summary}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-charcoal">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4 text-blue" aria-hidden="true" />
                    {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Signal className="size-4 text-blue" aria-hidden="true" />
                    {course.level}
                  </span>
                </div>
                <ul className="mt-5 flex-1 space-y-2 border-t border-mist pt-5">
                  {course.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-2.5 text-sm text-charcoal">
                      <Check className="mt-0.5 size-4 shrink-0 text-blue" strokeWidth={2.25} aria-hidden="true" />
                      {outcome}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => enquire(course.slug)}
                  className="group mt-6 inline-flex items-center gap-1.5 self-start font-display text-sm font-semibold text-blue hover:text-navy"
                >
                  Enquire about this course
                  <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      <div ref={formSection} id="enquire" className="mt-20 scroll-mt-28 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow">Enquire</p>
          <h2 className="mt-5 font-display text-h2 font-bold text-navy">Book a course or design a programme.</h2>
          <p className="mt-5 text-lead text-slate">
            Tell us what your team needs. We will reply within one working day with dates, an outline and a quote.
          </p>
        </div>
        <TrainingForm ref={formRef} />
      </div>
    </div>
  );
}
