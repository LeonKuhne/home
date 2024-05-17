// TODO
// could probably extract out an RegisteredElement class that handles the registration
// also would be nice to make an AppElement instead of overriding the html element prototypes, and dumping all that shit in one file

export default class Component extends HTMLElement {

  //
  // Global Registration

  static requiredProperties = ['id', 'initState', 'createState', 'setState', 'renderedState', 'destroyState']
  static registrations = {} // [TAG-NAME]: [ ...{ app, instances } ]

  static getRegistrationKey(tagName) {return tagName.toUpperCase()}
  static registerWithApp(tagName, app) {
    const key = this.getRegistrationKey(tagName)
    if (!Component.registrations[key]) Component.registrations[key] = []
    Component.registrations[key].push({ app, instances: [] })
    customElements.define(tagName, this)
  }

  // Local Registration

  get registrationKey() { return Component.getRegistrationKey(this.tagName) }
  get registeredApps() { return Component.registrations[this.registrationKey] }
  get registeredInstances() { return Object.values(this.registeredApps).map(({instances}) => instances) }
  register() { for (let instances of this.registeredInstances) instances.push(this) }
  unregister() {
    for (let instances of this.registeredInstances) {
      instances.splice(instances.indexOf(this), 1)
    }
  }

  static renderLate(targetApp) {
    for (let instance of Component.appInstances(targetApp)) instance.renderedState()
  }

  constructor(registerWithTemplate=true) { 
    super() 
    this.registerWithTemplate = registerWithTemplate
  }

  connectedCallback() { 
    this.alive = true
    this.requireProperties()
    this.initState()
    this.register()
    for (let app of this.apps) {
      // fill data
      if (app.state.hasOwnProperty(this.id)) {
        this.state = app.state[this.id]
        this.setState()
      // new data
      } else this.createState()
    }
    this.updateTemplate(false)
  }

  disconnectedCallback() { 
    this.alive = false
    this.destroyState()
    if (this.registerWithTemplate) this.unregister() 
  } 

  // 
  // Inheritance Validation

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
  // TODO only rerender this component not the whole app
  updateTemplate(render=true) {
    for (let app of this.apps) {
      if (this.registerWithTemplate) app.addState(this.globalState())
      if (render) app.render()
    }
  }

  //
  // Busy Loops

  whileAlive(delay, callback) {
    if (!this.alive) return
    callback()
    setTimeout(() => this.whileAlive(delay, callback), delay)
  }

  //
  // Helpers

  get apps() { // get the apps this component belongs to
    const apps = []
    for (let { app, instances } of Component.registrations[this.tagName]) {
      if (instances.includes(this)) apps.push(app)
    }
    return apps
  }

  static appInstances(targetApp) {
    const allInstances = []
    for (let appInstances of Object.values(Component.registrations)) {
      for (let appInstance of appInstances) {
        if (targetApp === appInstance.app) allInstances.push(...appInstance.instances)
      }
    }
    return allInstances
  }
}