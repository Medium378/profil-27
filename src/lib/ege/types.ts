export type Level = "базовый" | "повышенный" | "высокий";

export type AnswerField = {
  id: string;
  label: string;
  placeholder: string;
  accept: string[];
};

export type Problem = {
  id: string;
  number: number;
  variant: number;
  topicId: string;
  topic: string;
  skills: string[];
  points: number;
  level: Level;
  prompt: string;
  figure?: string;
  fields: AnswerField[];
  answerDisplay: string;
  solution: string[];
};

export type TaskMeta = {
  number: number;
  title: string;
  part: 1 | 2;
  points: number;
  topicId: string;
};
