import { createServerFn } from "@tanstack/react-start";

type ChatTurn = { role: "user" | "assistant"; content: string };

export type AskTutorInput = {
  question: string;
  prompt: string;
  answer: string;
  solution: string;
  history: ChatTurn[];
};

export const askTutor = createServerFn({ method: "POST" })
  .validator((input: AskTutorInput) => input)
  .handler(async ({ data }) => {
    const { answerQuestion } = await import("./tutor.server");
    return answerQuestion(data);
  });

export type GenerateSimilarInput = {
  number: number;
  topic: string;
  topicId: string;
  level: string;
  skills: string[];
  prompt: string;
  answer: string;
  solution: string;
  points: number;
};

export const generateSimilar = createServerFn({ method: "POST" })
  .validator((input: GenerateSimilarInput) => input)
  .handler(async ({ data }) => {
    const { generateSimilarProblem } = await import("./tutor.server");
    return generateSimilarProblem(data);
  });
