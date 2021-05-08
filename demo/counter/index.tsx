import React, { useCallback, memo, useState } from 'react'
import { useStore } from '../../script'
import { CounterStore } from './store'

export const Modal = memo(function Modal(
) {
  const [state] = useStore(CounterStore, {
    resetOnUnMount: true
  })
  return <div className="modal">
    <AddButton />
    <div>num: {state.num}</div>
  </div>
})

export function Counter() {
  console.log('render simple use');
  const [visible, setVisible] = useState(false)
  const openModal = useCallback(() => {
    setVisible(s => !s)
  }, [])
  return <div>
    <h3>Simple use</h3>
    <button onClick={openModal}>{visible ? 'close' : 'open'} modal</button>
    {
      visible ? <Modal /> : null
    }
  </div>
}

function AddButton() {
  const add = useCallback(() => {
    CounterStore.action.setState(s => {
      s.num += 1
    })
  }, [])
  return <button onClick={add}>add</button>
}