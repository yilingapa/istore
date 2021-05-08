import React from 'react'
import { render } from 'react-dom'
import './index.css'
import { Counter } from './counter/'
import { User } from './selector/'
import { Zoo } from './selectorDependence'

function App() {
  return <div>
    <section>
      <Counter />
    </section>
    <section>
      <User />
    </section>
    <section>
      <Zoo />
    </section>
  </div>
}

render(<App />, document.getElementById('app'))