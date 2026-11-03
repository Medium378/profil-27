import type { ReactNode } from "react";

function Grid({
  x0,
  y0,
  x1,
  y1,
  step,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  step: number;
}) {
  const lines: ReactNode[] = [];
  for (let x = x0; x <= x1 + 0.1; x += step) {
    lines.push(<line key={`v${x}`} x1={x} y1={y0} x2={x} y2={y1} />);
  }
  for (let y = y0; y <= y1 + 0.1; y += step) {
    lines.push(<line key={`h${y}`} x1={x0} y1={y} x2={x1} y2={y} />);
  }
  return (
    <g stroke="currentColor" strokeWidth={1} opacity={0.18}>
      {lines}
    </g>
  );
}

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure className="my-4 overflow-x-auto rounded-lg border border-line bg-surface px-3 py-3">
      <svg viewBox="0 0 520 340" className="mx-auto h-auto w-full max-w-xl text-ink" role="img">
        <title>{label}</title>
        {children}
      </svg>
    </figure>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 9;
  const ax = x2 - size * Math.cos(angle - 0.4);
  const ay = y2 - size * Math.sin(angle - 0.4);
  const bx = x2 - size * Math.cos(angle + 0.4);
  const by = y2 - size * Math.sin(angle + 0.4);
  return (
    <g stroke="currentColor" fill="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} />
    </g>
  );
}

export function FigureView({ id }: { id: string }) {
  if (id === "vectors") return <Vectors />;
  if (id === "deriv") return <Derivative />;
  if (id === "slopes") return <Slopes />;
  if (id === "tangent") return <Tangent />;
  if (id === "hyperbola") return <Hyperbola />;
  if (id === "parabola") return <Parabola />;
  if (id === "exp") return <Exponential />;
  if (id === "quad") return <Quad />;
  if (id === "midline") return <Midline />;
  if (id === "bisector") return <Bisector />;
  if (id === "prism") return <Prism />;
  if (id === "box") return <Box />;
  if (id === "sphere") return <Sphere />;
  return null;
}

function Vectors() {
  const ox = 48;
  const oy = 300;
  const u = 22;
  const X = (x: number) => ox + x * u;
  const Y = (y: number) => oy - y * u;
  return (
    <Frame label="Векторы a и b">
      <Grid x0={ox} y0={36} x1={X(12)} y1={oy} step={u} />
      <Arrow x1={ox} y1={oy} x2={X(12.4)} y2={oy} />
      <Arrow x1={ox} y1={oy} x2={ox} y2={28} />
      <text x={X(12.2)} y={oy + 18} fontSize={14}>
        x
      </text>
      <text x={ox - 16} y={24} fontSize={14}>
        y
      </text>
      {[0, 1, 5, 11].map((n) => (
        <text key={n} x={X(n) - 4} y={oy + 16} fontSize={12}>
          {n}
        </text>
      ))}
      {[2, 5, 8].map((n) => (
        <text key={n} x={ox - 18} y={Y(n) + 4} fontSize={12}>
          {n}
        </text>
      ))}
      <Arrow x1={X(1)} y1={Y(2)} x2={X(5)} y2={Y(8)} />
      <Arrow x1={X(5)} y1={Y(5)} x2={X(11)} y2={Y(3)} />
      <text x={X(2.2)} y={Y(4.2)} fontSize={16} fontStyle="italic">
        a
      </text>
      <text x={X(7.2)} y={Y(4.6)} fontSize={16} fontStyle="italic">
        b
      </text>
    </Frame>
  );
}

function Derivative() {
  const pts: [number, number][] = [
    [-10, -1.35],
    [-8.6, -2.2],
    [-8, -2.95],
    [-7.2, -1.5],
    [-6.7, 0],
    [-6, 2.05],
    [-5.2, 1.2],
    [-4.85, 0],
    [-4.2, -2.1],
    [-4, -2.55],
    [-3.3, -1.2],
    [-2.75, 0],
    [-2, 1.55],
    [-1.2, 0.7],
    [-0.85, 0],
    [0, -2.5],
    [1, -1.4],
    [1.7, -2.2],
    [2, -2.55],
    [2.7, -0.9],
    [3, 0],
    [4, 1.55],
    [4.7, 0.5],
    [5, 0],
    [5.5, -0.98],
    [6, -0.7],
    [6.4, 0],
    [7, 1.85],
  ];
  const X = (x: number) => 46 + ((x + 10) / 17) * 440;
  const Y = (y: number) => 168 - y * 32;
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(" ");
  return (
    <Frame label="График производной">
      <Grid x0={46} y0={40} x1={486} y1={300} step={440 / 17} />
      <line x1={40} y1={Y(0)} x2={500} y2={Y(0)} stroke="currentColor" strokeWidth={1.6} />
      <line x1={X(0)} y1={36} x2={X(0)} y2={308} stroke="currentColor" strokeWidth={1.6} />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2.2} />
      <circle cx={X(-10)} cy={Y(-1.35)} r={4} fill="var(--color-surface)" stroke="currentColor" strokeWidth={1.6} />
      <circle cx={X(7)} cy={Y(1.85)} r={4} fill="var(--color-surface)" stroke="currentColor" strokeWidth={1.6} />
      <text x={X(-10) - 8} y={Y(0) + 18} fontSize={12}>
        −10
      </text>
      <text x={X(0) + 6} y={Y(0) + 16} fontSize={12}>
        0
      </text>
      <text x={X(7) - 4} y={Y(0) + 18} fontSize={12}>
        7
      </text>
      <text x={X(0) + 8} y={Y(3) + 4} fontSize={12}>
        3
      </text>
      <text x={X(0) + 8} y={Y(-3)} fontSize={12}>
        −3
      </text>
      <text x={360} y={58} fontSize={13}>
        y = f′(x)
      </text>
    </Frame>
  );
}

function Slopes() {
  const d = [
    "M 18 188",
    "C 40 210, 58 176, 78 150",
    "C 96 128, 112 118, 132 112",
    "C 150 104, 162 70, 188 42",
    "C 206 28, 228 34, 250 58",
    "C 278 90, 300 112, 328 150",
    "C 344 176, 358 196, 378 176",
    "C 396 140, 408 78, 430 58",
    "C 444 48, 454 62, 470 40",
    "C 488 16, 506 22, 522 70",
    "C 534 112, 544 168, 562 150",
    "C 578 118, 592 86, 608 96",
    "C 624 112, 632 150, 648 132",
    "C 662 112, 674 96, 688 108",
    "C 704 128, 716 190, 724 210",
  ].join(" ");
  const marks = [70, 158, 248, 332, 412, 468, 528, 656];
  const names = ["x₁", "x₂", "x₃", "x₄", "x₅", "x₆", "x₇", "x₈"];
  return (
    <Frame label="График функции и отмеченные точки">
      <line x1={16} y1={150} x2={500} y2={150} stroke="currentColor" strokeWidth={1.5} />
      <line x1={132} y1={24} x2={132} y2={230} stroke="currentColor" strokeWidth={1.5} />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2.3} />
      {marks.map((x, i) => (
        <g key={names[i]}>
          <line x1={x} y1={118} x2={x} y2={168} stroke="currentColor" strokeDasharray="3 4" strokeWidth={1.3} />
          <text x={x - 8} y={192} fontSize={13}>
            {names[i]}
          </text>
        </g>
      ))}
      <text x={118} y={168} fontSize={13}>
        0
      </text>
      <text x={430} y={48} fontSize={13}>
        y = f(x)
      </text>
    </Frame>
  );
}

function Tangent() {
  const X = (x: number) => 250 + x * 36;
  const Y = (y: number) => 250 - y * 36;
  const curve = Array.from({ length: 49 }, (_, i) => {
    const x = -2.2 + i * 0.16;
    const y = 1.15 + 1.35 * Math.exp(-((x - 1.35) ** 2) / 1.7) - 0.08 * (x - 1.35);
    return `${i === 0 ? "M" : "L"} ${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;
  }).join(" ");
  return (
    <Frame label="График и касательная">
      <Grid x0={70} y0={40} x1={470} y1={280} step={36} />
      <line x1={60} y1={Y(0)} x2={490} y2={Y(0)} stroke="currentColor" strokeWidth={1.5} />
      <line x1={X(0)} y1={30} x2={X(0)} y2={300} stroke="currentColor" strokeWidth={1.5} />
      <line x1={X(-2.4)} y1={Y(3.28)} x2={X(5.2)} y2={Y(1.76)} stroke="currentColor" strokeWidth={1.7} />
      <path d={curve} fill="none" stroke="currentColor" strokeWidth={2.2} />
      <circle cx={X(-1)} cy={Y(3)} r={4} fill="currentColor" />
      <circle cx={X(4)} cy={Y(2)} r={4} fill="currentColor" />
      <line x1={X(2)} y1={Y(2.4)} x2={X(2)} y2={Y(0)} stroke="currentColor" strokeDasharray="3 3" />
      <text x={X(-1) - 8} y={Y(3) - 8} fontSize={13}>
        3
      </text>
      <text x={X(4) + 8} y={Y(2) + 4} fontSize={13}>
        2
      </text>
      <text x={X(-1) - 6} y={Y(0) + 16} fontSize={12}>
        −1
      </text>
      <text x={X(1) - 4} y={Y(0) + 16} fontSize={12}>
        1
      </text>
      <text x={X(2) - 8} y={Y(0) + 28} fontSize={13}>
        x₀
      </text>
      <text x={X(4) - 4} y={Y(0) + 16} fontSize={12}>
        4
      </text>
      <text x={70} y={150} fontSize={13}>
        y = f(x)
      </text>
    </Frame>
  );
}

function Hyperbola() {
  const ox = 230;
  const oy = 180;
  const u = 28;
  const X = (x: number) => ox + x * u;
  const Y = (y: number) => oy - y * u;
  const branch = (sign: number) => {
    const pts: string[] = [];
    for (let x = 0.55; x <= 6.2; x += 0.15) {
      const y = sign * (5 / x);
      pts.push(`${pts.length === 0 ? "M" : "L"} ${X(sign * x).toFixed(1)} ${Y(y).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  return (
    <Frame label="График k/x">
      <Grid x0={40} y0={30} x1={480} y1={310} step={u} />
      <Arrow x1={40} y1={oy} x2={492} y2={oy} />
      <Arrow x1={ox} y1={312} x2={ox} y2={22} />
      <path d={branch(1)} fill="none" stroke="currentColor" strokeWidth={2.2} />
      <path d={branch(-1)} fill="none" stroke="currentColor" strokeWidth={2.2} />
      <circle cx={X(5)} cy={Y(1)} r={4.5} fill="currentColor" />
      <text x={X(5) - 4} y={oy + 16} fontSize={13}>
        5
      </text>
      <text x={X(1) - 4} y={oy + 16} fontSize={13}>
        1
      </text>
      <text x={ox + 6} y={Y(1) + 4} fontSize={13}>
        1
      </text>
      <text x={X(3)} y={Y(2.2)} fontSize={13}>
        y = f(x)
      </text>
    </Frame>
  );
}

function Parabola() {
  const ox = 210;
  const oy = 168;
  const u = 26;
  const X = (x: number) => ox + x * u;
  const Y = (y: number) => oy - y * u;
  let d = "";
  for (let x = -1.3; x <= 3.3; x += 0.08) {
    const y = x * x - x;
    d += `${d ? "L" : "M"} ${X(x).toFixed(1)} ${Y(y).toFixed(1)} `;
  }
  return (
    <Frame label="Парабола и прямая">
      <Grid x0={50} y0={24} x1={470} y1={310} step={u} />
      <Arrow x1={48} y1={oy} x2={488} y2={oy} />
      <Arrow x1={ox} y1={316} x2={ox} y2={16} />
      <line x1={X(-1.15)} y1={Y(-5.75)} x2={X(1.35)} y2={Y(6.75)} stroke="currentColor" strokeWidth={2} />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2.2} />
      <circle cx={X(0)} cy={Y(0)} r={4.5} fill="currentColor" />
      <circle cx={X(1)} cy={Y(5)} r={4.5} fill="currentColor" />
      <circle cx={X(2)} cy={Y(2)} r={4.5} fill="currentColor" />
      <text x={X(0) + 8} y={oy + 16} fontSize={13}>
        A
      </text>
      <text x={X(1) + 8} y={Y(5) - 6} fontSize={13}>
        5
      </text>
      <text x={X(2) + 8} y={Y(2)} fontSize={13}>
        2
      </text>
      <text x={X(1) - 3} y={oy + 16} fontSize={12}>
        1
      </text>
      <text x={X(2) - 3} y={oy + 16} fontSize={12}>
        2
      </text>
      <text x={X(2.3)} y={Y(3.4)} fontSize={13}>
        y = f(x)
      </text>
      <text x={X(-1.6)} y={Y(-3)} fontSize={13}>
        y = g(x)
      </text>
    </Frame>
  );
}

function Exponential() {
  const ox = 230;
  const oy = 250;
  const u = 28;
  const X = (x: number) => ox + x * u;
  const Y = (y: number) => oy - y * u;
  let d = "";
  for (let x = -2.15; x <= 4.2; x += 0.08) {
    const y = 0.25 ** x;
    if (y > 8.2) continue;
    d += `${d ? "L" : "M"} ${X(x).toFixed(1)} ${Y(y).toFixed(1)} `;
  }
  return (
    <Frame label="Показательная функция">
      <Grid x0={40} y0={20} x1={480} y1={300} step={u} />
      <Arrow x1={36} y1={oy} x2={492} y2={oy} />
      <Arrow x1={ox} y1={308} x2={ox} y2={12} />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2.3} />
      <circle cx={X(-1)} cy={Y(4)} r={4.5} fill="currentColor" />
      <circle cx={X(0)} cy={Y(1)} r={4.5} fill="currentColor" />
      <text x={X(-1) - 28} y={Y(4) + 4} fontSize={13}>
        4
      </text>
      <text x={ox + 8} y={Y(1) + 14} fontSize={13}>
        1
      </text>
      <text x={X(-1) - 6} y={oy + 16} fontSize={12}>
        −1
      </text>
      <text x={X(1) - 3} y={oy + 16} fontSize={12}>
        1
      </text>
      <text x={40} y={80} fontSize={13}>
        y = f(x)
      </text>
    </Frame>
  );
}

function Quad() {
  return (
    <Frame label="Четырёхугольник с вписанной окружностью">
      <polygon points="150,70 360,90 330,250 120,220" fill="none" stroke="currentColor" strokeWidth={2} />
      <circle cx={240} cy={158} r={52} fill="none" stroke="currentColor" strokeWidth={1.7} />
      <text x={230} y={58} fontSize={16}>
        B
      </text>
      <text x={368} y={92} fontSize={16}>
        C
      </text>
      <text x={336} y={272} fontSize={16}>
        D
      </text>
      <text x={98} y={230} fontSize={16}>
        A
      </text>
      <text x={150} y={150} fontSize={14}>
        8
      </text>
    </Frame>
  );
}

function Midline() {
  return (
    <Frame label="Треугольник и средняя линия">
      <polygon points="90,260 420,260 250,50" fill="none" stroke="currentColor" strokeWidth={2} />
      <line x1={170} y1={155} x2={335} y2={155} stroke="currentColor" strokeWidth={2} />
      <text x={70} y={278} fontSize={16}>
        A
      </text>
      <text x={424} y={278} fontSize={16}>
        B
      </text>
      <text x={244} y={42} fontSize={16}>
        C
      </text>
      <text x={148} y={148} fontSize={16}>
        D
      </text>
      <text x={340} y={148} fontSize={16}>
        E
      </text>
    </Frame>
  );
}

function Bisector() {
  return (
    <Frame label="Биссектриса">
      <polygon points="80,260 430,260 300,70" fill="none" stroke="currentColor" strokeWidth={2} />
      <line x1={80} y1={260} x2={340} y2={168} stroke="currentColor" strokeWidth={2} />
      <text x={60} y={278} fontSize={16}>
        A
      </text>
      <text x={436} y={278} fontSize={16}>
        B
      </text>
      <text x={292} y={60} fontSize={16}>
        C
      </text>
      <text x={348} y={164} fontSize={16}>
        D
      </text>
      <text x={150} y={230} fontSize={13}>
        23°
      </text>
      <text x={300} y={120} fontSize={13}>
        54°
      </text>
    </Frame>
  );
}

function Prism() {
  return (
    <Frame label="Треугольная призма">
      <polygon points="150,210 250,250 210,120" fill="none" stroke="currentColor" strokeWidth={2} />
      <polygon points="250,90 350,130 310,40" fill="none" stroke="currentColor" strokeWidth={2} />
      <line x1={150} y1={210} x2={250} y2={90} stroke="currentColor" strokeWidth={2} />
      <line x1={250} y1={250} x2={350} y2={130} stroke="currentColor" strokeWidth={2} />
      <line x1={210} y1={120} x2={310} y2={40} stroke="currentColor" strokeWidth={2} />
      <line x1={180} y1={230} x2={280} y2={110} stroke="currentColor" strokeDasharray="5 4" strokeWidth={1.6} />
      <line x1={230} y1={185} x2={330} y2={85} stroke="currentColor" strokeDasharray="5 4" strokeWidth={1.6} />
    </Frame>
  );
}

function Box() {
  return (
    <Frame label="Прямоугольный параллелепипед">
      <polygon points="120,210 280,210 340,160 180,160" fill="none" stroke="currentColor" strokeWidth={2} />
      <polygon points="120,90 280,90 340,40 180,40" fill="none" stroke="currentColor" strokeWidth={2} />
      <line x1={120} y1={210} x2={120} y2={90} stroke="currentColor" strokeWidth={2} />
      <line x1={280} y1={210} x2={280} y2={90} stroke="currentColor" strokeWidth={2} />
      <line x1={340} y1={160} x2={340} y2={40} stroke="currentColor" strokeWidth={2} />
      <line x1={180} y1={160} x2={180} y2={40} stroke="currentColor" strokeWidth={2} />
      <text x={100} y={230} fontSize={15}>
        A
      </text>
      <text x={286} y={230} fontSize={15}>
        B
      </text>
      <text x={346} y={174} fontSize={15}>
        C
      </text>
      <text x={286} y={82} fontSize={15}>
        B₁
      </text>
    </Frame>
  );
}

function Sphere() {
  return (
    <Frame label="Цилиндр, описанный около шара">
      <ellipse cx={250} cy={80} rx={90} ry={26} fill="none" stroke="currentColor" strokeWidth={2} />
      <ellipse cx={250} cy={250} rx={90} ry={26} fill="none" stroke="currentColor" strokeWidth={2} />
      <line x1={160} y1={80} x2={160} y2={250} stroke="currentColor" strokeWidth={2} />
      <line x1={340} y1={80} x2={340} y2={250} stroke="currentColor" strokeWidth={2} />
      <circle cx={250} cy={165} r={78} fill="none" stroke="currentColor" strokeWidth={1.7} />
    </Frame>
  );
}
