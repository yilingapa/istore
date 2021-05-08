import { createStore, setStateFunc } from '../../script/'

type State = {
  name?: string
  age?: number
  loading: boolean
}

const userState: State = {
  loading: false
}

function action(to: setStateFunc<State>) {
  return {
    getUser: () => {
      to(s => {
        s.loading = true
      })
      setTimeout(() => {
        to(s => {
          s.age = 15
          s.name = 'Michel'
          s.loading = false
        })
      }, 1000)
    }
  }
}

export const UserStore = createStore({ userState }, action)