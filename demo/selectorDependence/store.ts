import { createStore } from '../../script/'

type State = {
  animal: {
    num: number
  },
  bird: {
    num: number
  }
}

const zooState: State = {
  animal: {
    num: 0
  },
  bird: {
    num: 0
  }
}

export const ZooStore = createStore({ zooState })