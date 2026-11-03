import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Problem } from "./types";
import { problems } from "./catalog";

export type Attempt = {
  problemId: string;
  topicId: string;
  number: number;
  correct: boolean;
  at: number;
};

export type SessionMode = "drill" | "mock" | "mistakes";

type Session = {
  mode: SessionMode;
  ids: string[];
  index: number;
  startedAt: number;
};

type TrainerState = {
  attempts: Attempt[];
  selected: number[];
  session: Session | null;
  drafts: Record<string, Record<string, string>>;
  checked: Record<string, boolean>;
  record: (problem: Problem, correct: boolean) => void;
  toggleNumber: (number: number) => void;
  setSelected: (numbers: number[]) => void;
  startSession: (mode: SessionMode, ids: string[]) => void;
  setIndex: (index: number) => void;
  setDraft: (problemId: string, fieldId: string, value: string) => void;
  markChecked: (problemId: string) => void;
  leaveSession: () => void;
  resetProgress: () => void;
};

export const useTrainer = create<TrainerState>()(
  persist(
    (set) => ({
      attempts: [],
      selected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      session: null,
      drafts: {},
      checked: {},
      record: (problem, correct) =>
        set((state) => ({
          attempts: [
            ...state.attempts,
            {
              problemId: problem.id,
              topicId: problem.topicId,
              number: problem.number,
              correct,
              at: Date.now(),
            },
          ].slice(-400),
        })),
      toggleNumber: (number) =>
        set((state) => ({
          selected: state.selected.includes(number)
            ? state.selected.filter((item) => item !== number)
            : [...state.selected, number].sort((a, b) => a - b),
        })),
      setSelected: (numbers) => set({ selected: [...numbers].sort((a, b) => a - b) }),
      startSession: (mode, ids) =>
        set({
          session: { mode, ids, index: 0, startedAt: Date.now() },
          checked: {},
        }),
      setIndex: (index) =>
        set((state) =>
          state.session ? { session: { ...state.session, index }, checked: {} } : state,
        ),
      setDraft: (problemId, fieldId, value) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [problemId]: { ...state.drafts[problemId], [fieldId]: value },
          },
          checked: { ...state.checked, [problemId]: false },
        })),
      markChecked: (problemId) =>
        set((state) => ({ checked: { ...state.checked, [problemId]: true } })),
      leaveSession: () => set({ session: null, checked: {} }),
      resetProgress: () => set({ attempts: [], drafts: {}, checked: {}, session: null }),
    }),
    {
      name: "profil-27",
      skipHydration: true,
      partialize: (state) => ({
        attempts: state.attempts,
        selected: state.selected,
        drafts: state.drafts,
      }),
    },
  ),
);

export function topicStats(attempts: Attempt[]) {
  const map = new Map<string, { topicId: string; total: number; correct: number; title: string }>();
  for (const attempt of attempts) {
    const problem = problems.find((item) => item.id === attempt.problemId);
    const title = problem?.topic ?? attempt.topicId;
    const row = map.get(attempt.topicId) ?? {
      topicId: attempt.topicId,
      total: 0,
      correct: 0,
      title,
    };
    row.total += 1;
    if (attempt.correct) row.correct += 1;
    map.set(attempt.topicId, row);
  }
  return [...map.values()]
    .map((row) => ({ ...row, accuracy: row.total ? row.correct / row.total : 0 }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

export function lastResultByProblem(attempts: Attempt[]) {
  const map = new Map<string, boolean>();
  for (const attempt of attempts) map.set(attempt.problemId, attempt.correct);
  return map;
}
