function canon(raw: string): string {
  let s = raw.trim().toLowerCase();
  s = s.replace(/[−–—]/g, "-");
  s = s.replace(/\s+/g, "");
  s = s.replace(/\\infty|∞/g, "inf");
  s = s.replace(/\+inf/g, "inf");
  s = s.replace(/\\pi|π/g, "pi");
  s = s.replace(/\\cdot|·|×/g, "*");
  s = s.replace(/≤/g, "<=");
  s = s.replace(/≥/g, ">=");
  s = s.replace(/≠/g, "!=");
  s = s.replace(/\\sqrt\{([^}]+)\}/g, "sqrt$1");
  s = s.replace(/√\(([^)]+)\)/g, "sqrt$1");
  s = s.replace(/√([a-z0-9]+)/g, "sqrt$1");
  s = s.replace(/sqrt\(([^)]+)\)/g, "sqrt$1");
  s = s.replace(/\*sqrt/g, "sqrt");
  s = s.replace(/\*\*/g, "^");
  s = s.replace(/(\d),(\d)/g, "$1.$2");
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\\left|\\right/g, "");
  s = s.replace(/\.$/, "");
  return s;
}

function numericValue(s: string): number | null {
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) return Number(s);
  const frac = s.match(/^([+-]?\d+)\/([+-]?\d+)$/);
  if (frac) {
    const d = Number(frac[2]);
    if (d === 0) return null;
    return Number(frac[1]) / d;
  }
  return null;
}

function close(a: string, b: string): boolean {
  const x = numericValue(a);
  const y = numericValue(b);
  if (x === null || y === null) return false;
  return Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y));
}

function splitList(s: string): string[] {
  const interval = /[(\[][^\]\)]+[)\]]/.test(s);
  if (interval) {
    const chunks = s
      .split(/∪|\\cup/i)
      .flatMap((chunk) => chunk.split(/;(?=[\(\[])/))
      .map((p) => p.trim())
      .filter(Boolean);
    return chunks.length > 1 ? chunks : [s];
  }
  const shielded = s.replace(/(\d)\.(\d)/g, "$1#$2");
  const bits = shielded
    .split(/;|,/)
    .map((p) => p.replace(/#/g, ".").trim())
    .filter(Boolean);
  return bits.length > 0 ? bits : [s];
}

function sameList(a: string, b: string): boolean {
  const pa = splitList(a);
  const pb = splitList(b);
  if (pa.length < 2 || pa.length !== pb.length) return false;
  const sb = [...pb];
  for (const part of pa) {
    const i = sb.findIndex((q) => q === part || close(part, q));
    if (i < 0) return false;
    sb.splice(i, 1);
  }
  return true;
}

export function answersMatch(input: string, accept: string[]): boolean {
  const c = canon(input);
  if (!c) return false;
  for (const variant of accept) {
    const target = canon(variant);
    if (!target) continue;
    if (c === target || close(c, target) || sameList(c, target)) return true;
  }
  return false;
}
