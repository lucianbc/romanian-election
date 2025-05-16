import "./App.css";
import {
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
  VictoryZoomContainer,
} from "victory";
import { electionData } from "./data";
import { calculateTrendLine, calculateTrendPoint } from "./regression";
type ElectionChartData = typeof electionData;

// type ElectionChartData = {
//   votesX: number[];
//   candidates: CandidateChartData[];
// };

// type CandidateChartData = {
//   votesY: number[];
//   label: string;
// };

const MaybeTrendPrediction = ({
  points,
  lastX,
}: {
  points: { x: number; y: number }[];
  lastX: number;
}) => {
  return (
    <VictoryLine
      data={[
        { x: 0, y: 80 },
        { x: lastX, y: 90 },
      ]}
    />
  );
  // if (points.length < 2) {
  //   return <></>;
  // }
  // const trendLine = calculateTrendLine(points);
  // const lastPoint = points[points.length - 1];
  // const predictedPoint = calculateTrendPoint(trendLine, lastX);
  // return <VictoryLine data={[lastPoint, predictedPoint]} />;
};

const ElectionChart = ({ data }: { data: ElectionChartData }) => {
  const xMax = data.totalVotes - data.invalidVotes;
  return (
    <div
      style={{
        width: "70%",
      }}
    >
      <VictoryChart
        theme={VictoryTheme.clean}
        domain={{
          y: [0, 80],
          x: [Math.min(...data.votesX), xMax],
        }}
        containerComponent={
          <VictoryZoomContainer allowZoom={true} allowPan={true} />
        }
      >
        {data.candidates.flatMap((candidate) => {
          const points = candidate.votesY.map((y, ix) => ({
            x: data.votesX[ix],
            y,
          }));
          const lines = [
            <VictoryLine
              style={{ data: { stroke: candidate.color } }}
              data={points}
            />,
          ];
          if (points.length >= 2) {
            const trendLine = calculateTrendLine(points);
            const lastPoint = points[points.length - 1];
            const predictedPoint = calculateTrendPoint(trendLine, xMax);
            console.debug(
              `Predicted for ${candidate.label} point ${predictedPoint}`,
              predictedPoint
            );
            // lines.push(<VictoryLine data={[lastPoint, predictedPoint]} />);
          }
          console.debug("returning lines " + lines);
          return lines;
          // return [
          //   <VictoryLine
          //     style={{ data: { stroke: candidate.color } }}
          //     data={points}
          //   />,
          //   <VictoryLine
          //     style={{ data: { stroke: candidate.color } }}
          //     data={points.map((p) => ({ x: xMax - p.x, y: p.y }))}
          //   />,
          //   // <MaybeTrendPrediction lastX={xMax} points={points} />,
          // ];
          // return (
          //   <>
          //     <VictoryLine
          //       style={{ data: { stroke: candidate.color } }}
          //       data={points}
          //     />
          //     <MaybeTrendPrediction lastX={xMax} points={points} />
          //   </>
          // );
        })}
      </VictoryChart>
      <VictoryLegend
        x={125}
        y={10}
        orientation="horizontal"
        gutter={20}
        style={{
          border: { stroke: "black" },
        }}
        data={data.candidates.map((c) => ({
          name: c.label,
          symbol: { fill: c.color },
        }))}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <h1>Romanian Second Round of Elections Results</h1>
      <ElectionChart data={electionData} />
    </div>
  );
}

export default App;
