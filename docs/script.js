import './template.js'
import './db.js'
import ListEntry from './list-entry.js'

document.setState({ title: "Home" })
customElements.define('list-entry', ListEntry)

// todo-list define hooks for collect, submits and remove (optional). for example:
//  .collectItem(read => read('.add'))
//  .collectItem(read => `${read('.score')}| ${read('.name')} → ${read('.reason')}`)
//  .submitOnEnter('.name', '.reason')
//  .removeOnClick('.reason')

document.onRender(() => {
  const taskManager = document.querySelector('#task-manager')
  taskManager.collectItem(read => ({ 
    name: read('.name'),
    duration: read('.duration')
  }))
  taskManager.submitOnEnter('.name')
  taskManager.submitOnEnter('.duration')
  taskManager.removeOnClick('.remove')

  /*
  const todoList = document.querySelector('#todo-list')
  todoList.collectItem(read => read('.add'))
  todoList.submitOnEnter('.add')
  todoList.removeOnClick('.remove')
  */
})