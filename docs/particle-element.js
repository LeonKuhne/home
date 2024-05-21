import Component from './component.js'

export default class ParticleElement extends Component {
  constructor(
    fps=24, 
    friendlyDistance=300,
    enemyDistance=400,
    airFriction=0.5, // ie algo feedback
    wallForce=10, 
    maxAccel=5,
    jitter=0.1, 
    enemyJolt=1,
    friendlyJolt=1.7, // friendly has to be greater than enemy by a min threshold or else it doesnt sort
    friendlySkew=5, // a value greater than one increases the friendly distance range
  ) {
    super()
    this.updateInterval = 1000 / fps
    this.friendlyDistance = friendlyDistance
    this.enemyDistance = enemyDistance
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
    this.state = { x: 0, y: 0, velX: 0, velY: 0 }
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
  simulate(containerBounds, friendRefs, enemies) { 
    this.containerBounds = containerBounds
    this.updateBounds()
    this.state.x = (this.bounds.right - this.bounds.left) * Math.random()
    this.state.y = (this.bounds.bottom - this.bounds.top) * Math.random()
    this.friendRefs = friendRefs
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
    const enemyCount = this.enemies.length
    const friendlyCount = this.friendRefs
      .map(ref => ref.count)
      .reduce((count, sum) => count + sum)
    const enemyStep = 1 / enemyCount
    const friendlyStep = 1 / friendlyCount
    const step = 1 / (friendlyCount + enemyCount)
    // apply air friction
    const friction = 1 - this.airFriction
    this.state.velX *= friction
    this.state.velY *= friction
    // repel enemies
    for (const other of this.enemies) {
      this.attract(
        other,
        this.enemyJolt * step,
        x => 2 / ((x/this.enemyDistance) + 1) - 1
      )
    }
    // attract friends
    for (const otherRef of this.friendRefs) {
      this.attract(
        otherRef.elem,
        this.friendlyJolt * step * otherRef.count,
        x => Math.tanh((1 - x/this.friendlyDistance) / this.friendlySkew), 
      )
    }
    // add jitter
    this.state.velX += this.randomNormal() * this.jitter
    this.state.velY += this.randomNormal() * this.jitter
    // repel from screen
    this.repelWall(
      this.bounds.left - this.state.x,
      this.bounds.top - this.state.y,
      this.bounds.right - this.state.x,
      this.bounds.bottom - this.state.y,
      x => -Math.sqrt(Math.abs(x)/this.enemyDistance) * this.wallForce
    )
  }

  updateBounds() {
    const bounds = this.containerBounds()
    const rect = this.getBoundingClientRect()
    const [halfRectWidth, halfRectHeight] = [rect.width / 2, rect.height / 2]
    this.bounds = {
      left: halfRectWidth,
      top: halfRectHeight,
      right:  bounds.width - halfRectWidth,
      bottom: bounds.height - halfRectHeight,
    }
  }

  attract(other, mod=1, process=x=>x) {
    let dx = this.state.x - other.state.x 
    let dy = this.state.y - other.state.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    mod *= process(distance)
    dx *= mod
    dy *= mod
    // attract self
    this.state.velX += dx
    this.state.velY += dy
    // attract other
    other.state.velX -= dx
    other.state.velY -= dx
  }

  repelWall(deltaLeft, deltaTop, deltaRight, deltaBottom, process=x=>x) {
    // horizontal bounds
    if      (!deltaLeft)   this.state.velX =  this.maxAccel
    else if (!deltaRight)  this.state.velX = -this.maxAccel
    else { // apply force
      this.state.velX += process(deltaLeft)
      this.state.velX -= process(deltaRight)
    }
    // vertical bounds
    if      (!deltaTop)    this.state.velY =  this.maxAccel
    else if (!deltaBottom) this.state.velY = -this.maxAccel
    else { // apply force
      this.state.velY += process(deltaTop)
      this.state.velY -= process(deltaBottom)
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