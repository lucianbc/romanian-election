interface Point {
  x: number;
  y: number;
}

export interface TrendLine {
  slope: number;
  intercept: number;
}

export function calculateTrendLine(points: Point[]): TrendLine {
  // Need at least 2 points to define a line
  if (points.length < 2) {
    throw new Error("At least 2 points are required to calculate a trend line");
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  const n = points.length;

  // Calculate the sums needed for the linear regression formula
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  console.debug(`Sums are ${sumX}, ${sumY}, ${sumXX}, ${sumXY}`, points);

  // Calculate the slope (m) using the formula: m = (n*∑xy - ∑x*∑y) / (n*∑x² - (∑x)²)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Calculate the y-intercept (b) using the formula: b = (∑y - m*∑x) / n
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function calculateTrendPoint(trendLine: TrendLine, x: number): Point {
  console.debug("REGRESSION - trend line is", trendLine);
  return { x: x, y: x * trendLine.slope + trendLine.intercept };
}
