import './util.js'
import './template.js'
import './db.js'
import ListEntry from './list-entry.js'
import Task from './task.js'
import QuarterHour from './quarter-hour.js'

const taskManagerId = 'task-manager'
const scheduleId = 'calendar'

// create schedule if none saved
if (localStorage.getItem(scheduleId) === null) {
  localStorage.setItem(scheduleId, JSON.stringify(QuarterHour.quarteredDay()))
}

// define custom elements
customElements.define('list-entry', ListEntry)
customElements.define('quarter-hour', QuarterHour)

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
    })

    document.onRender(state => {
      // task-manager interactions
      const taskManager = document.getElementById(taskManagerId)
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
        const task = state[taskManagerId].find(task => task.id === taskId)
        console.log('drop', taskId)
        for (let i = 0; i < state[scheduleId].length; i++) {
          const timeslot = state[scheduleId][i]
          if (quarterHour.equalsTimeslot(timeslot)) {
            timeslot.task = task
            timeslot.duration = parseInt(task.duration)
            document.getElementById(scheduleId).update(i, timeslot)
            return
          }
        }
      })
    })
}
