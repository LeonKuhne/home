export default class Component extends HTMLElement {
  static requiredProperties = ['id', 'getData', 'onLoad']

  constructor(registerWithTemplate=true) { 
    super() 
    this.registerWithTemplate = registerWithTemplate
  }

  connectedCallback() { 
    this.requireProperties()
    this.key = this.id
    this.onLoad()
    if (this.registerWithTemplate) this.register()
  }

  disconnectCallback() { if (this.registerWithTemplate) this.unregister() } 

  // update state and redraw
  render() { document.render({ [this.table]: this.getData() }) }

  requireProperties() { 
    const missing = []
    for (let property of Component.requiredProperties) {
      if (this[property] === undefined) missing.push(property)
    }
    if (missing.length > 0) {
      throw new Error(`component ${this.tagName} is missing required properties: ${missing.join(', ')}`)
    }
  }

  //
  // Register (with document template)

  register() { document.addState({ [this.key]: this.getData() }) }
  unregister() { document.removeState(this.key) }
}
