import React, { memo, PropsWithChildren, useCallback, useState } from 'react'
import { useStore } from '../../script'
import { ZooStore } from './store'

export const Zoo = memo(function Zoo() {
  const [type, setType] = useState<'animal' | 'bird'>('animal')

  const toggle = useCallback(() => {
    setType(s => s === 'animal' ? 'bird' : 'animal')
  }, [])
  return <div>
    <h3>selectorDependence</h3>
    Michel go to Zoo.
    He goes to <button onClick={toggle}>{type}</button> area.<br />
    <CountNum type={type} />
  </div>
})

export const CountNum = memo(({
  type
}: PropsWithChildren<{
  type: 'animal' | 'bird'
}>) => {
  console.log('render selectorDependence');
  const [state, action] = useStore(ZooStore, {
    selector: s => {
      return {
        num: s[type].num
      }
    },
    selectorDependence: [type],
    resetOnUnMountHooks: s => {
      s[type].num = 0
    }
  })
  const count = useCallback(() => {
    action.setState(s => {
      s[type].num += 1
    })
  }, [type])
  return <div>
    He <button onClick={count}>counts</button> {state.num} {type}s.
  </div>
})