import type { SelectionMode, Word } from './types'

export function normalize(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,/#!$%^&*;:{}=_`~()]/g, '')
}

export function isCorrect(attempt: string, target: string) {
  return normalize(attempt) === normalize(target)
}

export function shuffle<T>(list: T[]) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function pickNextWordId(
  words: Word[],
  mode: SelectionMode,
  state: { index: number; queue: string[] },
) {
  if (!words.length) return { id: null, state }
  const ids = words.map((w) => w.id)

  if (mode === 'sequential') {
    const nextIndex = state.index % ids.length
    return { id: ids[nextIndex], state: { ...state, index: nextIndex + 1 } }
  }

  if (mode === 'no-repeats') {
    const queue = state.queue.length ? state.queue : shuffle(ids)
    const [next, ...rest] = queue
    return { id: next ?? ids[0], state: { ...state, queue: rest.length ? rest : shuffle(ids) } }
  }

  const randomId = ids[Math.floor(Math.random() * ids.length)]
  return { id: randomId, state }
}
