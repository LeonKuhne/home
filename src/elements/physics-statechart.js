import Component from './component.js';

export default class PhysicsStatechart extends Component {
  constructor(fps=24) {
    super()
    this.updateInterval = 1000 / fps
  }

  // lifecycle

  initState() {
    this.nodeElements = {}
  }

  createState() {}
  setState() {}
  renderedState() {
    // TODO render the graph
    // this.state has format: [ {[name]: {parents: [], children: []}} ]
    console.log("todo")

    // create the node elements from the state
    for (const name of Object.keys(this.state)) {
      this.addNodeElement(name)
    }

    // tick simulation
    this.whileAlive(this.updateInterval, () => this.simulate())
  }

  destroyState() {}

  //
  // simulation

  simulate() {
    // while this element exists
    console.log("simulating")
  }

  // helpers

  addNodeElement(name) {
    const nodeElem = document.createElement('div')
    nodeElem.classList.add('node')
    nodeElem.textContent = name
    // center elem
    nodeElem.style.position = 'absolute'
    nodeElem.style.transform = 'translate(-50%, -50%)'
    this.appendChild(nodeElem)
    this.nodeElements[name] = nodeElem
  }
}