import { useEffect } from 'react';

import { STEP_SECTION_IDS } from '../data/NavBar.steps';
import { ConfiguratorStep } from '../state/ConfiguratorStep';

export function useScrollSpy(
  container: HTMLElement | null,
  onStepChange: (step: ConfiguratorStep) => void,
) {
  useEffect(() => {
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const step = (Object.entries(STEP_SECTION_IDS).find(
          ([_, id]) => id === visible.target.id,
        )?.[0] ?? null) as ConfiguratorStep | null;

        if (step) onStepChange(step);
      },
      {
        root: container,
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.01,
      },
    );

    Object.values(STEP_SECTION_IDS).forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [container, onStepChange]);
}
