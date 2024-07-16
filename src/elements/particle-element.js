import Component from './component.js'

export default class ParticleElement extends Component {
  constructor(
    fps=24, 
    attractDistance=300,
    attractJolt=1.7, // connected has to be greater than other by a min threshold or else it doesnt sort
    attractSkew=5, // a value greater than one increases the connected distance range
    repelDistance=400,
    repelJolt=3,
    airFriction=0.5, // ie algo feedback
    wallForce=10, 
    maxAccel=5,
    jitter=0.1, 
  ) {
    super()
    this.updateInterval = 1000 / fps
    this.attractDistance = attractDistance
    this.attractJolt = attractJolt
    this.attractSkew = attractSkew
    this.repelDistance = repelDistance
    this.repelJolt = repelJolt
    this.airFriction = airFriction
    this.wallForce = wallForce
    this.maxAccel = maxAccel
    this.jitter = jitter
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
  simulate(containerBounds, connected, others) { 
    this.containerBounds = containerBounds
    this.updateBounds()
    this.state.x = (this.bounds.right - this.bounds.left) * Math.random()
    this.state.y = (this.bounds.bottom - this.bounds.top) * Math.random()
    this.connected = connected
    this.others = others
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
    // apply air friction
    const friction = 1 - this.airFriction
    this.state.velX *= friction
    this.state.velY *= friction
    // add jitter
    this.state.velX += this.randomNormal() * this.jitter
    this.state.velY += this.randomNormal() * this.jitter
    // repel from screen
    this.repelWall(
      this.bounds.left - this.state.x,
      this.bounds.top - this.state.y,
      this.bounds.right - this.state.x,
      this.bounds.bottom - this.state.y,
      x => -Math.sqrt(Math.abs(x)/this.repelDistance) * this.wallForce
    )
    // interact particles
    this.interact(this.others.length)
  }

  //
  // interacting forces 

  interact(totalCount) {
    if (!totalCount) return
    const step = 1 / totalCount
    this.repelAll(step)
    if (!this.connected.Length) return
    this.attractConnected(step)
  }

  repelAll(step) {
    const mod = this.repelJolt * step
    for (const other of this.others) {
      this.attract(other,
        //x => mod * 2 / ((x/this.repelDistance) + 1) - 1
        x => -mod * (this.repelDistance * this.repelDistance) / (x * x)
      )
    }
  }

  attractConnected(step) {
    const mod = this.attractJolt * step * others.count
    for (const connected of this.connected) {
      this.attract(connected,
        //x => mod * Math.tanh((1 - x/this.attractDistance) / this.attractSkew), 
        x => mod * (x * x) / this.attractDistance
      )
    }
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

  attract(other, mod=x=>x) {
    let dx = this.state.x - other.state.x 
    let dy = this.state.y - other.state.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const alt = mod(distance)
    dx *= alt
    dy *= alt
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

  // 
  // util

  randomNormal() { return Math.random() * 2 - 1 }
}