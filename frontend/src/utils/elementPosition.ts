/** Elemento mínimo necesario para medir su posición sin depender de React. */
export type PositionMeasurableElement = Pick<
  HTMLElement,
  "style" | "getBoundingClientRect"
>;

/**
 * Mide la posición natural de un elemento aunque una clase CSS lo tenga fijo.
 * La posición inline original se restaura incluso si el navegador no puede medirlo.
 */
export const measureStaticDocumentTop = (
  element: PositionMeasurableElement,
  scrollY: number
): number => {
  const previousInlinePosition = element.style.position;
  element.style.position = "static";

  try {
    return element.getBoundingClientRect().top + scrollY;
  } finally {
    element.style.position = previousInlinePosition;
  }
};
