/** Format a number as Argentine pesos, e.g. 13900 -> "$ 13.900". */
export function formatARS(n: number): string {
  return "$ " + new Intl.NumberFormat("es-AR").format(n);
}
