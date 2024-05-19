import Component from './component.js'

export default class ParticleElement extends Component {
  constructor(fps=24, reactDistance=200) {
    super()
    this.updateInterval = 1000 / fps
    this.reactDistance = reactDistance
  }

  //
  // lifecycle

  initState() {
    this.state = { x: this.randomNormal(), y: this.randomNormal() }
    this.nameElem = this.querySelector('.name')
    this.name = this.nameElem.textContent
  }
  createState() {}
  setState() {}
  renderedState() {}
  destroyState() {}

  // 
  // actions

  // note: particles update independently of each-other
  repel(containerBounds, ...elements) { 
    this.containerBounds = containerBounds
    this.strangerElements = elements 
    this.whileAlive(this.updateInterval, () => {
      this.repelStrangers()
      this.updatePosition()
    })
  }


  //
  // helpers

  updatePosition() { 
    this.style.left = `${this.state.x}px`
    this.style.top = `${this.state.y}px`
  }

  repelStrangers() {
    const rect = this.getBoundingClientRect()
    const bounds = this.containerBounds()
    const leftLimit   = -bounds.width  / 2 + rect.width  / 2
    const rightLimit  =  bounds.width  / 2 - rect.width  / 2
    const topLimit    = -bounds.height / 2 + rect.height / 2
    const bottomLimit =  bounds.height / 2 - rect.height / 2
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
        if      (this.state.x < leftLimit) this.state.x = leftLimit
        else if (this.state.x > rightLimit) this.state.x = rightLimit
        if      (this.state.y < topLimit) this.state.y = topLimit
        else if (this.state.y > bottomLimit) this.state.y = bottomLimit
      }
    }
  }

  randomNormal() { return Math.random() * 2 - 1 }
}