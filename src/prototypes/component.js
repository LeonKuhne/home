export default class Component extends HTMLElement {
  static requiredProperties = ['id', 'initState', 'createState', 'setState', 'renderedState']
  static registrations = {} // [tagName]: app

  static registerWithApp(tagName, app) {
    if (!Component.registrations[tagName]) Component.registrations[tagName] = []
    Component.registrations[tagName].push(app)
    customElements.define(tagName, this)
  }

  constructor(registerWithTemplate=true) { 
    super() 
    this.registerWithTemplate = registerWithTemplate
  }

  connectedCallback() { 
    this.requireProperties()
    this.initState()
    for (let app of this.apps) {
      if (!app.state.hasOwnProperty(this.id)) this.createState()
      else {
        this.state = app.state[this.id]
        this.setState()
      }
      if (this.registerWithTemplate) this.register(app)
      this.renderedState()
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

  globalState() { return { [this.id]: this.state } }
  register(app) { app.addState(this.globalState()) }
  unregister(app) { app.removeState(this.id) }
  // TODO only rerender this component not the whole app
  updateTemplate(render=true) {
    for (let app of this.apps) {
      if (this.registerWithTemplate) app.addState(this.globalState())
      if (render) app.render()
    }
  }

  //
  // Helpers

  get apps() { 
    return Component.registrations[this.tagName.toLowerCase()]
  }
}
