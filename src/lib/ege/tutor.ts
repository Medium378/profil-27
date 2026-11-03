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
