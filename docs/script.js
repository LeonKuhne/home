import './template.js'
import './db.js'
import TodoList from './todo-list.js'

document.setState({ title: "Home" })
customElements.define('todo-list', TodoList)

//
// Todo Actions
document.onRender(() => {
  // todos
  const todosElem = document.querySelector('#todos')
  // aggregate
  todosElem.collectItem(() => todosElem.read('.add') )
  todosElem.submitOnEnter('.add')
  todosElem.removeOnClick('.remove')

  // wants
  const wantsElem = document.querySelector('#wants')
  // aggregate
  wantsElem.collectItem(read => `${read('.score')}| ${read('.name')} → ${read('.reason')}`)
  wantsElem.submitOnClick('.add')
  wantsElem.submitOnEnter('.name', '.reason')
  wantsElem.removeOnClick('.remove')
})