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
  }

  renderedState() {
    super.renderedState()
    for (const node of this.state) {
      const elem = this.nodeElem(node.id)
      elem.simulate(() => this.getBoundingClientRect(), this.findChildren(node), this.findOthers(node))
      // update all of the edge bounds
      elem.querySelectorAll('line-connector').forEach(connector => {
        connector.trackElements()
      })
    }
  }

  //
  // helpers

  findChildren(node) { return node.children.map(node => this.nodeElem(node.childId)) }
  findOthers(node) {
    const others = []
    for (const {id, name} of this.state) {
      if (node.name === name) continue
      others.push(this.nodeElem(id))
    }
    return others
  }

  // TODO might need to make name have spaces joined by dash
  nodeElem(id) { return this.querySelector(`#node-${id}`) }
}