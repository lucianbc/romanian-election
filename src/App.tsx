import "./App.css";
import {
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryZoomContainer,
} from "victory";
import {
  calculateTrendLine,
  calculateTrendPoint,
  findIntersection,
  TrendLine,
  Point,
} from "./regression";
import { useEffect, useRef, useState } from "react";
type ElectionChartData = {
  totalVotes: number;
  invalidVotes: number;
  votesX: number[];
  candidates: {
    label: string;
    votesY: number[];
    color: string;
  }[];
};

const ElectionChart = ({ data }: { data: ElectionChartData }) => {
  const xMax = data.totalVotes - data.invalidVotes;
  const trends: TrendLine[] = [];
  const intersections: Point[] = [];
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
              style={{ data: { stroke: candidate.color, strokeWidth: 1 } }}
              data={points}
            />,
          ];
          if (points.length >= 2) {
            const trendLine = calculateTrendLine(points);
            trends.push(trendLine);
            const trendStartPoint = points[0];
            const predictedPoint = calculateTrendPoint(trendLine, xMax);
            lines.push(
              <VictoryLine
                style={{
                  data: {
                    stroke: candidate.color,
                    strokeWidth: 1,
                    strokeDasharray: 4,
                  },
                }}
                data={[trendStartPoint, predictedPoint]}
              />
            );
          }
          return lines;
        })}
        {(() => {
          for (let i = 0; i < trends.length; i++) {
            for (let j = i + 1; j < trends.length; j++) {
              const intersection = findIntersection(trends[i], trends[j]);
              if (intersection != null) {
                intersections.push(intersection);
              }
            }
          }
          return (
            <VictoryScatter data={intersections} theme={VictoryTheme.clean} />
          );
        })()}
      </VictoryChart>
      <VictoryLegend
        x={125}
        y={10}
        orientation="horizontal"
        gutter={20}
        style={{
          border: { stroke: "black" },
        }}
        data={[
          ...data.candidates.map((c) => ({
            name: c.label,
            symbol: { fill: c.color },
          })),
          {
            name: `X at ${
              intersections.length > 0
                ? Intl.NumberFormat("en-UK", {
                    maximumFractionDigits: 0,
                  }).format(intersections[0].x)
                : -1
            }`,
            symbol: { fill: "#fff" },
          },
        ]}
      />
    </div>
  );
};

const AttendanceChart = ({ points }: { points: [number] }) => {
  console.debug("Got here", points);
  return (
    <div
      style={{
        width: "70%",
      }}
    >
      <VictoryChart
        theme={VictoryTheme.clean}
        domain={{
          x: [0, 70],
        }}
        containerComponent={
          <VictoryZoomContainer allowZoom={true} allowPan={true} />
        }
      >
        <VictoryLine
          style={{ data: { strokeWidth: 1 } }}
          data={points.map((p, ix) => ({ x: ix, y: p }))}
        />
      </VictoryChart>
    </div>
  );
};

function App() {
  const initialized = useRef(false);
  const [data, setData] = useState<ElectionChartData | null>(null);
  const [attendance, setAttendance] = useState<object | null>(null);
  useEffect(() => {
    if (!initialized.current) {
      fetch("/data.json")
        .then((response) => {
          initialized.current = true;
          return response.json();
        })
        .then((x) => {
          setData(x);
        });
      fetch("/presence.json")
        .then((response) => {
          return response.json();
        })
        .then((x) => {
          setAttendance(x.presence);
        });
    }
  }, []);
  return (
    <div className="App">
      <h1>Romanian Presidential Election Result</h1>
      {data != null && <ElectionChart data={data} />}
      {attendance != null && <AttendanceChart points={attendance as any} />}
    </div>
  );
}

export default App;
