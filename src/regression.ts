import regression from "regression";

export interface Point {
  x: number;
  y: number;
}

export interface TrendLine {
  slope: number;
  intercept: number;
}

const regularizeX = (x: number) => x / 1_000_000;
const deregularizeX = (x: number) => x * 1_000_000;

export function calculateTrendLine(points: Point[]): TrendLine {
  type LinearPoints = Parameters<typeof regression.linear>[0];
  const pp: LinearPoints = points.map((p) => [regularizeX(p.x), p.y]);
  const regressionResult = regression.linear(pp);
  return {
    slope: regressionResult.equation[0],
    intercept: regressionResult.equation[1],
  };
}

export function calculateTrendPoint(trendLine: TrendLine, x: number): Point {
  return { x: x, y: regularizeX(x) * trendLine.slope + trendLine.intercept };
}

export function findIntersection(
  line1: TrendLine,
  line2: TrendLine
): Point | null {
  // Check if lines are parallel (same slope, no intersection)
  if (Math.abs(line1.slope - line2.slope) < Number.EPSILON) {
    // Check if they're the same line (same y-intercept too)
    if (Math.abs(line1.intercept - line2.intercept) < Number.EPSILON) {
      return null;
    }
    // Parallel lines with different y-intercepts never intersect
    return null;
  }

  // Calculate intersection point using the formula:
  // x = (b2 - b1) / (m1 - m2)
  // where m is slope and b is y-intercept
  const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);

  // Calculate y by substituting x back into either line equation
  // y = m1 * x + b1
  const y = line1.slope * x + line1.intercept;

  return { x: deregularizeX(x), y };
}
