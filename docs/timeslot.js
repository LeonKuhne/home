export default class Timeslot {
  constructor(hour, quarter) {
    this.hour = hour
    this.quarter = quarter
    this.task = null
    this.duration = 15
  }

  get date() { 
    if (this._date) return this._date
    this._date = new Date()
    this._date.setHours(this.hour, this.quarter * 15) 
    return this._date
  }

  get iso() { 
    if (this._iso) return this._iso
    this._iso = this._date.toISOString()
    return this._iso
  }

  get timestr() {
    if (this._timestr) return this._timestr
    this._timestr = this.date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: '2-digit' })
    return this._timestr
  }

  assign(task, duration) {
    this.task = task
    this.duration = duration
  }

  equals(timeslot) {
    return this.hour === timeslot.hour && this.quarter === timeslot.quarter
  }
}