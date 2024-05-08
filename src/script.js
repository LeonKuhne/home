import './util.js'
import './template.js'
import ListEntry from './list-entry.js'
import Task from './task.js'
import QuarterHour from './quarter-hour.js'
import Timeslot from './timeslot.js'
import App from './app.js'

const taskManagerId = 'task-manager'
const scheduleId = 'calendar'

const app = new App('#app')
app.define('list-entry', ListEntry)

//
// Read URL
const params = new URLSearchParams(window.location.search)
switch (params.get('page')) {

  //
  // Todo Page

  case 'todo':
    app.state.title = "Todo"
    app.onRender(_ => {
      const todoList = document.querySelector('#todo-list')
      todoList.collectItem(read => read('.add'))
      todoList.submitOnEnter('.add')
      todoList.removeOnClick('.remove')
    })
    break;

  //
  // Task Manager

  default:

    app.state.title = "Home"
    app.define('quarter-hour', QuarterHour)
    app.missingState({
      [scheduleId]: { scrollTop: 0, items: QuarterHour.quarteredDay() },
    })

    // TODO
    // save scale slider
    // get rid of state queries (check if unused)

    app.onRender(state => {
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
        const timeslot = e.target.closest('.timeslot').state
        const idx = state[scheduleId].items.findIndex(slot => Timeslot.equals(timeslot, slot))
        schedule.update(idx, new Timeslot(timeslot.hour, timeslot.quarter))
      }, '.timeslot .remove')

      // schedule drag interactions
      taskManager.querySelectorAll('.item').forEach(item => {
        item.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', e.target.id)
        })
      })
      taskManager.querySelectorAll('.timeslot').forEach(quarterHour => quarterHour.onDropTask = (taskId) => {
        const task = state[taskManagerId].items.find(task => task.id == taskId)
        console.log('drop', taskId)
        for (let i = 0; i < state[scheduleId].items.length; i++) {
          const timeslot = state[scheduleId].items[i]
          if (quarterHour.equalsTimeslot(timeslot)) {
            timeslot.task = task
            timeslot.duration = parseInt(task.duration)
            schedule.update(i, timeslot)
            return
          }
        }
      })

      // scale calendar elements
      const scheduleScale = taskManager.querySelector('.scale')
      function setScale(scale) {
        schedule.querySelectorAll('.timeslot').forEach(quarterHour => {
          quarterHour.style.height = `${scale}px`
        })
      }
      setScale(app.state.scale)
      scheduleScale.addEventListener('input', e => {
        let scale = parseFloat(e.target.value)
        const height = schedule.getBoundingClientRect().height
        const numQuarters = 24 * 4
        const maxZoom = 21
        scale = ((1 + (scale ** 2.5 * maxZoom)) * height) / numQuarters
        app.addState({ scale })
        setScale(scale)
      })
      scheduleScale.value = app.state.scale
    })
}
