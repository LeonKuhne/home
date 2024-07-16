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
      elem.simulate(
        () => this.getBoundingClientRect(), 
        this.findConnected(node), // connected
        this.findAll(node),       // all others
      )
      // update all of the edge bounds
      elem.querySelectorAll('line-connector').forEach(connector => {
        connector.trackElements()
      })
    }
  }

  //
  // helpers

  findConnected(node) {
    return this.findParentRefs(node)
      .concat(this.findChildrenRefs(node))
  }

  findParentRefs(node) {
    return node.parents.map(id => this.nodeElem(id))
  }

  findChildrenRefs(node) { 
    return node.children.map(line => ({
      elem: this.nodeElem(line.childId),
      count: line.count,
    }))
  }

  findAll(node) {
    return this.state
      .filter(other => other.id !== node.id)
      .map(other => this.nodeElem(other.id))
  }

  // TODO might need to make name have spaces joined by dash
  nodeElem(id) { return this.querySelector(`#node-${id}`) }
}