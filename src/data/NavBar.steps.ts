import { ConfiguratorStep } from '../state/ConfiguratorStep';

export const NAV_STEPS = [
  { label: 'Base', step: ConfiguratorStep.Base },
  { label: 'Base Colour', step: ConfiguratorStep.BaseColour },
  { label: 'Top Colour', step: ConfiguratorStep.TopColour },
  { label: 'Top Shape', step: ConfiguratorStep.TopShape },
  { label: 'Dimension', step: ConfiguratorStep.Dimension },
  { label: 'Chair', step: ConfiguratorStep.Chair },
  { label: 'Summary', step: ConfiguratorStep.Summary },
];

export const STEP_SECTION_IDS: Record<ConfiguratorStep, string> = {
  [ConfiguratorStep.Base]: 'section-base',
  [ConfiguratorStep.BaseColour]: 'section-base-colour',
  [ConfiguratorStep.TopColour]: 'section-top-colour',
  [ConfiguratorStep.TopShape]: 'section-top-shape',
  [ConfiguratorStep.Dimension]: 'section-dimension',
  [ConfiguratorStep.Chair]: 'section-chair',
  [ConfiguratorStep.Summary]: 'section-summary',
};
