import Component from './component.js'
import Timeslot from './timeslot.js'

export default class QuarterHour extends Component {
  constructor() {
    super(false)
    this.onDropTask = () => {}
  }

  initState() {
    this.addEventListener('dragover', e => e.preventDefault())
    this.addEventListener('drop', e => {
      e.preventDefault()
      this.onDropTask(e.dataTransfer.getData("text"))
    })
  }

  createState() {
    this.state = new Timeslot(
      parseInt(this.getAttribute('hour')), 
      parseInt(this.getAttribute('quarter')) 
    )
  }

  setState() {}

  renderedState() {
    // todo set the timeslot value here, since the id is a query and doesnt translate until rendered
    if (Timeslot.equals(this.state, Timeslot.now())) {
      this.highlightTimeslot()
    } else {
      const timeUntilStarts = this.state.date - Date.now()
      setTimeout(() => this.highlightTimeslot(), timeUntilStarts)
    }
  }

  highlightTimeslot() { // tested and working
    const elem = document.getElementById(this.state.timestr)
    if (!elem) return
    let timeRemaining = Timeslot.next(this.state).date - Date.now()
    elem.classList.add('now')
    setTimeout(() => elem.classList.remove('now'), timeRemaining)
  }

  equalsTimeslot(timeslot) {
    return this.state.hour === timeslot.hour && this.state.quarter === timeslot.quarter
  }

  static quarteredDay() {
    let quarters = []
    for (let hour = 0; hour < 24; hour++) {
      quarters = quarters.concat(QuarterHour.quarteredHour(hour))
    }
    return quarters
  }

  static quarteredHour(hour) {
    let quarters = []
    for (let quarter = 0; quarter < 4; quarter++) {
      quarters.push(new Timeslot(hour, quarter))
    }
    return quarters
  }
}