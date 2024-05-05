import Component from './component.js'
import Timeslot from './timeslot.js'

export default class QuarterHour extends Component {
  constructor() {
    super(false)
    this.onDropTask = () => {}
  }

  // TODO load saved from db
  loadState() {
    this.timeslot = new Timeslot(
      parseInt(this.getAttribute('hour')), 
      parseInt(this.getAttribute('quarter')) 
    )
    // listen for dropped tasks
    this.addEventListener('dragover', e => e.preventDefault())
    this.addEventListener('drop', e => {
      e.preventDefault()
      this.onDropTask(e.dataTransfer.getData("text"))
    })
    return this.timeslot
  }

  equalsTimeslot(timeslot) {
    return this.timeslot.hour === timeslot.hour && this.timeslot.quarter === timeslot.quarter
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