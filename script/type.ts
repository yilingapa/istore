import { Subject } from 'rxjs'

export type actionType = {
  [key in string | number | symbol]: (...arg: any[]) => void
}

export interface Store<T, action extends Record<string, any>> {
  state: T
  subject: Subject<T>
  init: () => void
  action: action
}

export type setStateFunc<T> = (arg: (s: T) => any) => void