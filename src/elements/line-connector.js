import Component from './component.js';

export default class LineConnector extends Component {
  constructor(fps=24) { 
    super(false) 
    this.updateInterval = 1000 / fps
  }

  // 
  // lifecycle

  initState() {
    this.path = this.querySelector('path.line-path')
    this.fromElem = this.nodeFromAttributeId('from')
    this.toElem = this.nodeFromAttributeId('to')
  }
  createState() {}
  setState() {}
  renderedState() {}
  destroyState() {}

  //
  // actions

  trackElements() { 
    this.whileAlive(this.updateInterval, () => this.updatePosition())
  }

  updateBounds(bounds) { this.bounds = bounds }

  //
  // helpers

  nodeFromAttributeId(attributeName) {
    return document.getElementById('node-' + this.getAttribute(attributeName))
  }

  nodePos(elem) {
    const rect = elem.getBoundingClientRect()
    // return center of element
    return { x: this.bounds.x - rect.x + rect.width / 2, y: this.bounds.y - rect.y + rect.height / 2 }
  }

  updatePosition() {
    const pos = this.nodePos(this.fromElem)
    const target = this.nodePos(this.toElem)
    console.log(`${pos.x},${pos.y} -> ${target.x},${target.y}`)
    this.path.setAttribute('d', `M${pos.x},${pos.y} L${target.x},${target.y}`)
  }
}