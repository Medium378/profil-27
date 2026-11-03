import type { Problem, TaskMeta } from "./types";
import { part1 } from "./part1";
import { part2 } from "./part2";

export const problems: Problem[] = [...part1, ...part2];

export const tasks: TaskMeta[] = [
  { number: 1, title: "Планиметрия", part: 1, points: 1, topicId: "planimetry" },
  { number: 2, title: "Векторы", part: 1, points: 1, topicId: "vectors" },
  { number: 3, title: "Стереометрия", part: 1, points: 1, topicId: "stereo-basic" },
  { number: 4, title: "Вероятность", part: 1, points: 1, topicId: "probability" },
  { number: 5, title: "Вероятность", part: 1, points: 1, topicId: "probability-hard" },
  { number: 6, title: "Ожидание", part: 1, points: 1, topicId: "expectation" },
  { number: 7, title: "Уравнения", part: 1, points: 1, topicId: "equations" },
  { number: 8, title: "Выражения", part: 1, points: 1, topicId: "expressions" },
  { number: 9, title: "Производная", part: 1, points: 1, topicId: "derivative" },
  { number: 10, title: "Модели", part: 1, points: 1, topicId: "models" },
  { number: 11, title: "Текст", part: 1, points: 1, topicId: "word" },
  { number: 12, title: "Графики", part: 1, points: 1, topicId: "graphs" },
  { number: 13, title: "Кредит", part: 1, points: 1, topicId: "finance" },
  { number: 14, title: "Тригонометрия", part: 2, points: 2, topicId: "trig" },
  { number: 15, title: "Стереометрия", part: 2, points: 3, topicId: "stereo" },
  { number: 16, title: "Неравенства", part: 2, points: 2, topicId: "inequality" },
  { number: 17, title: "Экстремум", part: 2, points: 2, topicId: "extremum" },
  { number: 18, title: "Планиметрия", part: 2, points: 3, topicId: "geometry" },
  { number: 19, title: "Параметр", part: 2, points: 4, topicId: "parameter" },
  { number: 20, title: "Целые числа", part: 2, points: 4, topicId: "numbers" },
];

export const MAX_PRIMARY = tasks.reduce((sum, task) => sum + task.points, 0);

export function problemsByNumber(number: number): Problem[] {
  return problems.filter((problem) => problem.number === number);
}

export function problemById(id: string): Problem | undefined {
  return problems.find((problem) => problem.id === id);
}

export const FORMULAS = [
  "$\\sin^2\\alpha + \\cos^2\\alpha = 1$",
  "$\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha$",
  "$\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha$",
  "$\\sin(\\alpha+\\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta$",
  "$\\cos(\\alpha+\\beta) = \\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta$",
  "$(a+b)^2 = a^2 + 2ab + b^2$",
  "$a^2 - b^2 = (a-b)(a+b)$",
  "$S_{\\triangle} = \\tfrac{1}{2}ab\\sin C$",
  "$V_{\\text{цил}} = \\pi r^2 h$, $V_{\\text{кон}} = \\tfrac{1}{3}\\pi r^2 h$",
  "$V_{\\text{шар}} = \\tfrac{4}{3}\\pi r^3$, $S = 4\\pi r^2$",
  "$(x^n)' = nx^{n-1}$, $(\\sin x)' = \\cos x$",
  "$(\\ln x)' = 1/x$, $(e^x)' = e^x$",
];
