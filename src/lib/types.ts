export type Word = {
  id: string
  word: string
  hint?: string
  category?: string
  difficulty?: number
  active?: boolean
}

export type WordsPayload = {
  version: number
  updatedAt: string
  words: Word[]
}

export type AttemptRecord = {
  id: string
  wordId: string
  expected: string
  attempt: string
  correct: boolean
  at: number
  hint?: string
  teamId?: string
  teamName?: string
}

export type SelectionMode = 'random' | 'sequential' | 'no-repeats'

export type GameSettings = {
  voiceURI?: string
  rate: number
  pitch: number
  selectionMode: SelectionMode
  filters: {
    category?: string
    difficulty?: number
  }
}

export type Team = {
  id: string
  name: string
}
