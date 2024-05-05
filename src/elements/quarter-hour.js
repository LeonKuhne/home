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
    const currentTime = Timeslot.now() 
    if (Timeslot.equals(this.state, currentTime)) {
      document.getElementById(currentTime.timestr).classList.add('now')
    }
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