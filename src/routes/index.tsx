import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  problemsByNumber,
  problemById,
  FORMULAS,
  MAX_PRIMARY,
  tasks,
} from "@/lib/ege/catalog";
import {
  lastResultByProblem,
  topicStats,
  useTrainer,
} from "@/lib/ege/store";
import { answersMatch } from "@/lib/ege/check";
import { MathText } from "@/components/trainer/math-text";
import { FigureView } from "@/components/trainer/figures";
import { askTutor, generateSimilar } from "@/lib/ege/tutor";
import type { Problem } from "@/lib/ege/types";

export const Route = createFileRoute("/")({
  component: TrainerApp,
});

function TrainerApp() {
  const {
    attempts,
    selected,
    session,
    drafts,
    checked,
    toggleNumber,
    setSelected,
    startSession,
    setIndex,
    setDraft,
    markChecked,
    leaveSession,
    record,
    resetProgress,
  } = useTrainer();

  const [showSolution, setShowSolution] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorQ, setTutorQ] = useState("");
  const [tutorHistory, setTutorHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "session" | "stats">("home");
  const [emptyHint, setEmptyHint] = useState(false);
  const [generated, setGenerated] = useState<Problem | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    void useTrainer.persist.rehydrate();
  }, []);

  const baseProblem: Problem | null = useMemo(() => {
    if (!session) return null;
    const id = session.ids[session.index];
    return problemById(id) ?? null;
  }, [session]);

  const currentProblem: Problem | null = generated ?? baseProblem;

  const lastResults = useMemo(() => lastResultByProblem(attempts), [attempts]);
  const stats = useMemo(() => topicStats(attempts), [attempts]);
  const weak = stats.filter((item) => item.total > 0 && item.accuracy < 0.7);

  const correctCount = attempts.filter((a) => a.correct).length;
  const totalAttempts = attempts.length;

  function beginDrill() {
    const ids = selected
      .flatMap((n) => problemsByNumber(n))
      .map((p) => p.id)
      .sort(() => Math.random() - 0.5);
    if (ids.length === 0) return;
    startSession("drill", ids);
    setGenerated(null);
    setShowSolution(false);
    setTutorOpen(false);
    setTutorHistory([]);
    setEmptyHint(false);
    setView("session");
  }

  function beginMock() {
    const ids: string[] = [];
    for (const n of selected) {
      const variants = problemsByNumber(n);
      if (variants.length) {
        ids.push(variants[Math.floor(Math.random() * variants.length)].id);
      }
    }
    if (ids.length === 0) return;
    startSession("mock", ids);
    setGenerated(null);
    setShowSolution(false);
    setTutorOpen(false);
    setTutorHistory([]);
    setEmptyHint(false);
    setView("session");
  }

  function beginMistakes() {
    const wrongIds = [
      ...new Set(
        attempts
          .filter((a) => !a.correct)
          .map((a) => a.problemId)
          .reverse(),
      ),
    ].slice(0, 30);
    if (wrongIds.length === 0) return;
    startSession("mistakes", wrongIds);
    setGenerated(null);
    setShowSolution(false);
    setTutorOpen(false);
    setTutorHistory([]);
    setEmptyHint(false);
    setView("session");
  }

  function checkAnswer() {
    if (!currentProblem) return;
    const fieldValues = currentProblem.fields.map((f) => drafts[currentProblem.id]?.[f.id] ?? "");
    if (fieldValues.some((value) => !value.trim())) {
      setEmptyHint(true);
      return;
    }
    setEmptyHint(false);
    const ok = currentProblem.fields.every((f, i) => answersMatch(fieldValues[i], f.accept));
    record(currentProblem, ok);
    markChecked(currentProblem.id);
    setShowSolution(true);
  }

  function nextProblem() {
    if (!session) return;
    if (session.index + 1 >= session.ids.length) {
      leaveSession();
      setGenerated(null);
      setView("stats");
      return;
    }
    setIndex(session.index + 1);
    setGenerated(null);
    setShowSolution(false);
    setTutorOpen(false);
    setTutorHistory([]);
    setTutorQ("");
    setTutorError(null);
    setEmptyHint(false);
    setGenError(null);
  }

  async function handleGenerate() {
    if (!baseProblem || genLoading) return;
    setGenLoading(true);
    setGenError(null);
    try {
      const res = await generateSimilar({
        data: {
          number: baseProblem.number,
          topic: baseProblem.topic,
          topicId: baseProblem.topicId,
          level: baseProblem.level,
          skills: baseProblem.skills,
          prompt: baseProblem.prompt,
          answer: baseProblem.answerDisplay,
          solution: baseProblem.solution.join("\n"),
          points: baseProblem.points,
        },
      });
      if (!res.ok) {
        setGenError(res.error);
        return;
      }
      const id = `gen-${baseProblem.number}-${Date.now()}`;
      const problem: Problem = {
        id,
        number: baseProblem.number,
        variant: 99,
        topicId: baseProblem.topicId,
        topic: baseProblem.topic,
        skills: baseProblem.skills,
        points: baseProblem.points,
        level: baseProblem.level,
        prompt: res.problem.prompt,
        fields: [
          {
            id: "ans",
            label: "Ответ",
            placeholder: "число",
            accept: res.problem.accept,
          },
        ],
        answerDisplay: res.problem.answerDisplay,
        solution: res.problem.solution,
      };
      setGenerated(problem);
      setShowSolution(false);
      setTutorOpen(false);
      setTutorHistory([]);
      setEmptyHint(false);
      setGenError(null);
    } catch {
      setGenError("Не удалось сгенерировать. Попробуй ещё раз.");
    } finally {
      setGenLoading(false);
    }
  }

  async function sendTutor() {
    if (!currentProblem || !tutorQ.trim()) return;
    setTutorLoading(true);
    setTutorError(null);
    const question = tutorQ.trim();
    setTutorQ("");
    const nextHistory = [...tutorHistory, { role: "user" as const, content: question }];
    setTutorHistory(nextHistory);

    try {
      const res = await askTutor({
        data: {
          question,
          prompt: currentProblem.prompt,
          answer: currentProblem.answerDisplay,
          solution: currentProblem.solution.join("\n"),
          history: nextHistory.slice(0, -1),
        },
      });
      if (res.ok) {
        setTutorHistory((h) => [...h, { role: "assistant", content: res.text }]);
      } else {
        setTutorError(res.error);
      }
    } catch {
      setTutorError("Не удалось получить ответ. Попробуй позже.");
    } finally {
      setTutorLoading(false);
    }
  }

  if (view === "session" && currentProblem && session) {
    const isChecked = checked[currentProblem.id];
    const draft = drafts[currentProblem.id] ?? {};
    const wasCorrect = lastResults.get(currentProblem.id);

    return (
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                leaveSession();
                setGenerated(null);
                setGenError(null);
                setView("home");
              }}
              className="text-sm text-muted hover:text-ink"
            >
              ← Выйти
            </button>
            <div className="text-center">
              <div className="font-display text-lg font-semibold tracking-tight">
                № {currentProblem.number}
                <span className="ml-2 text-sm font-normal text-muted">{currentProblem.topic}</span>
              </div>
              <div className="text-xs text-faint">
                {session.index + 1} / {session.ids.length}
                {session.mode === "mock" && " · вариант"}
                {session.mode === "mistakes" && " · ошибки"}
              </div>
            </div>
            <div className="w-16 text-right text-xs text-muted">{currentProblem.points} б.</div>
          </div>
          <div className="h-1 bg-wash">
            <div
              className="h-full bg-accent transition-all"
              style={{
                width: `${((session.index + (isChecked ? 1 : 0)) / session.ids.length) * 100}%`,
              }}
            />
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full bg-wash px-2.5 py-0.5">{currentProblem.level}</span>
            {currentProblem.skills.map((s) => (
              <span key={s} className="rounded-full border border-line px-2.5 py-0.5">
                {s}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-5 shadow-sheet">
            <MathText text={currentProblem.prompt} className="text-lg leading-relaxed" />
            {currentProblem.figure && <FigureView id={currentProblem.figure} />}
            {generated && (
              <p className="mt-3 text-xs text-muted">Сгенерированный вариант · можно решать как обычное задание</p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={genLoading || !!isChecked}
              className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-ink disabled:opacity-50"
            >
              {genLoading ? "Генерирую…" : generated ? "Ещё похожее" : "Сгенерировать похожее"}
            </button>
            {generated && !isChecked && (
              <button
                type="button"
                onClick={() => {
                  setGenerated(null);
                  setShowSolution(false);
                  setGenError(null);
                }}
                className="text-sm text-muted hover:text-ink"
              >
                Вернуть исходное
              </button>
            )}
            {genError && <span className="text-sm text-bad">{genError}</span>}
          </div>

          <div className="mt-6 space-y-4">
            {currentProblem.fields.map((field) => (
              <div key={field.id}>
                <label className="mb-1.5 block text-sm font-medium text-muted">{field.label}</label>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  placeholder={field.placeholder}
                  value={draft[field.id] ?? ""}
                  disabled={!!isChecked}
                  onChange={(e) => {
                    setEmptyHint(false);
                    setDraft(currentProblem.id, field.id, e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isChecked) checkAnswer();
                  }}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-lg outline-none focus:border-accent disabled:opacity-70"
                />
              </div>
            ))}
          </div>

          {emptyHint && !isChecked && (
            <p className="mt-3 text-sm text-bad">Сначала впиши ответ.</p>
          )}

          {!isChecked && (
            <button
              type="button"
              onClick={checkAnswer}
              className="mt-6 w-full rounded-xl bg-accent py-3.5 font-medium text-accent-fg transition hover:opacity-95"
            >
              Проверить
            </button>
          )}

          {isChecked && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 ${
                wasCorrect ? "border-ok/30 bg-ok-bg text-ok" : "border-bad/30 bg-bad-bg text-bad"
              }`}
            >
              <div className="font-medium">{wasCorrect ? "Верно" : "Неверно"}</div>
              <div className="mt-1 text-sm opacity-90">
                Правильный ответ: <span className="font-semibold">{currentProblem.answerDisplay}</span>
              </div>
            </div>
          )}

          {isChecked && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowSolution((v) => !v)}
                className="text-sm font-medium text-accent underline-offset-2 hover:underline"
              >
                {showSolution ? "Скрыть разбор" : "Показать разбор"}
              </button>
              {showSolution && (
                <div className="mt-3 space-y-3 overflow-x-auto rounded-xl border border-line bg-surface p-5">
                  {currentProblem.solution.map((step, i) => (
                    <MathText key={i} text={step} className="leading-relaxed" />
                  ))}
                </div>
              )}
            </div>
          )}

          {isChecked && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setTutorOpen((v) => !v)}
                className="text-sm font-medium text-muted hover:text-ink"
              >
                {tutorOpen ? "Скрыть вопросы по решению" : "Задать вопрос по решению"}
              </button>

              {tutorOpen && (
                <div className="mt-3 rounded-xl border border-line bg-surface p-4">
                  <div className="mb-3 max-h-64 space-y-3 overflow-y-auto">
                    {tutorHistory.length === 0 && (
                      <p className="text-sm text-muted">
                        Спроси, например: «Почему коэффициент подобия 1/2?» или «Как получить угол ADB?»
                      </p>
                    )}
                    {tutorHistory.map((turn, i) => (
                      <div
                        key={i}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          turn.role === "user" ? "ml-6 bg-wash" : "mr-6 border border-line bg-bg"
                        }`}
                      >
                        <MathText text={turn.content} />
                      </div>
                    ))}
                    {tutorLoading && <div className="text-sm text-muted">Думаю…</div>}
                    {tutorError && <div className="text-sm text-bad">{tutorError}</div>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tutorQ}
                      onChange={(e) => setTutorQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !tutorLoading) void sendTutor();
                      }}
                      placeholder="Вопрос по этому заданию…"
                      className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                      disabled={tutorLoading}
                    />
                    <button
                      type="button"
                      onClick={() => void sendTutor()}
                      disabled={tutorLoading || !tutorQ.trim()}
                      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
                    >
                      Спросить
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {isChecked && (
            <button
              type="button"
              onClick={nextProblem}
              className="mt-8 w-full rounded-xl bg-accent py-3.5 font-medium text-accent-fg"
            >
              {session.index + 1 >= session.ids.length ? "К результатам" : "Следующее задание"}
            </button>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-5">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Профиль 27</h1>
            <p className="mt-0.5 text-sm text-muted">Тренажёр по демоверсии ЕГЭ · профильная математика</p>
          </div>
          <div className="text-right text-sm text-muted">
            <div>
              {correctCount}/{totalAttempts || "—"} верно
            </div>
            {totalAttempts > 0 && (
              <div className="text-xs text-faint">{Math.round((correctCount / totalAttempts) * 100)}%</div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {view === "stats" && (
          <div className="mb-6 rounded-xl border border-line bg-surface p-5 shadow-sheet">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Результаты</h2>
              <button type="button" onClick={() => setView("home")} className="text-sm text-muted hover:text-ink">
                Закрыть
              </button>
            </div>
            {stats.length === 0 ? (
              <p className="text-sm text-muted">Пока нет попыток.</p>
            ) : (
              <ul className="space-y-2">
                {stats.map((s) => (
                  <li key={s.topicId} className="flex items-center justify-between gap-3 text-sm">
                    <span>{s.title}</span>
                    <span className="tabular-nums text-muted">
                      {s.correct}/{s.total} · {Math.round(s.accuracy * 100)}%
                      {s.accuracy < 0.7 ? " · подтянуть" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => {
                if (confirm("Сбросить весь прогресс?")) {
                  resetProgress();
                  setView("home");
                }
              }}
              className="mt-4 text-xs text-bad hover:underline"
            >
              Сбросить прогресс
            </button>
          </div>
        )}

        <section className="mb-8">
          <h2 className="mb-3 font-display text-lg font-semibold">Выбери номера</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelected(tasks.filter((t) => t.part === 1).map((t) => t.number))}
              className="rounded-full border border-line px-3 py-1 text-xs hover:bg-wash"
            >
              Часть 1
            </button>
            <button
              type="button"
              onClick={() => setSelected(tasks.filter((t) => t.part === 2).map((t) => t.number))}
              className="rounded-full border border-line px-3 py-1 text-xs hover:bg-wash"
            >
              Часть 2
            </button>
            <button
              type="button"
              onClick={() => setSelected(tasks.map((t) => t.number))}
              className="rounded-full border border-line px-3 py-1 text-xs hover:bg-wash"
            >
              Все
            </button>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="rounded-full border border-line px-3 py-1 text-xs hover:bg-wash"
            >
              Очистить
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {tasks.map((task) => {
              const active = selected.includes(task.number);
              const variants = problemsByNumber(task.number).length;
              return (
                <button
                  key={task.number}
                  type="button"
                  onClick={() => toggleNumber(task.number)}
                  className={`relative flex min-h-11 flex-col items-center justify-center rounded-lg border py-2 text-sm transition ${
                    active
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-line bg-surface hover:border-line-strong"
                  }`}
                  title={task.title}
                >
                  <span className="font-semibold">{task.number}</span>
                  <span className={`text-xs ${active ? "opacity-80" : "text-faint"}`}>{task.points}б</span>
                  {variants > 1 && (
                    <span
                      className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        active ? "bg-accent-fg text-accent" : "bg-wash text-muted"
                      }`}
                    >
                      {variants}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-faint">
            Выбрано: {selected.length} · максимум первичных баллов:{" "}
            {selected.reduce((s, n) => s + (tasks.find((t) => t.number === n)?.points ?? 0), 0)} из {MAX_PRIMARY}
          </p>
        </section>

        <section className="mb-8 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={beginDrill}
            disabled={selected.length === 0}
            className="rounded-xl border border-line bg-surface px-4 py-5 text-left shadow-sheet transition hover:border-accent disabled:opacity-40"
          >
            <div className="font-display text-lg font-semibold">Тренировка</div>
            <p className="mt-1 text-sm text-muted">Все варианты выбранных номеров в случайном порядке</p>
          </button>
          <button
            type="button"
            onClick={beginMock}
            disabled={selected.length === 0}
            className="rounded-xl border border-line bg-surface px-4 py-5 text-left shadow-sheet transition hover:border-accent disabled:opacity-40"
          >
            <div className="font-display text-lg font-semibold">Вариант</div>
            <p className="mt-1 text-sm text-muted">По одному случайному заданию на каждый выбранный номер</p>
          </button>
          <button
            type="button"
            onClick={beginMistakes}
            disabled={attempts.filter((a) => !a.correct).length === 0}
            className="rounded-xl border border-line bg-surface px-4 py-5 text-left shadow-sheet transition hover:border-accent disabled:opacity-40"
          >
            <div className="font-display text-lg font-semibold">Ошибки</div>
            <p className="mt-1 text-sm text-muted">Повторить задания, в которых были ошибки</p>
          </button>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Прогресс по темам</h2>
            <button type="button" onClick={() => setView("stats")} className="text-sm text-accent hover:underline">
              Подробнее
            </button>
          </div>
          {stats.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Реши несколько заданий — здесь появятся слабые места.</p>
          ) : (
            <>
              {weak.length > 0 && (
                <p className="mt-2 text-sm text-muted">
                  Стоит подтянуть: {weak.slice(0, 3).map((item) => item.title).join(", ")}
                </p>
              )}
              <ul className="mt-3 space-y-2">
                {stats.slice(0, 5).map((s) => (
                  <li key={s.topicId} className="flex items-center gap-3 text-sm">
                    <div className="w-28 shrink-0 truncate text-muted">{s.title}</div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-wash">
                      <div
                        className={`h-full rounded-full ${s.accuracy < 0.7 ? "bg-bad" : "bg-accent"}`}
                        style={{ width: `${Math.round(s.accuracy * 100)}%` }}
                      />
                    </div>
                    <div className="w-12 text-right tabular-nums text-muted">{Math.round(s.accuracy * 100)}%</div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Формулы под рукой</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FORMULAS.map((f) => (
              <div key={f} className="overflow-x-auto rounded-lg bg-bg px-3 py-2 text-sm">
                <MathText text={f} />
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-faint">
          Задания составлены по структуре демоверсии ЕГЭ 2027 · ответы и разборы встроены
        </p>
      </main>
    </div>
  );
}
