import Component from './component.js'

export default class ParticleElement extends Component {
  constructor(
    fps=24, 
    friendDistance=200,
    airFriction=0.2,
    wallForce=0.001, 
    maxAccel=1000,
    jitter=0.00001, 
    enemyJolt=500,
    friendlyJolt=0.000000012
  ) {
    super()
    this.updateInterval = 1000 / fps
    this.friendDistance = friendDistance
    this.airFriction = airFriction
    this.wallForce = wallForce
    this.maxAccel = maxAccel
    this.jitter = jitter
    this.enemyJolt = enemyJolt
    this.friendlyJolt = friendlyJolt
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
    this.state.velX = Math.min(this.maxAccel, Math.max(-this.maxAccel, this.state.velX))
    this.state.velY = Math.min(this.maxAccel, Math.max(-this.maxAccel, this.state.velY))
    this.state.x += this.state.velX
    this.state.y += this.state.velY
    this.collideScreen()
    this.style.left = `${this.state.x}px`
    this.style.top = `${this.state.y}px`
  }

  processPhysics() {
    this.updateBounds()
    const count = this.friends.length + this.enemies.length
    const step = 1 / count 
    // apply air friction
    const friction = 1 - this.airFriction
    this.state.velX *= friction
    this.state.velY *= friction
    // attract friends & repel enemies
    for (const other of this.enemies) this.attract(other, step * this.enemyJolt, -2)
    for (const other of this.friends) this.attract(other, step * this.friendlyJolt, 3, this.friendDistance)
    // add jitter
    this.state.velX += this.randomNormal() * this.jitter
    this.state.velY += this.randomNormal() * this.jitter
    // repel from screen
    this.repelWall(
      this.state.x - this.bounds.left,
      this.state.y - this.bounds.top,
      this.bounds.right - this.state.x,
      this.bounds.bottom - this.state.y,
      count
    )
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

  attract(other, mod=1, degree=1, minThreshold=0) {
    const dx = this.state.x - other.state.x 
    const dy = this.state.y - other.state.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    mod *= (minThreshold - distance) ** degree
    this.state.velX += dx * mod
    this.state.velY += dy * mod
  }

  repelWall(deltaLeft, deltaTop, deltaRight, deltaBottom, mod=1, degree=2) {
    mod *= this.wallForce
    // horizontal bounds
    if      (!deltaLeft)   this.state.velX =  this.maxAccel
    else if (!deltaRight)  this.state.velX = -this.maxAccel
    else { // apply force
      this.state.velX += mod / deltaLeft   ** degree
      this.state.velX -= mod / deltaRight  ** degree
    }
    // vertical bounds
    if      (!deltaTop)    this.state.velY =  this.maxAccel
    else if (!deltaBottom) this.state.velY = -this.maxAccel
    else { // apply force
      this.state.velY += mod / deltaTop    ** degree
      this.state.velY -= mod / deltaBottom ** degree
    }
  }

  collideScreen() {
    if      (this.state.x < this.bounds.left)   this.state.x = this.bounds.left+1
    else if (this.state.x > this.bounds.right)  this.state.x = this.bounds.right-1
    if      (this.state.y < this.bounds.top)    this.state.y = this.bounds.top+1
    else if (this.state.y > this.bounds.bottom) this.state.y = this.bounds.bottom-1
  }

  randomNormal() { return Math.random() * 2 - 1 }
}