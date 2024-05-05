import './util.js'
import './template.js'
import './db.js'
import ListEntry from './list-entry.js'
import Task from './task.js'
import QuarterHour from './quarter-hour.js'
import Timeslot from './timeslot.js'

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

    function updateTime() {
      const currentTime = Timeslot.now() 
      document.getElementById(currentTime.timestr).classList.add('now')
    }

    document.onRender(state => {
      const taskManager = document.getElementById(taskManagerId)
      const schedule = document.getElementById(scheduleId)

      // task-manager interactions
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
      taskManager.removeOnClick('.task-list .remove')

      // schedule interactions
      schedule.onClick((e, _) => {
        const timeslot = e.target.closest('.timeslot').timeslot
        const idx = state[scheduleId].findIndex(slot => Timeslot.equals(timeslot, slot))
        schedule.update(idx, new Timeslot(timeslot.hour, timeslot.quarter))
      }, '.timeslot .remove')

      // schedule drag interactions
      taskManager.querySelectorAll('.item').forEach(item => {
        item.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', e.target.id))
      })
      taskManager.querySelectorAll('.timeslot').forEach(quarterHour => quarterHour.onDropTask = (taskId) => {
        const task = state[taskManagerId].find(task => task.id === taskId)
        console.log('drop', taskId)
        for (let i = 0; i < state[scheduleId].length; i++) {
          const timeslot = state[scheduleId][i]
          if (quarterHour.equalsTimeslot(timeslot)) {
            timeslot.task = task
            timeslot.duration = parseInt(task.duration)
            schedule.update(i, timeslot)
            return
          }
        }
      })

      // load save schedule scroll position
      const scrollId = 'scrollPosition'
      schedule.scrollTop = localStorage.getItem(scrollId) ?? 0
      schedule.addEventListener('scroll', e => localStorage.setItem(scrollId, e.target.scrollTop))
    })
}
