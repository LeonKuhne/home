import Component from './component.js'

export default class ParticleElement extends Component {
  constructor(
    attractSkew=5, // a value greater than one increases the connected distance range
    feedbackDamping=0.995,
    coolFactor=0.9,
    wallForce=1000, 
    maxAccel=50000,
  ) {
    super()
    this.attractSkew = attractSkew
    this.feedbackDamping = feedbackDamping
    this.coolFactor = coolFactor
    this.wallForce = wallForce
    this.maxAccel = maxAccel

    this.optimalDistance = 150;
    this.repulsiveStrength = 500;
    this.attractiveStrength = 0.4;
  }

  //
  // lifecycle

  initState() {
    this.state = { x: 0, y: 0, velX: 0, velY: 0, temperature: 1 }
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
    this.state.temperature = 1
    this.connected = connected
    this.others = others
  }

  //
  // helpers

  processPhysics() {
    this.updateBounds()
    // air resistance 
    //this.state.velX *= this.feedbackDamping
    //this.state.velY *= this.feedbackDamping
    // interact particles
    this.interact()
    // repel from screen
    /*
    this.repelWall(
      this.bounds.left - this.state.x,
      this.bounds.top - this.state.y,
      this.bounds.right - this.state.x,
      this.bounds.bottom - this.state.y,
      x => 1 / x ** 2 * this.optimalDistance * this.wallForce
    )
    */
  }

  updatePosition() { 
    this.state.temperature *= this.coolFactor
    //this.state.velX = Math.min(this.maxAccel, Math.max(-this.maxAccel, this.state.velX))
    //this.state.velY = Math.min(this.maxAccel, Math.max(-this.maxAccel, this.state.velY))
    this.state.x += this.state.velX * this.state.temperature
    this.state.y += this.state.velY * this.state.temperature
    this.collideScreen()
    this.style.left = `${this.state.x}px`
    this.style.top = `${this.state.y}px`
  }


  //
  // interacting forces 

  interact() {
    if (!this.others.length) return
    const step = 1 / this.others.length
    this.repelAll(step)
    if (!this.connected.length) return
    this.attractConnected(step)
  }

  repelAll(step) {
    const repulsiveForce = this.repulsiveStrength //* step
    for (const other of this.others) {
      this.attract(other,
        distance => -this.optimalDistance * this.optimalDistance / (distance ** 2) * repulsiveForce
      )
    }
  }
  
  attractConnected(step) {
    const attractiveForce = this.attractiveStrength //* step
    for (const connected of this.connected) {
      this.attract(connected,
        distance => (distance * distance) / this.optimalDistance * attractiveForce
      )
    }
  }

  attract(other, mod=x=>x) {
    let dx = this.state.x - other.state.x 
    let dy = this.state.y - other.state.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const force = mod(distance)
    dx *= force
    dy *= force
    // attract self
    this.state.velX -= dx
    this.state.velY -= dy
    // attract other
    other.state.velX += dx
    other.state.velY += dy
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