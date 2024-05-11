import './util.js'
import './template.js'
import ListEntry from './list-entry.js'
import Task from './task.js'
import QuarterHour from './quarter-hour.js'
import Timeslot from './timeslot.js'
import App from './app.js'

const taskManagerId = 'task-manager'
const scheduleId = 'calendar'
const baseTable = '#app-state'
const welcomeMessages = [
  "Welcome, brave soul!",
  "Greetings, fellow coder!",
  "Step right in, it's cozy!",
  "Enter the fun zone!",
  "Welcome aboard!",
  "Hello, digital friend!",
  "Ready, set, code!",
  "You're here! Yay!",
  "Welcome to the party!",
  "Let's code together!",
  "Greetings, traveler!",
  "Welcome, explorer!",
  "Come on in!",
  "Coding adventure awaits!",
  "You made it!",
  "Welcome, friend!",
  "Hello, world!",
  "Greetings, newcomer!",
  "Join the fun!",
  "Welcome home!",
  "Coding starts now!",
  "Enter the matrix!",
  "Hello, geek!",
  "Welcome to cyberspace!",
  "Happy coding!",
  "You belong here!",
  "Welcome to the web!",
  "The code is strong!",
  "Welcome, fellow geek!",
  "Coding happiness begins!",
  "Try typing 'randomize'!"
];

//
// Read URL
const params = new URLSearchParams(window.location.search)

// Create App
const tableName = params.has('name') ? params.get('name') : undefined
const app = new App('#app', tableName)
app.addState({ name: tableName ?? 'Tasks', modal: 'hide' })
app.define('list-entry', ListEntry)

// load default theme
const defaultTheme = () => {
  // use root theme if exists
  if (tableName) { 
    const state = localStorage.getItem(baseTable)
    if (state) {
      const theme = JSON.parse(state).theme
      if (theme) return theme
    }
  }
  // use default theme if root 
  return { 
      bright: {
      'primary-color': '#fee',
      'secondary-color': '#000',
      'remove-color': 'red',
    }, dark: {
      'shadow-color': '#433',
      'schedule-color': '#557',
      'highlight-color': '#756',
    }
  }
}
app.addMissingState({ theme: defaultTheme() })


// Select Page
switch (params.get('page')) {

  //
  // Todo Page

  case 'todo':
    app.addState({ title: "Todo", name: "Todo List" })
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
    app.addState({ title: tableName ? `Home | ${tableName}` : "Home" })
    app.define('quarter-hour', QuarterHour)
    app.addMissingState({
      [scheduleId]: { scrollTop: 0, items: QuarterHour.quarteredDay() },
    })

    app.onRender(state => {
      const taskManager = document.getElementById(taskManagerId)
      const schedule = document.getElementById(scheduleId)
      const taskNameInput = taskManager.querySelector('#task-name')

      // randomize the welcome message
      taskNameInput.placeholder = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]

      // load saved color theme
      for (const settings of Object.values(state.theme)) {
        for (const key in settings) {
          document.documentElement.style.setProperty(`--${key}`, settings[key])
        }
      }

      const randomizeTheme = (contrastMin, contrastMax) => {
        const toRange = (x, min, max) => min + x * (max - min)
        let contrast = toRange((toRange(Math.random(), -1, 1) ** 2), 0, 1) // apply parabolic curve centered at .5
        contrast = toRange(contrast, contrastMin, contrastMax)
        const saturation = toRange(Math.random(), .2, .5)
        app.randomizeTheme(contrast, saturation)
        const elem = document.querySelector('#task-name')
        elem.value = taskNameInput.value
        elem.placeholder = "Type 'reset' to clear theme!"
      }

      // task-manager interactions
      taskManager.collectItem(read => {
        const name = read('#task-name')
        switch (name) {
          case 'randomize bright':
            randomizeTheme(.6, .9)
            break
          case 'randomize dark':
            randomizeTheme(.1, .4)
            break
          case 'randomize':
            randomizeTheme(.1, .9)
            break;
          case 'reset':
            app.state.theme = defaultTheme()
            app.render()
            break;
          case null:
            break
          default:
            return new Task(name, {
              id: new String(name.hashCode()),
              createdAt: new Date().toISOString(),
            })
        }
        return null
      })
      taskManager.submitOnEnter('#task-name')
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

      // select space
      document.querySelector('.app-name').addEventListener('click', _ => {
        // show available
        const keys = [{name: 'Home', url: '/', table: baseTable}]
        for (let i = 0; i < localStorage.length; i++) {
          let key = localStorage.key(i)
          if (key.endsWith('-state')) continue
          keys.push({name: key, url: '?name=' + key, table: key})
        }
        app.addState({ modal: "show", spaces: keys })
        app.render()
      })

      // modal interactions
      const modal = document.querySelector('.modal')
      if (!modal) return

      // create space
      modal.querySelector('.create').addEventListener('keydown', e => {
        if (e.key !== 'Enter') return
        const spaceName = e.target.value
        if (!spaceName) return
        // navigate to new space
        location.href = `?name=${spaceName}`
      })

      // delete space
      modal.querySelectorAll('.space .remove').forEach(remove => {
        const spaceName = remove.getAttribute('name')
        remove.addEventListener('click', _ => {
          if (confirm(`Are you sure you want to delete space '${spaceName}'?\nWARNING: This will delete all of its data.`)) {
            localStorage.removeItem(spaceName)
            if (spaceName === tableName) location.href = '/' 
          }
        })
      })

      // close modal with escape key
      document.body.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return
        app.addState({ modal: 'hide' })
        app.render()
      })

      // close modal with exit button
      modal.querySelector('.modal .close').addEventListener('click', _ => {
        app.addState({ modal: 'hide' })
        app.render()
      })

      // close modal on click background
      document.body.querySelector('.modal-bg').addEventListener('click', e => {
        app.addState({ modal: 'hide' })
        app.render()
      })
    })
}
