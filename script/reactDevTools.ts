import { BehaviorSubject } from 'rxjs'

interface GlobalState {
  [modelName: string]: object
}

const extension = typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__
const STATE: GlobalState = {}

interface Action {
  type: string
  params?: any
}

type Reducer = (state: GlobalState | undefined, action: Action) => GlobalState | undefined
const reducer: Reducer = () => (STATE ? { ...STATE } : STATE)

const createStore = (reducer: Reducer) => {
  const currentState$ = new BehaviorSubject<GlobalState | undefined>(undefined)
  const getState = () => currentState$.getValue()
  const dispatch = (action: Action) => {
    const currentState = reducer(getState(), action)
    currentState$.next(currentState)
    return action
  }

  dispatch({ type: '@@redux/INIT' })
  return {
    getState,
    dispatch,
    subscribe: currentState$.subscribe.bind(currentState$),
  }
}

export const reduxExtensionStore = extension
  ? extension({
    name: 'istore'
  })(createStore)(reducer)
  : undefined

export function logAction(
  namespace: string,
  infos: { actionName: string; state?: any },
) {
  const action = {
    type: `${namespace}/${infos.actionName}`,
    namespace
  }

  if (infos.state) STATE[namespace] = infos.state
  if (reduxExtensionStore) reduxExtensionStore.dispatch(action)
}