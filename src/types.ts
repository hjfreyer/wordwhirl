
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

export type ViewState = InRoundState;

export interface InRoundState {
  kind : "in_round"
  score : number
  timeLeft : number

  suggesting : string[]
  available : string[]
  wrong : boolean

  answers : Answer[]
}

export interface Answer {
  word : string
  hidden : boolean
}
