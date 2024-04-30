export default class Component extends HTMLElement {
  static requiredProperties = ['id', 'getState', 'loadState']

  constructor(registerWithTemplate=true) { 
    super() 
    this.registerWithTemplate = registerWithTemplate
  }

  connectedCallback() { 
    this.requireProperties()
    this.key = this.id
    this.loadState()
    if (this.registerWithTemplate) this.register()
  }

  disconnectCallback() { if (this.registerWithTemplate) this.unregister() } 

  // update state and redraw
  render() { document.render({ [this.table]: this.getState() }) }

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

  register() { document.addState({ [this.key]: this.getState() }) }
  unregister() { document.removeState(this.key) }
}
