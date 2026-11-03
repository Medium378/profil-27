type ChatTurn = { role: "user" | "assistant"; content: string };

type AskInput = {
  question: string;
  prompt: string;
  answer: string;
  solution: string;
  history: ChatTurn[];
};

const MAX_QUESTION = 700;
const MAX_HISTORY = 6;

export async function answerQuestion(data: AskInput) {
  const question = data.question?.trim() ?? "";
  if (!question || question.length > MAX_QUESTION) {
    return { ok: false as const, error: "Вопрос пустой или слишком длинный." };
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false as const,
      error: "Сейчас не получится спросить: разбор в карточке уже есть, а уточнения временно недоступны.",
    };
  }

  const history = (data.history ?? [])
    .filter((turn) => turn && (turn.role === "user" || turn.role === "assistant"))
    .slice(-MAX_HISTORY)
    .map((turn) => ({
      role: turn.role,
      content: String(turn.content).slice(0, 1800),
    }));

  const system = [
    "Ты преподаватель профильной математики и готовишь ученика к ЕГЭ.",
    "Отвечай по-русски, коротко и по делу, без воды и без похвалы.",
    "Опирайся на условие, верный ответ и приведённый разбор. Если ученик предлагает другой путь — скажи, годится ли он и где ломается.",
    "Не выдумывай факты задачи. Формулы пиши в долларах LaTeX: $...$.",
    "Если вопрос не про эту задачу, вежливо верни к ней.",
  ].join(" ");

  const user = [
    "Условие:",
    data.prompt.slice(0, 2500),
    "",
    "Верный ответ:",
    data.answer.slice(0, 800),
    "",
    "Разбор:",
    data.solution.slice(0, 3500),
    "",
    "Вопрос ученика:",
    question,
  ].join("\n");

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.3,
        max_tokens: 700,
        messages: [{ role: "system", content: system }, ...history, { role: "user", content: user }],
      }),
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          ok: false as const,
          error: "Сейчас не получится спросить: разбор в карточке уже есть, а уточнения временно недоступны.",
        };
      }
      return { ok: false as const, error: "Не удалось получить ответ. Попробуйте ещё раз чуть позже." };
    }
    const body = (await res.json()) as {
      choices?: { message?: { content?: string | { type?: string; text?: string }[] } }[];
    };
    const content = body.choices?.[0]?.message?.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((part) => part.text ?? "").join("")
          : "";
    if (!text.trim()) {
      return { ok: false as const, error: "Ответ пустой. Сформулируйте вопрос иначе." };
    }
    return { ok: true as const, text: text.trim() };
  } catch {
    return { ok: false as const, error: "Сеть не ответила. Разбор в карточке остаётся на месте." };
  }
}
