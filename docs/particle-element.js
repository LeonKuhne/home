import Component from './component.js'

export default class ParticleElement extends Component {
  constructor(fps=24, reactDistance=100) {
    super()
    this.updateInterval = 1000 / fps
    this.reactDistance = reactDistance
  }

  //
  // lifecycle

  initState() {
    this.state = { x: this.randomNormal(), y: this.randomNormal() }
    this.name = this.querySelector('.name').textContent
  }
  createState() {}
  setState() {}
  renderedState() {}
  destroyState() {}

  // 
  // actions

  // note: particles update independently of each-other
  repel(...elements) { 
    this.strangerElements = elements 
    this.whileAlive(this.updateInterval, () => {
      this.repelStrangers()
      this.updatePosition()
    })
  }

  updateBounds(bounds) { 
    this.bounds = { 
      halfWidth: bounds.width / 2,
      halfHeight: bounds.height / 2
    }
  }

  //
  // helpers

  updatePosition() { 
    this.style.left = `${this.state.x}px`
    this.style.top = `${this.state.y}px`
    this.textContent = `${this.name}: ${this.state.x.toFixed(4)}, ${this.state.y.toFixed(4)}`
  }

  repelStrangers() {
    for (const other of this.strangerElements) {
      // repel the other particle-element
      const dx = this.state.x - other.state.x
      const dy = this.state.y - other.state.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      // move away from the other particle-element
      if (distance < this.reactDistance) {
        this.state.x += dx / distance
        this.state.y += dy / distance
        // check boundaries
        if (this.state.x < -this.bounds.halfWidth) this.state.x = -this.bounds.halfWidth
        else if (this.state.x > this.bounds.halfWidth) this.state.x = this.bounds.halfWidth
        if (this.state.y < -this.bounds.halfHeight) this.state.y = -this.bounds.halfHeight
        else if (this.state.y > this.bounds.halfHeight) this.state.y = this.bounds.halfHeight
      }
    }
  }

  randomNormal() { return Math.random() * 2 - 1 }
}