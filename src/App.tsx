import "./App.css";
import {
  VictoryAxis,
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
import { useEffect, useState } from "react";
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

const lastElem = (ns: any) => ns[ns.length - 1];

const ElectionChart = ({ data }: { data: ElectionChartData }) => {
  const xMax = data.totalVotes - data.invalidVotes;
  const trends: TrendLine[] = [];
  const intersections: Point[] = [];
  return (
    <div
      style={{
        width: "70%",
        position: "relative",
      }}
    >
      <h2 style={{ position: "absolute" }}>
        Counted: {lastElem(data.votesX)} Simion:{" "}
        {data.candidates[1].votesY[data.candidates[1].votesY.length - 1]} %
        Nicusor:
        {data.candidates[0].votesY[data.candidates[0].votesY.length - 1]}
      </h2>
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
        <VictoryAxis tickFormat={(x: any) => x / 1_000_000} />
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fontSize: 7, angle: -45 },
          }}
          fixLabelOverlap
        />
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

const AttendanceChart = ({
  points,
}: {
  points: { timestamp: string; presence: number }[];
}) => {
  // const lastTimestamp = new Date(points[points.length - 1].timestamp).getDate();
  return (
    <div
      style={{
        width: "70%",
      }}
    >
      <VictoryChart
        theme={VictoryTheme.clean}
        containerComponent={
          <VictoryZoomContainer
            allowZoom={false}
            allowPan={true}
            zoomDomain={
              {
                // x: [lastTimestamp - 10000, lastTimestamp],
              }
            }
          />
        }
      >
        <VictoryLine
          style={{ data: { strokeWidth: 1 } }}
          data={points.map((p, ix) => ({
            x: new Date(p.timestamp),
            y: p.presence,
          }))}
        />
        <VictoryAxis
          tickValues={points.map((x) => new Date(x.timestamp))}
          tickFormat={(x: any) =>
            Intl.DateTimeFormat(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            }).format(x)
          }
          fixLabelOverlap={true}
          // tickLabelComponent={
          //   <VictoryLabel
          //     angle={-45}
          //     dx={-25}
          //     dy={-5}
          //     renderInPortal
          //     style={{ fontSize: 8 }}
          //   />
          // }
          style={{
            tickLabels: { fontSize: 7, angle: -45 },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickValues={points.map((x) => x.presence)}
          style={{
            tickLabels: { fontSize: 7, angle: -45 },
          }}
          fixLabelOverlap
        />
      </VictoryChart>
    </div>
  );
};

const autoUpdate = (fn: () => void) => {
  fn();
  setTimeout(() => {
    fn();
  }, 3 * 60 * 1000);
};

function App() {
  const [data, setData] = useState<ElectionChartData | null>(null);
  const [attendance, setAttendance] = useState<object | null>(null);
  useEffect(() => {
    autoUpdate(() => {
      console.log(`Updating data at ${new Date()}`);
      fetch("/data.json")
        .then((response) => {
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
    });
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
