import { createStore } from '../../script/index'

const counterState: {
  num: number
} = {
  num: 0
}

export const CounterStore = createStore({ counterState })