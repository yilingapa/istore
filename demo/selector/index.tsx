import React, { memo, PropsWithChildren, useCallback } from 'react'
import { useStore } from '../../script'
import { UserStore } from './store'
import produce from 'immer'

const Loading = memo(function Loading(props: PropsWithChildren<{}>) {
  const [state] = useStore(UserStore, {
    selector: s => {
      return {
        loading: s.loading
      }
    }
  })
  return <div>
    {state.loading ? 'Loading...' : null}
    {props.children}
  </div>
})

const Login = memo((props: PropsWithChildren<{}>) => {
  const getUser = useCallback(() => {
    UserStore.action.getUser()
  }, [])
  return <button onClick={getUser}>Login</button>
})

export function User() {
  console.log('render selector');
  const [state] = useStore(UserStore, {
    selector: s => {
      return {
        name: s.name,
        age: s.age
      }
    }
  })

  return <div>
    <h3>selector</h3>
    Hello, {state.name ?? <span>click to login <Login /></span>}
    <Loading>
      <ul>
        <li>name: {state.name ?? '--'}</li>
        <li>age: {state.age ?? '--'}</li>
      </ul>
    </Loading>
  </div>
}