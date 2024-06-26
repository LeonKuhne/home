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
        this.findChildrenRefs(node), 
        this.findStrangers(node)
      )
      // update all of the edge bounds
      elem.querySelectorAll('line-connector').forEach(connector => {
        connector.trackElements()
      })
    }
  }

  //
  // helpers

  findChildrenRefs(node) { 
    return node.children.map(line => ({
      elem: this.nodeElem(line.childId),
      count: line.count,
    }))
  }

  findStrangers(node) {
    const others = []
    for (const {id, name} of this.state) {
      if (node.name === name 
        || node.children.find(line => id === line.childId)
        || node.parents.includes(id)
      ) continue
      others.push(this.nodeElem(id))
    }
    return others
  }

  // TODO might need to make name have spaces joined by dash
  nodeElem(id) { return this.querySelector(`#node-${id}`) }
}