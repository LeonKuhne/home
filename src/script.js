import './util.js'
import './template.js'
import './db.js'
import ListEntry from './list-entry.js'
import Task from './task.js'
import QuarterHour from './quarter-hour.js'

// custom elements
customElements.define('list-entry', ListEntry)
customElements.define('quarter-hour', QuarterHour)

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
    document.onRender(_ => {
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
      schedule: QuarterHour.quarteredDay()
    })

    document.onRender(state => {
      // task-manager interactions
      const taskManager = document.querySelector('#task-manager')
      taskManager.collectItem(read => {
        const name = read('#task-name')
        return new Task(name, {
          id: new String(name.hashCode()),
          createdAt: new Date().toISOString(),
          duration: read('input.duration'),
        })
      })
      taskManager.submitOnEnter('#task-name')
      taskManager.submitOnEnter('input.duration')
      taskManager.removeOnClick('.remove')

      // calendar interactions
      taskManager.querySelectorAll('.item').forEach(item => {
        item.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', e.target.id))
      })
      taskManager.querySelectorAll('.hour-marker').forEach(quarterHour => quarterHour.onDropTask = (taskId) => {
        const task = state['task-manager'].find(task => task.id === taskId)
        console.log('drop', taskId)
        const timeslot = quarterHour.getTimeslot(state)
        timeslot.assign(task, parseInt(task.duration))
      })
    })
}
