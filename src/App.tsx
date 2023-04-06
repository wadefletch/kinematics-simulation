import { useEffect, useRef, useState } from "react";
import Input from "./components/Input";
import Card from "./components/Card";

type Radians = number;

type Arm = {
  length: number;
  angle: Radians;
};

type Point = {
  x: number;
  y: number;
};

type Position = {
  arm1Angle: Radians;
  arm2Angle: Radians;
};

function App() {
  // ================================ CONSTANTS ================================
  const canvas = { width: 600, height: 300 };
  // ===========================================================================

  // ============================== MANAGED STATE ==============================
  const svgRef = useRef<SVGSVGElement>(null);
  const [origin, setOrigin] = useState({
    x: canvas.width * 0.1,
    y: canvas.height * 0.35,
  });
  const [arm1, setArm1] = useState<Arm>({ length: 225, angle: 0.5 });
  const [arm2, setArm2] = useState<Arm>({ length: 200, angle: 5 });
  const [target, setTarget] = useState<Point>({ x: 450, y: 50 });
  // ===========================================================================

  // ================================= HELPERS =================================
  const f = (n: number) => n.toFixed(0);
  const x = (n: number) => Math.round(n);
  const y = (n: number) => Math.round(canvas.height - n); // invert y-axis
  // ===========================================================================

  // =========================== FORWARD KINEMATICS ============================
  const arm1End: Point = {
    x: origin.x + Math.cos(arm1.angle) * arm1.length,
    y: origin.y + Math.sin(arm1.angle) * arm1.length,
  };
  const arm2End: Point = {
    x: arm1End.x + Math.cos(arm1.angle + arm2.angle) * arm2.length,
    y: arm1End.y + Math.sin(arm1.angle + arm2.angle) * arm2.length,
  };
  // ===========================================================================

  // =========================== INVERSE KINEMATICS ============================
  const distance = (p: Point) => Math.sqrt(p.x * p.x + p.y * p.y);

  const lawOfCosines = (a: number, b: number, c: number): Radians =>
    Math.acos((a * a + b * b - c * c) / (2 * a * b));

  const anglesForTarget = (p: Point): Position => {
    const dist = distance(p);

    // Arm 1
    const insideArm1Angle: Radians = lawOfCosines(
      dist,
      arm1.length,
      arm2.length
    );
    const outsideArm1Angle: Radians = Math.atan2(p.y, p.x);
    const arm1Angle = outsideArm1Angle + insideArm1Angle;

    // Arm 2
    const insideArm2Angle: Radians = lawOfCosines(
      arm1.length,
      arm2.length,
      dist
    );
    const outsideArm2Angle: Radians = Math.PI + insideArm2Angle;
    const arm2Angle = outsideArm2Angle;

    return { arm1Angle, arm2Angle };
  };

  useEffect(() => {
    const { arm1Angle, arm2Angle } = anglesForTarget({
      x: target.x - origin.x,
      y: target.y - origin.y,
    });
    setArm1({ ...arm1, angle: arm1Angle });
    setArm2({ ...arm2, angle: arm2Angle });
  }, [target]);

  const handleTargetMove = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    let point = svg.createSVGPoint();

    if (e.type === "touchmove") {
      const touchE = e as React.TouchEvent<SVGSVGElement>;
      point.x = touchE.touches[0].clientX;
      point.y = touchE.touches[0].clientY;
    } else {
      const mouseE = e as React.MouseEvent<SVGSVGElement>;
      point.x = mouseE.clientX;
      point.y = mouseE.clientY;
    }

    point = point.matrixTransform(svg.getScreenCTM()!.inverse());
    setTarget({ x: x(point.x), y: y(point.y) });
  };
  // ===========================================================================

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 p-5 lg:flex-row">
      <div id="left-top-column" className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-bold uppercase text-gray-800">Group 5</p>
          <h1 className="mb-4 text-3xl font-bold text-green-700">
            Kinematics Simulation
          </h1>
          <p className="mb-4 text-gray-700">
            This is a simulation of a two-joint robotic arm. The first joint is
            fixed at the origin, and the second joint is fixed to the end of the
            first arm. The length of each arm and angle of each joint can be
            changed using the controls below. The target can be moved by mousing
            over the simulation.
          </p>
          <p className="mb-4 text-gray-700">
            This implementation uses the geometric approach to inverse
            kinematics, which relies on the{" "}
            <a
              href="https://en.wikipedia.org/wiki/Law_of_cosines"
              className="underline"
            >
              law of cosines
            </a>{" "}
            and some other basic trig.
          </p>
        </div>
        <div id="simulation" className="relative rounded-md border">
          <p className="absolute bottom-2 left-2 text-xs text-gray-500">
            (0, 0)
          </p>
          <p className="absolute right-2 top-2 text-xs text-gray-500">
            ({canvas.width}, {canvas.height})
          </p>
          <svg
            viewBox={`0 0 ${canvas.width} ${canvas.height}`}
            ref={svgRef}
            onMouseMove={handleTargetMove}
            onTouchMove={handleTargetMove}
            style={{ touchAction: "none" }}
          >
            {/* ========================== RANGE ========================== */}
            <circle
              id="range-outer"
              cx={x(origin.x)}
              cy={y(origin.y)}
              r={arm2.length + arm1.length}
              className="fill-current text-gray-100"
            />

            <circle
              id="range-inner"
              cx={x(origin.x)}
              cy={y(origin.y)}
              r={Math.abs(arm2.length - arm1.length)}
              className="fill-current text-white"
            />
            {/* ============================================================ */}

            {/* ========================== ARM 1 =========================== */}
            {arm1.angle && (
              <>
                <line
                  id="arm1"
                  x1={x(origin.x)}
                  y1={y(origin.y)}
                  x2={x(arm1End.x)}
                  y2={y(arm1End.y)}
                  className="stroke-current stroke-2 text-blue-500"
                />

                <circle
                  id="arm1start"
                  cx={x(origin.x)}
                  cy={y(origin.y)}
                  r="2"
                  className="fill-current text-blue-500"
                />
              </>
            )}
            {/* ============================================================ */}

            {/* ========================== ARM 2 =========================== */}
            {arm2.angle && (
              <>
                <line
                  id="arm2"
                  x1={x(arm1End.x)}
                  y1={y(arm1End.y)}
                  x2={x(arm2End.x)}
                  y2={y(arm2End.y)}
                  className="stroke-current stroke-2 text-green-500"
                />

                <circle
                  id="arm2start"
                  cx={x(arm1End.x)}
                  cy={y(arm1End.y)}
                  r="2"
                  className="fill-current text-green-500"
                />
              </>
            )}
            {/* ============================================================ */}

            {/* ========================== TARGET ========================== */}
            <circle
              id="target"
              cx={x(target.x)}
              cy={y(target.y)}
              r="2"
              className="fill-current text-gray-500 opacity-50"
            />

            <line
              id="target-x"
              x1={x(target.x)}
              y1={y(0)}
              x2={x(target.x)}
              y2={y(canvas.height)}
              className="stroke-current text-gray-500 opacity-50"
            />

            <text
              x={x(target.x + 5)}
              y={y(5)}
              className="fill-current text-xs text-gray-500"
            >
              {f(target.x)}
            </text>

            <line
              id="target-y"
              x1={x(0)}
              y1={y(target.y)}
              x2={x(canvas.width)}
              y2={y(target.y)}
              className="stroke-current text-gray-500 opacity-50"
            />

            <text
              x={x(canvas.width - 5)}
              y={y(target.y - 15)}
              textAnchor="end"
              className="fill-current text-xs text-gray-500"
            >
              {f(target.y)}
            </text>
            {/* ============================================================ */}

            {/* =========================== CLAW =========================== */}
            {arm1.angle && arm2.angle && (
              <circle
                id="arm2end"
                cx={x(arm2End.x)}
                cy={y(arm2End.y)}
                r="2"
                className="fill-current text-red-500"
              />
            )}
            {/* ============================================================ */}
          </svg>
        </div>

        <Card
          title="Controls"
          description="Use these fields to change the length and angle of each arm. The origin is disabled, as it is set based on the dimensions of the canvas."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              type="number"
              label="Origin X"
              value={origin.x}
              onChange={(x) => setOrigin({ ...origin, x })}
            />
            <Input
              type="number"
              label="Origin Y"
              value={origin.y}
              onChange={(y) => setOrigin({ ...origin, y })}
            />
            <Input
              type="number"
              label="Arm 1 Length"
              value={arm1.length}
              onChange={(length) => setArm1({ ...arm1, length })}
            />
            <Input
              type="number"
              label="Arm 1 Angle (Radians)"
              value={arm1.angle}
              onChange={(angle) => setArm1({ ...arm1, angle })}
            />
            <Input
              type="number"
              label="Arm 2 Length"
              value={arm2.length}
              onChange={(length) => setArm2({ ...arm2, length })}
            />
            <Input
              type="number"
              label="Arm 2 Angle (Radians)"
              value={arm2.angle}
              onChange={(angle) => setArm2({ ...arm2, angle })}
            />
          </div>
        </Card>
      </div>

      <div id="right-bottom-column" className="flex flex-col gap-5">
        <Card
          title="Data"
          description="This is the data that is being used to calculate the position of each component of the arm. It is updated in real time as you change the values in the controls."
        >
          <pre className="overflow-y-auto rounded-md border border-gray-100 bg-gray-50 p-3">
            {JSON.stringify(
              {
                origin,
                arm1,
                arm2,
                arm1End,
                arm2End,
              },
              (key, val) => (val.toFixed ? Number(val.toFixed(5)) : val),
              2
            )}
          </pre>
        </Card>

        <Card
          title="Inverse Kinematics"
          description="Use these fields to manually set a target point. You can also mouse over the simulation to set a target."
        >
          <div className="grid grid-cols-1 gap-5">
            <Input
              label="Target X"
              type="number"
              value={target.x}
              onChange={(x) => setTarget({ ...target, x })}
            />
            <Input
              label="Target Y"
              type="number"
              value={target.y}
              onChange={(y) => setTarget({ ...target, y })}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
