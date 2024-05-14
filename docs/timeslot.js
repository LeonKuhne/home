export default class Timeslot {
  constructor(hour, quarter) {
    this.hour = hour
    this.quarter = quarter
    this.task = null
    this.duration = 15
    this.update(new Date())
  }

  update(date) {
    date.setHours(this.hour, this.quarter * 15) 
    this.timestr = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: '2-digit' })
    this.time = date.getTime()
  }

  static now() {
    const date = new Date()
    const hour = date.getHours()
    const quarter = Math.floor(date.getMinutes() / 15)
    const timeslot = new Timeslot(hour, quarter)
    return timeslot
  }

  static equals(a, b) {
    return a.hour === b.hour && a.quarter === b.quarter
  }

  static next(timeslot) {
    let [hour, quarter] = [timeslot.hour, timeslot.quarter]
    if (timeslot.quarter !== 3) quarter += 1
    else { hour += 1; quarter = 0 }
    return new Timeslot(hour, quarter)
  } 
  
  static quarterInMS() { return 15 * 60 * 1000 }
}