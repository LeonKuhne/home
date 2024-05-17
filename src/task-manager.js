import Task from './task.js'
import Schedule from './schedule.js'
import SpaceNavigation from './space-navigation.js'
import Analytics from './analytics.js'

export default class TaskManager {

  constructor(baseTable, tableName, taskManagerId, scheduleId, statsId, app, welcomeMessages=[], defaultTheme={}) {
    this.taskManagerId = taskManagerId
    this.scheduleId = scheduleId
    this.app = app
    this.welcomeMessages = welcomeMessages
    this.defaultTheme = defaultTheme
    // elements
    this.taskManager = document.getElementById(taskManagerId)
    this.taskNameInput = this.taskManager.querySelector('#task-name')
    // setup
    this.randomizeWelcomeMessage()
    this.loadColorTheme()
    this.setupTaskList()
    new Schedule(taskManagerId, scheduleId, app)
    new SpaceNavigation(baseTable, tableName, app)
    new Analytics(scheduleId, statsId, app)
    this.taskNameInput.focus()
  }

  randomizeWelcomeMessage() {
    this.taskNameInput.placeholder = this.welcomeMessages[Math.floor(Math.random() * this.welcomeMessages.length)]
  }

  loadColorTheme() {
    // load saved color theme
    for (const settings of Object.values(this.app.state.theme)) {
      for (const key in settings) {
        document.documentElement.style.setProperty(`--${key}`, settings[key])
      }
    }
  }

  setupTaskList() {
    this.taskManager.collectItem(read => {
      const name = read('#task-name')
      switch (name) {
        case 'randomize bright':
          this.randomizeTheme(.6, .9)
          break
        case 'randomize dark':
          this.randomizeTheme(.1, .4)
          break
        case 'randomize':
          this.randomizeTheme(.1, .9)
          break;
        case 'reset':
          this.app.state.theme = this.defaultTheme()
          this.app.render()
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
    this.taskManager.submitOnEnter('#task-name')
    this.taskManager.removeOnClick('.task-list .remove')
  }


  // 
  // helpers

  randomizeTheme(contrastMin, contrastMax) {
    this.app.randomizeTheme(contrastMin, contrastMax)
    const elem = document.querySelector('#task-name')
    elem.value = this.taskNameInput.value
    elem.placeholder = "Type 'reset' to clear theme!"
  }
}