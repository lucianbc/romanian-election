interface RandomTrendOptions {
  length?: number;
  startValue?: number;
  endValue?: number;
  seed?: number;
  randomnessFactor?: number;
}

function generateRandomTrendData({
  length = 200,
  startValue = 20,
  endValue = 60,
  seed = 12345,
  randomnessFactor = 15,
}: RandomTrendOptions = {}): number[] {
  // Simple seeded random function
  let nextSeed: number = seed;
  const seededRandom = (): number => {
    nextSeed = (nextSeed * 9301 + 49297) % 233280;
    return nextSeed / 233280;
  };

  const result: number[] = [];
  const range: number = endValue - startValue;

  // Generate values
  for (let i = 0; i < length; i++) {
    // Calculate base value on the linear trend
    const baseValue: number = startValue + (range * i) / (length - 1);

    // Add randomness - more intense in the middle, less at endpoints
    const positionFactor: number = 1 - Math.abs(i / (length - 1) - 0.5) * 2;
    const randomness: number =
      (seededRandom() - 0.5) * randomnessFactor * positionFactor;

    // Combine for final value
    result.push(Math.max(0, baseValue + randomness));
  }

  return result;
}

const TOTAL_VOTES = 9_000_000;
const DATA_POINTS = 200;
const START_VOTES = 1_500_000;

const votestamps = [...Array(DATA_POINTS).keys()]
  .map(
    (ix) => START_VOTES + ((ix + 1) * (TOTAL_VOTES - START_VOTES)) / DATA_POINTS
  )
  .slice(0, DATA_POINTS - 100);

const nicusorPercentages = generateRandomTrendData({
  length: DATA_POINTS,
  startValue: 20,
  endValue: 60,
}).slice(0, votestamps.length);

export const electionData = {
  totalVotes: TOTAL_VOTES,
  invalidVotes: 0,
  votesX: votestamps,
  candidates: [
    { votesY: nicusorPercentages, label: "nicusor", color: "#0000ff" },
    {
      votesY: nicusorPercentages.map((x) => 100 - x),
      label: "simion",
      color: "#ff00ff",
    },
  ],
};
