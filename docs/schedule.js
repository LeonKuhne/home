import Timeslot from './timeslot.js'

export default class Schedule {
  constructor(taskManagerId, scheduleId, app) {
    this.taskManagerId = taskManagerId
    this.scheduleId = scheduleId
    this.app = app
    // elements
    this.taskManager = document.getElementById(taskManagerId)
    this.schedule = document.getElementById(scheduleId)
    this.scheduleScale = this.taskManager.querySelector('.scale')
    // setup
    this.setupScheduleRemove()
    this.setupTaskDragMetadata()
    this.setupScheduleDropTask()
    this.setupScheduleZoom()
  }

  setupScheduleRemove() {
    this.schedule.onClick((e, _) => {
      const timeslot = e.target.closest('.timeslot').state
      const idx = this.app.state[this.scheduleId].items.findIndex(slot => Timeslot.equals(timeslot, slot))
      this.schedule.update(idx, new Timeslot(timeslot.hour, timeslot.quarter))
    }, '.timeslot .remove')
  }

  setupTaskDragMetadata() {
    this.taskManager.querySelectorAll('.item').forEach(item => {
      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', e.target.id)
      })
    })
  }

  setupScheduleDropTask() {
    this.taskManager.querySelectorAll('.timeslot').forEach(quarterHour => quarterHour.onDropTask = (taskId) => {
      const task = this.app.state[this.taskManagerId].items.find(task => task.id == taskId)
      for (let i = 0; i < this.app.state[this.scheduleId].items.length; i++) {
        const timeslot = this.app.state[this.scheduleId].items[i]
        if (quarterHour.equalsTimeslot(timeslot)) {
          timeslot.task = task
          this.schedule.update(i, timeslot)
          return
        }
      }
    })
  }

  setupScheduleZoom() {
    this.magnifySchedule(this.app.state.scale)
    this.scheduleScale.addEventListener('input', e => {
      let scale = parseFloat(e.target.value)
      const height = this.schedule.getBoundingClientRect().height
      const numQuarters = 24 * 4
      const maxZoom = 21
      scale = ((1 + (scale ** 2.5 * maxZoom)) * height) / numQuarters
      this.app.addState({ scale })
      this.magnifySchedule(scale)
    })
    this.scheduleScale.value = this.app.state.scale
  }


  //
  // helpers

  magnifySchedule(scale) {
    this.schedule.querySelectorAll('.timeslot').forEach(quarterHour => {
      quarterHour.style.height = `${scale}px`
    })
  }
}