export default class Timeslot {
  constructor(hour, quarter) {
    this.hour = hour
    this.quarter = quarter
    this.task = null
    this.duration = 15
    const date = new Date()
    date.setHours(this.hour, this.quarter * 15) 
    this.timestr = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: '2-digit' })
  }

  static now() {
    const date = new Date()
    const hour = date.getHours()
    const quarter = Math.floor(date.getMinutes() / 15)
    return new Timeslot(hour, quarter)
  }

  static equals(a, b) {
    return a.hour === b.hour && a.quarter === b.quarter
  }
}