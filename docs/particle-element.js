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
  simulate(containerBounds, friends, enemies) { 
    this.containerBounds = containerBounds
    this.friends = friends
    this.enemies = enemies
    this.whileAlive(this.updateInterval, () => {
      this.processPhysics()
      this.updatePosition()
    })
  }


  //
  // helpers

  updatePosition() { 
    this.style.left = `${this.state.x}px`
    this.style.top = `${this.state.y}px`
  }

  processPhysics() {
    this.updateBounds()
    // repel enemies
    for (const other of this.enemies) {
      this.attract(other, -5)
    }
    // attract friends
    for (const other of this.friends) {
      this.attract(other)
    }
  }

  updateBounds() {
    const bounds = this.containerBounds()
    const rect = this.getBoundingClientRect()
    const [halfRectWidth, halfRectHeight] = [rect.width / 2, rect.height / 2]
    const [halfBoundsWidth, halfBoundsHeight] = [bounds.width / 2, bounds.height / 2]
    this.bounds = {
      left:  -halfBoundsWidth  + halfRectWidth,
      right:  halfBoundsWidth  - halfRectWidth,
      top:   -halfBoundsHeight + halfRectHeight,
      bottom: halfBoundsHeight - halfRectHeight,
    }
  }

  attract(other, mod=1) {
    this.move(
      this.state.x - other.state.x, 
      this.state.y - other.state.y, 
      mod
    )
  }
  move(dx, dy, mod=1) {
    let distance = Math.sqrt(dx * dx + dy * dy)
    // move away from the other particle-element
    if (distance < this.reactDistance) {
      distance /= -mod
      this.state.x += dx / distance
      this.state.y += dy / distance
      this.collideScreen()
    }
  }

  collideScreen() {
    if      (this.state.x < this.bounds.left)   this.state.x = this.bounds.left
    else if (this.state.x > this.bounds.right)  this.state.x = this.bounds.right
    if      (this.state.y < this.bounds.top)    this.state.y = this.bounds.top
    else if (this.state.y > this.bounds.bottom) this.state.y = this.bounds.bottom
  }

  randomNormal() { return Math.random() * 2 - 1 }
}