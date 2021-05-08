import { Subject } from 'rxjs'
import produce, { Draft } from 'immer'
import { Store, actionType, setStateFunc } from './type'
import { useState, useLayoutEffect, useRef } from 'react'
import { tap } from 'rxjs/operators'
import { logAction, reduxExtensionStore } from './reactDevTools'

function checkDiff(next: Record<string, any>, cache: Record<string, any>) {
  for (const key in next) {
    if (next[key] !== cache[key]) return true
  }
  return false
}

export function useStore<
  T,
  action extends actionType,
  option extends {
    selector: (s: T) => any
    resetOnUnMountHooks?: (s: T) => void
    selectorDependence?: any[]
  }
>(
  store: Store<T, action>,
  option: option
): [ReturnType<option['selector']>, action]
export function useStore<
  T,
  action extends actionType,
  option extends {
    resetOnUnMount?: boolean
  }
>(store: Store<T, action>, option?: option): [T, action]

export function useStore<T, action extends actionType>(
  store: Store<T, action>,
  option: {
    selector?: (s: T) => Partial<T>
    selectorDependence?: any[]
    resetOnUnMountHooks?: (s: T) => void,
    resetOnUnMount?: boolean
  } = { resetOnUnMount: false }
): any {
  if (typeof option.selector !== 'undefined') {
    option.selectorDependence = option.selectorDependence || []
    const [state, setState] = useState(option.selector(store.state))
    const stateCache = useRef(state)
    useLayoutEffect(() => {
      const selected = option.selector!(store.state)
      if (checkDiff(selected, stateCache.current)) {
        stateCache.current = selected
        setState(selected)
      }
      const sub = store.subject.subscribe(() => {
        const selected = option.selector!(store.state)
        if (checkDiff(selected, stateCache.current)) {
          stateCache.current = selected
          setState(selected)
        }
      })
      return () => {
        if (option.resetOnUnMountHooks) {
          store.action.setState(option.resetOnUnMountHooks)
        }
        sub.unsubscribe()
      }
    }, option.selectorDependence)
    return [state, store.action]
  } else {
    const [state, setState] = useState(store.state)
    useLayoutEffect(() => {
      const sub = store.subject.subscribe(setState)
      return () => {
        if (option.resetOnUnMount) {
          store.init()
        }
        sub.unsubscribe()
      }
    }, [])
    return [state, store.action]
  }
}

export const createStore = <T,
  G extends (set: setStateFunc<T>) => Record<string, any>,
  actionType = ReturnType<G> & { setState: setStateFunc<T> },
  >(
    initState: {
      [key in string]: T
    },
    getActions?: G,
  /*eslint-disable */
): Store<T, actionType> => {
  /*eslint-enable */
  'use strict'
  const subject = new Subject<T>()
  const actions = Object.create(null)
  const canConnectReduxDevTools = typeof reduxExtensionStore !== 'undefined'

  let storeName!: string
  let keyLength = 0
  for (const key in initState) {
    keyLength += 1
    storeName = key
    if (keyLength > 1) {
      console.error(`Use createStore({stateScopeName}) pls.[give a name to the state, it helps to distinguish state scope in Redux DevTool.]`)
      throw 'creat store filed because of error use of init state'
    }
  }

  let stateGard = false;
  const storeShadow: {
    state: T
  } = {
    state: initState[storeName]
  }

  const store: Store<T, actionType> = {
    get state() {
      return storeShadow.state
    },
    set state(value: T) {
      if (stateGard) {
        storeShadow.state = value
      } else {
        console.warn('Do not modify state directly, use action only.')
      }
    },
    // Exposed this in case of user's subscribe
    subject,
    init: () => subject.next(initState[storeName]),
    action: actions as actionType
  }

  store.subject = store.subject.pipe(
    tap((s) => {
      stateGard = true
      store.state = s
      stateGard = false
    })
  ) as Subject<T>

  Object.freeze(store)

  const setState = ((cb: (s: Draft<T>) => any) => {
    const s = produce(storeShadow.state, (draft: Draft<T>) => {
      cb(draft)
    })
    if (canConnectReduxDevTools) {
      logAction(storeName, {
        actionName: 'setState',
        state: s
      })
    }
    store.subject.next(s)
  }) as setStateFunc<T>

  if (typeof getActions !== 'undefined') {
    const actionsToAdd = getActions(setState)
    if (canConnectReduxDevTools) {
      Object.keys(actionsToAdd).forEach(key => {
        const pre = actionsToAdd[key].bind(null)
        actionsToAdd[key] = (...arg: any[]) => {
          pre(...arg)
          logAction(storeName, {
            actionName: key,
            state: store.state
          })
        }
      })
    }
    Object.assign(actions, actionsToAdd, { setState })
  } else {
    Object.assign(actions, { setState })
  }

  if (canConnectReduxDevTools) {
    let latestActionId = 1
    reduxExtensionStore.subscribe((res: any) => {
      try {
        if (res.currentStateIndex <= latestActionId) {
          if (res.actionsById[res.currentStateIndex]?.action?.namespace === storeName) {
            store.subject.next(
              res.computedStates[res.currentStateIndex]?.state?.[storeName] ?? initState[storeName]
            )
          }
        }
      } catch (e) {
        console.log(`redux devtool sync state error:`, e);
      }
      latestActionId = res.stagedActionIds[res.stagedActionIds.length - 1]
    })
  }

  return store
}

export type { setStateFunc } from './type'
