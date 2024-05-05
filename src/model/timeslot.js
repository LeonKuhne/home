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
}