export function scrollToSection(sectionId: string) {
  const container = document.getElementById('configurator-scroll-container');
  const target = document.getElementById(sectionId);

  if (!container || !target) return;

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  container.scrollTo({
    behavior: 'smooth',
    top: targetRect.top - containerRect.top + container.scrollTop - 16,
  });
}
