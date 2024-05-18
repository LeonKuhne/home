import Query from './query.js'
import Component from './component.js'
import Theme from './theme.js'

export default class App {
  constructor(query, table=null) {
    this.root = document.querySelector(query)
    this.renderCallbacks = []
    this.template = this.root.innerHTML
    this.root.innerHTML = ''
    this.name = `${query}-app`
    this.table = table ?? `${query}-state`
    this.state = JSON.parse(localStorage.getItem(this.table)) || {}
    document.addEventListener('DOMContentLoaded', _ => this.render())
  }

  //
  // Components

  define(tagName, componentClass) { componentClass.registerWithApp(tagName, this) }

  //
  // State

  addMissingState(state) { 
    this.state = {...state, ...this.state} 
    this.saveState()
  }

  addState(state) {
    this.state = {...this.state, ...state}
    this.saveState()
  }

  removeState(key) { 
    delete this.state[key] 
    this.saveState()
  }

  saveState() { localStorage.setItem(this.table, JSON.stringify(this.state)) }

  //
  // Render

  render() {
    console.info(`${this.name} rendering`)
    const focusedElementId = document.activeElement?.id
    this.root.innerHTML = this.applyVars()
    // update focus
    if (focusedElementId) this.root.querySelector('#'+focusedElementId)?.focus()
    // render callbacks
    for (let callback of this.renderCallbacks) callback(this.state)
    // render components
    Component.renderLate(this)
  }

  applyVars() {
    const tempRoot = document.createElement('div')
    tempRoot.innerHTML = this.template
    while (this.applyVarIteration(tempRoot)) {}
    return tempRoot.innerHTML
  }

  applyVarIteration(tempRoot) {
    let hasChanged = false
    // .for
    for (let elem of tempRoot.querySelectorAll('.for')) {
      hasChanged = this.iterate(elem) || hasChanged
    }
    console.log("for changed it", hasChanged)
    // .if
    for (let elem of tempRoot.querySelectorAll('.if')) {
      hasChanged = this.applyVisibility(elem) || hasChanged
    }
    console.log("if changed it", hasChanged)
    // $var
    hasChanged = this.fill(tempRoot)
    console.log("fill changed it", hasChanged)
    return hasChanged
  }

  onRender(callback) { this.renderCallbacks.push(callback) }

  //
  // Fill Queries

  fill(elem) {
    let html = elem.innerHTML
    let hasChanged = false
    Object.keys(this.state).forEach(key => {
      html = html.replace(new RegExp(`\\$${key}[^!=\\s|\\<|\\"]*`, 'g'), (match) => {
        const fillValue = new Query(match).read(this.state)
        if (typeof fillValue === 'object') return match // dont fill objects only raw values
        if (!hasChanged) hasChanged = true
        return fillValue
      })
    })
    if (hasChanged) elem.innerHTML = html
    return hasChanged
  }

  //
  // Iterables
  //
  // usage
  //   <elem class="for" list="$query" as="item">[repeat content]</elem>
  // 
  // TODO can .for and .if be made into modules?

  iterate(elem) {
    // retrieve items
    const attrName = elem.popAttribute('list')
    const query = new Query(attrName)
    if (!query.isValid(this.state)) { console.warn(`template failed iterating ${attrName}: missing from state`); return false }
    const items = query.read(this.state)
    const varName = elem.getAttribute('as') ?? 'item'
    // repeat contents
    const children = elem.children
    let html = ""
    for (let i=0; i<items.length; i++) {
      for (let child of children) {
        html += this.replaceVariable(child.outerHTML, varName, query.str+'['+i+']')
      }
    }
    elem.innerHTML = html
    return true
  }

  //
  // Conditionals
  // 
  // usage
  //   <elem class="if" show="show" hide="hide" equals="equals">[content]</elem>

  // @returns true if equals attribute value matches attribute value
  // @returns null if equals attribute doesnt exist
  equalsQuery(elem, query) {
    if (!query.isValid(this.state)) {
      console.warn(`template failed setting visibility for ${query.str}: missing from state`) 
      return false
    }
    // compare to equals attribute
    return this.isValueEqual(elem, x => x == query.read(this.state))
  }

  // @returns true if equals attribute matches value
  // @returns null if equals attribute doesnt exist
  isValueEqual(elem, equals) {
    if (!elem.hasAttribute("equals")) return null 
    return equals(new Query(elem.getAttribute("equals")).read(this.state))
  }

  //
  // Custom Attributes

  applyShow(elem) { return this.setVisibleOnAttribute(elem, "show", true) }
  applyHide(elem) { return this.setVisibleOnAttribute(elem, "hide", false) }
  applyVisibility(elem) {
    let hasChanged = this.applyShow(elem)
    if (!hasChanged) hasChanged = this.applyHide(elem)
    if (elem.hasAttribute("equals")) elem.removeAttribute("equals") // cleanup
    return hasChanged
  }

  //
  // Helpers

  replaceVariable(content, key, value) {
    return content.replace(new RegExp("\\$"+key, 'g'), value)
  }

  setVisibleOnAttribute(elem, attrName, valueMeansVisible=true) {
    const query = elem.popAttributeQuery(attrName)
    if (!query || query.isNull()) return false
    const elseElem = elem.nextElementSibling?.classList.contains('else') ? elem.nextElementSibling : null
    // matches equals attribute
    const matchesEquals = this.equalsQuery(elem, query) ?? query.read(this.state) != null
    // set visibility
    if (matchesEquals !== valueMeansVisible) elem.innerHTML = ""
    else if (elseElem) elseElem.innerHTML = ""
    return true
  }


  // Helpers (extrenal)

  randomizeTheme(contrastMin, contrastMax) {
    const toRange = (x, min, max) => min + x * (max - min)
    let contrast = toRange((toRange(Math.random(), -1, 1) ** 2), 0, 1) // apply parabolic curve centered at .5
    contrast = toRange(contrast, contrastMin, contrastMax)
    const saturation = toRange(Math.random(), .2, .5)
    this.randomizeTheme(contrast, saturation)
  }

  // pick a random theme using hue stepping
  randomizeTheme(contrast=.25, saturation=1) {
    if (!this.state.theme) throw new Error("randomizeTheme: missing theme in state")
    // pick a random hue and shift colors over it
    const hue = Math.random() * 360
    const brights = Object.keys(this.state.theme.bright)
    const darks = Object.keys(this.state.theme.dark)
    const step = 360 / (brights.length + darks.length)
    // color lights & darks
    Theme.randomizeBrightsAndDarks(this.state.theme, hue, saturation, contrast, step)
    console.info(`Theme randomized to ${hue.toFixed(2)} (hue), ${saturation.toFixed(2)} (saturation), ${contrast.toFixed(2)} (contrast)`)
    this.render()
  }
}