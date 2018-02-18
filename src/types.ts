export interface WordList {
  containment: Containment[]
  words: string[]
}

export interface Containment {
  fullWord: number
  subwords: number[]
}

export interface Position {
  slot: number
  isSuggestion: boolean
}

export type Handler<T> = (a: T) => void