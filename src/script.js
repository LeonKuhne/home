import './util.js'
import './template.js'
import ListEntry from './list-entry.js'
import QuarterHour from './quarter-hour.js'
import App from './app.js'
import TaskManager from './task-manager.js'
import PhysicsStatechart from './physics-statechart.js'
import ParticleElement from './particle-element.js'
import LineConnector from './line-connector.js'
import Graph from './graph.js'

const taskManagerId = 'task-manager'
const scheduleId = 'calendar'
const statsId = 'stats'
const statGraphId = 'task-graph'
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

// TEMP render the physics statechart
const graph = new Graph(app.state[scheduleId].items
  .filter(item => item.task)
  .map(item => item.task.name))
// remove all attributes that start with node-
for (const key of Object.keys(app.state)) {
  if (key.startsWith('node-')) delete app.state[key]
}
app.state[statGraphId] = graph.asList()

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
      'stats-color': '#462',
    }
  }
}
app.addMissingState({ theme: defaultTheme() })

// Page Navigation
switch (params.get('page')) {
  case 'todo':
    app.addState({ title: "Todo", name: "Todo List" })
    app.onRender(_ => {
      const todoList = document.querySelector('#todo-list')
      todoList.collectItem(read => read('.add'))
      todoList.submitOnEnter('.add')
      todoList.removeOnClick('.remove')
    })
    break;
  default:
    app.addState({ title: tableName ? `Home | ${tableName}` : "Home" })
    app.define('quarter-hour', QuarterHour)
    app.define('physics-statechart', PhysicsStatechart)
    app.define('particle-element', ParticleElement)
    app.define('line-connector', LineConnector)
    app.addMissingState({[scheduleId]: { scrollTop: 0, items: QuarterHour.quarteredDay() }})
    app.addMissingState({[statsId]: []})
    app.addMissingState({[statGraphId]: []})
    app.onRender(_ => new TaskManager(baseTable, tableName, taskManagerId, scheduleId, statsId, app, welcomeMessages, defaultTheme))
}
