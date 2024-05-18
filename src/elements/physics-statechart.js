import ListEntry from './list-entry.js'

export default class PhysicsStatechart extends ListEntry {
  constructor(tps=24) {
    super()
    this.updateInterval = 1000 / tps
    this.boundUpdateElements = []
  }

  //
  // lifecycle

  initState() {
    super.initState()
    this.addEventListener('resize', () => {
      this.updateBounds()
      for (const elem of this.boundUpdateElements) elem.updateBounds(bounds)
    })
  }

  renderedState() {
    super.renderedState()
    this.updateBounds()
    for (const node of this.state) {
      const elem = this.nodeElem(node.id)
      elem.updateBounds(this.bounds)
      elem.repel(...this.findStrangers(node))
      this.boundUpdateElements.push(elem)
      // update all of the edge bounds
      elem.querySelectorAll('line-connector').forEach(connector => {
        connector.updateBounds(this.bounds)
        connector.trackElements()
        this.boundUpdateElements.push(connector)
      })
    }
  }

  //
  // helpers

  // find all elements that arent you or your children
  findStrangers(node) {
    const strangers = []
    for (const {id, name} of this.state) {
      if (node.name === name || node.children.includes(name)) continue
      strangers.push(this.nodeElem(id))
    }
    return strangers
  }

  // TODO might need to make name have spaces joined by dash
  nodeElem(id) { return this.querySelector(`#node-${id}`) }

  updateBounds() {
    this.bounds = this.getBoundingClientRect()
  }
}