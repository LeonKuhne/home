import Timeslot from './timeslot.js'
//import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/+esm'
import Graph from './graph.js'

export default class Analytics {
  constructor(scheduleId, statsId, statGraphId, app) {
    this.scheduleId = scheduleId
    this.statsId = statsId
    this.statGraphId = statGraphId
    this.app = app
    this.history = this.app.state[statsId]
    this.schedule = this.app.state[scheduleId].items
    this.scheduleTasks = this.schedule.filter(item => item.task)
    this.saveHistory()
    this.setupAnalytics()
  }

  setupAnalytics() {
    this.completeHistory = [...this.history.filter(item => item.task), ...this.scheduleTasks]
    // custom graph
    //this.setupMermaidGraph()
    const graph = new Graph(
      this.completeHistory
        .filter(item => item.task)
        .map(item => item.task.name))
    //this.app.state[this.statGraphId] = graph.asList()
    document.getElementById(this.statGraphId).soloRender(graph.asList())
  }

  async setupMermaidGraph() {
    // render the mermaid graph
    if (this.completeHistory.length < 2) return
    try {
      let {svg} = await mermaid.render('mermaid', this.encodeScheduleToMermaidGraph(this.completeHistory))
      document.body.querySelector('.graph').innerHTML = svg
    } catch (e) {
      console.warn('Mermaid trembles')
    }
  }

  //
  // Helpers

  hashCode(str) {
    return str.split('').reduce((acc, char) => {
      const charCode = char.charCodeAt(0)
      return ((acc << 5) - acc) + charCode
    }, 0)
  }

  encodeMermaidLabel(hash, name) { return `${hash}[${name}]` }

  encodeScheduleToMermaidGraph(tasks) {
    let prev = tasks[0].task.name
    let prevHash = this.hashCode(prev)
    const names = {[prevHash]: `${prevHash}[${prev}]`}
    const connections = []
    for (let i = 1; i < tasks.length; i++) {
      const next = tasks[i].task.name
      const nextHash = this.hashCode(next)
      if (!(nextHash in names)) names[nextHash] = `${nextHash}[${next}]`
      connections.push(`${prevHash} --> ${nextHash}`)
      prev = next
      prevHash = nextHash
    }
    const code = ['graph TD', ...Object.values(names), ...connections]
    console.info(`Mermaid Graph:\n  ${code.join('\n  ')}`)
    return code.join('\n')
  }

  saveHistory() {
    if (this.schedule.length < 1) return
    // schedule is older than today
    if (this.schedule[0].time > new Date().setHours(0, 0, 0, 0)) return
    // update history
    this.app.state[this.statsId].push(...this.scheduleTasks)
    this.moveScheduleToToday()
    this.app.saveState()
  }

  moveScheduleToToday()  {
    for (let i = 0; i < this.schedule.length; i++) {
      Timeslot.update(this.schedule[i], new Date())
    }
  }
}