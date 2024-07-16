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
    const nodes = []
    // setup nodes
    for (const node of this.state) {
      const elem = this.nodeElem(node.id)
      nodes.push(elem)
      elem.simulate(
        () => this.getBoundingClientRect(), 
        this.getConnectedElements(node),
        this.getOtherElements(node)
      )
      // update all of the edge bounds
      elem.querySelectorAll('line-connector').forEach(connector => {
        connector.trackElements()
      })
    }

    // update nodes
    const fps = 120
    const timeDamping = 1.015
    this.whileAlive(() => {
      for (const node of nodes) node.processPhysics()
      for (const node of nodes) node.updatePosition()
    }, 1000 / fps, timeDamping) // update less freq as time goes on
  }

  //
  // helpers

  getConnectedElements(node) {
    return node.children.map(child => child.childId)
      .concat(node.parents)
      .map(id => this.nodeElem(id))
      .filter(elem => node.id !== elem.id)
  }

  getOtherElements(node) {
    return this.state.filter(other => other.id !== node.id)
      .map(other => this.nodeElem(other.id))
  }

  // TODO might need to make name have spaces joined by dash
  nodeElem(id) { return this.querySelector(`#node-${id}`) }
}