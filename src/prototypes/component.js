export default class Component extends HTMLElement {
  static requiredProperties = ['id', 'loadState']

  constructor(registerWithTemplate=true) { 
    super() 
    this.registerWithTemplate = registerWithTemplate
  }

  connectedCallback() { 
    this.requireProperties()
    this.globalState = { [this.id]: this.loadState() }
    if (this.registerWithTemplate) this.register()
  }

  disconnectCallback() { if (this.registerWithTemplate) this.unregister() } 

  // update state and redraw

  requireProperties() { 
    const missing = []
    for (let property of Component.requiredProperties) {
      const value = this[property]
      if (value === undefined || value === "") missing.push(property)
    }
    if (missing.length > 0) {
      throw new Error(`component ${this.tagName} is missing required properties: ${missing.join(', ')}`)
    }
  }

  //
  // Update Template

  register() { document.addState(this.globalState) }
  unregister() { document.removeState(this.id) }
  render() { document.render(this.globalState) }
}
