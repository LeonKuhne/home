import './template.js'
import './db.js'
import ListEntry from './list-entry.js'

// register elements
// TODO move this within component (use static call)
customElements.define('list-entry', ListEntry)

// list-entry hooks
//  .collectItem(read => read('.add'))
//  .collectItem(read => `${read('.score')}| ${read('.name')} → ${read('.reason')}`)
//  .submitOnEnter('.name', '.reason', '.add')
//  .removeOnClick('.reason')

//
// Read URL
const params = new URLSearchParams(window.location.search)
switch (params.get('page')) {

  //
  // Todo Page

  case 'todo':
    document.setState({ title: "Todo" })
    document.onRender(() => {
      const todoList = document.querySelector('#todo-list')
      todoList.collectItem(read => read('.add'))
      todoList.submitOnEnter('.add')
      todoList.removeOnClick('.remove')
    })
    break;

  //
  // Task Manager

  default:
    document.setState({ 
      title: "Home",
      hours: Array.from({ length: 24 }, (_, i) => new Date(0, 0, 0, i).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }))
    })
    document.onRender(() => {
      const taskManager = document.querySelector('#task-manager')
      taskManager.collectItem(read => ({ 
        name: read('#task-name'),
        duration: read('input.duration')
      }))
      taskManager.submitOnEnter('#task-name')
      taskManager.submitOnEnter('input.duration')
      taskManager.removeOnClick('.remove')
    })
}
