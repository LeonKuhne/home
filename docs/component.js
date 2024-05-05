export default class Component extends HTMLElement {
  static requiredProperties = ['id', 'initState', 'getState', 'loadState', 'setState']

  constructor(registerWithTemplate=true) { 
    super() 
    this.registerWithTemplate = registerWithTemplate
  }

  connectedCallback() { 
    this.requireProperties()
    // use state if already loaded, otherwise load new
    const completeState = document.getState()
    let state = null
    this.initState()
    if (completeState.hasOwnProperty(this.id)) {
      state = completeState[this.id]
    } else state = this.loadState()
    this.setState(state)
    if (this.registerWithTemplate) {
      this.register(state)
    }
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

  register(state) { document.addState({ [this.id]: state }) }
  unregister() { document.removeState(this.id) }
  // TODO only update the state of this component, ie this.render()
  render(state) {
    if (this.registerWithTemplate) {
      document.render({ [this.id]: this.getState() }) 
      return
    }
    document.render()
  }
}
