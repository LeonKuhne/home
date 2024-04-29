import './template.js'
import './db.js'
import TodoList from './todo-list.js'

document.setState({ title: "Home" })
customElements.define('todo-list', TodoList)

// todo-list define hooks for collect, submits and remove (optional). for example:
//  .collectItem(() => taskManager.read('.add'))
//  .collectItem(read => `${read('.score')}| ${read('.name')} → ${read('.reason')}`)
//  .submitOnEnter('.name', '.reason')
//  .removeOnClick('.reason')

document.onRender(() => {
  const taskManager = document.querySelector('#task-manager')
  taskManager.collectItem(() => taskManager.read('.add'))
  taskManager.submitOnEnter('.add')
  taskManager.removeOnClick('.remove')
})