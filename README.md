# istore

A light state container for React apps.


Check [document here](https://yilingapa.gitbook.io/github/).

Live [demo here](https://stackblitz.com/edit/istore-demo?file=index.tsx).

## Features
* Less code, few concepts, very ease to use.
* Support Redux DevTools.
* Base on React Hooks, [Rxjs](https://rxjs-dev.firebaseapp.com/) and [Immer](https://immerjs.github.io/immer/).


## Features
```
npm install @yilingapa/istore rxjs immer -S
```

### Use
There are only `2` methods: `createStore` and `useStore`.

You can find more example in `/demo`, clone the repo and run `npm run demo` to explore.

The code below is a simple counter.

```
//store.ts
import { createStore, setStateFunc } from '@yilingapa/istore'

type State = {
  num: number
}
const counterState: State = {
  num: 0
}

/**
* createStore
*
* The first param is initial state, you can use a simple object.
* Pay attention we use '{ counterState }' instead of 'counterState', because we need to show state scope name in Redux DevTools.
* The second param is a function(we name it 'addAction' temporarily, although it's an anonymous function in example).
* 'addAction' needs to return a simple object which contain several methods, there is a method names 'add' in example.
* 'addAction' has only one argument, It names 'to' in example.
* You can do any effect in the method, when you need to modify state, you just need to use 'to' like in example.
* 'to' is the only pure reducer to change state.
*/
export const CounterStore = createStore({ counterState },
  //second param, we call it 'addAction'.
  (to: setStateFunc<State>)=>{
    return {
      add: ()=>{
        to(
          //Just 'modify state'. It use immer to update the structure of state.
          s=>s.num+=1
        )
        //If you return something, you can get it when you run the action.
        return 'I am a return value'.
      }
    }
})


//Counter.tsx
import React, { useCallback, memo, useState } from 'react'
import { useStore } from '@qilejia/istore'
import { CounterStore } from './store'

export function Counter() {
  /**
  * useStore
  *
  * It is the only second API.
  * This API accepts a Store and an option, we will talk about how to use the option later.
  * It retures [state, action], you can use state in React Element.
  * 'action' has a setState method by default, and other methods we just writer above, which is 'add'.
  * Sometimes we do not want to use any state and just want to fire action, we can use 'CounterStore.action.add()' with out 'useStore'.
  */
  const [state, action] = useStore(CounterStore)
  const add = useCallback(() => {
    // same as action.add()
    const res = action.setState(state => {
      state.num += 1
    })
    console.log(res)
    //log 'I am a return value'
  }, [])
  return <div>
    <button onClick={add}>add</button>
    <div>num: {state.num}</div>
  </div>
}
```

Some advanced use about  useStore's second param:
```
/*
*  There are 2 Overloads for useStore.
*/

/*
*  1.
*
*  if we pass { resetOnUnMount: true }, when the component is unmount, the state will reset to init state.
*
*/
const [state, action] = useStore(CounterStore, {
  resetOnUnMount: true
})



/*
*  2.
*
* if we use 'selector', the component will only relay on the selected part of state,
* 'selector' must run fast and return a simple object. We just shallow compare values of the object that 'selector' returns between previous and now.
* sometimes 'selector' is not a pure function, and relay on some other state, although it is not recommended to do this,
* you can add 'selectorDependence' to handel this situation, it should be an array which contains the state that 'selector' relays on.
* if we use 'selector' and we want to reset some parts of the whole state, we can use 'resetOnUnMountHooks' to do this,
* you can set some state when the component is unmount in 'resetOnUnMountHooks'.
*
*/
const [state, action] = useStore(CounterStore, {
  selector: (s) => {
    return {
      num: s.num
    }
  },
  selectorDependence: [ some_other_state ],
  resetOnUnMountHooks: s=>{
    s.num = 0
  }
})
```
