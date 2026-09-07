"use client";

import type { IntroSlide } from "./intro-content";

export type IntroProgressProps = {
  slides: readonly IntroSlide[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

/**
 * Direct slide navigation. Real buttons with real labels: the active step is carried by
 * `aria-current` and by width, never by colour alone (contract 05 §7).
 */
export function IntroProgress({ slides, currentIndex, onSelect }: IntroProgressProps) {
  return (
    <div aria-label="Intro slides" className="flex items-center gap-2" role="group">
      {slides.map((slide, index) => {
        const isCurrent = index === currentIndex;
        return (
          <button
            key={slide.id}
            type="button"
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`Slide ${index + 1} of ${slides.length}: ${slide.heading}`}
            onClick={() => onSelect(index)}
            className={`h-2 rounded-pill transition ${
              isCurrent
                ? "w-6 bg-[var(--color-accent)]"
                : "w-2 bg-[var(--color-border-elevated)] hover:bg-[var(--color-fg-quiet)]"
            }`}
          />
        );
      })}
    </div>
  );
}
