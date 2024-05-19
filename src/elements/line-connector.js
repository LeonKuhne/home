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

  //
  // helpers

  nodeFromAttributeId(attributeName) {
    return document.getElementById('node-' + this.getAttribute(attributeName))
  }

  nodePos(rect) {
    const pos = {
      x: rect.x - window.scrollX + rect.width / 2,
      y: rect.y - window.scrollY + rect.height / 2
    }
    return pos
  }

  nodeAnchor(elem) {
  }

  updatePosition() {
    const pos = this.nodePos(this.fromElem.getBoundingClientRect())
    const toRect = this.toElem.getBoundingClientRect()
    const target = this.nodePos(toRect)
    const delta = { x: target.x - pos.x, y: target.y - pos.y }
    const slope = delta.y / delta.x
    // compare the aspect ratio of the angle of the line and the angle of the elem
    const elemSlope = toRect.height / toRect.width
    const connectHorizontally = Math.abs(slope) < Math.abs(elemSlope)
    // fix anchor offset
    if (connectHorizontally) { // x is greater than y
      let offset = toRect.width / 2
      if (delta.x < 0) offset = -offset
      delta.x -= offset 
      delta.y = slope * delta.x 
    } else { // y is greater than x
      let offset = toRect.height/ 2
      if (delta.y < 0) offset = -offset
      delta.y -= offset
      delta.x = delta.y / slope 
    }
    this.path.setAttribute('d', `M0,0 L${delta.x},${delta.y}`)
  }
}