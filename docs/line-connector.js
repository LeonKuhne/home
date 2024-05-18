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
    const pos = {
      x: this.bounds.x - rect.x - rect.width / 2 - window.scrollX,
      y: this.bounds.y - rect.y - rect.height / 2 - window.scrollY
    }
    return pos
  }

  updatePosition() {
    const pos = this.nodePos(this.fromElem)
    const target = this.nodePos(this.toElem, true)
    // find target edge offset
    // if the x delta is greater than the y delta, add the rect_width
    // if the y delta is greater than the x delta, add the rect_height
    const delta = {
      x: pos.x - target.x,
      y: pos.y - target.y
    }
    console.log(`delta: ${delta.x},${delta.y}`)
    this.path.setAttribute('d', `M0,0 L${delta.x},${delta.y}`)
  }
}