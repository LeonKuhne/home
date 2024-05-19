import Component from './component.js'

export default class ParticleElement extends Component {
  constructor(fps=24, jitter=0.001, attractForce=0.01, airFriction=0.1) {
    super()
    this.updateInterval = 1000 / fps
    this.jitter = jitter
    this.attractForce = attractForce
    this.airFriction = airFriction
  }

  //
  // lifecycle

  initState() {
    this.state = { 
      x: this.randomNormal(), 
      y: this.randomNormal(),
      velX: 0, 
      velY: 0
    }
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
    this.state.x += this.state.velX
    this.state.y += this.state.velY
    this.collideScreen()
    this.style.left = `${this.state.x}px`
    this.style.top = `${this.state.y}px`
  }

  processPhysics() {
    this.updateBounds()
    // apply air friction
    const friction = 1 - this.airFriction
    this.state.velX *= friction
    this.state.velY *= friction
    // repel enemies
    for (const other of this.enemies) {
      this.attract(other, -2)
    }
    // attract friends
    for (const other of this.friends) {
      this.attract(other)
    }
    // add jitter
    this.state.velX += this.randomNormal() * this.jitter
    this.state.velY += this.randomNormal() * this.jitter
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
    mod *= -this.attractForce / distance
    this.state.velX += dx * mod
    this.state.velY += dy * mod
  }

  collideScreen() {
    if      (this.state.x < this.bounds.left)   this.state.x = this.bounds.left
    else if (this.state.x > this.bounds.right)  this.state.x = this.bounds.right
    if      (this.state.y < this.bounds.top)    this.state.y = this.bounds.top
    else if (this.state.y > this.bounds.bottom) this.state.y = this.bounds.bottom
  }

  randomNormal() { return Math.random() * 2 - 1 }
}