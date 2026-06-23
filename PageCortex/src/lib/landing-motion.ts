/** SSR-safe motion defaults — content is visible before hydration (no opacity: 0 flash). */
export const inViewOnce = {
  initial: false as const,
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
};
