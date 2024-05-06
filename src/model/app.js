import Query from './query.js'
import Component from './component.js'

export default class App {
  constructor(query) {
    this.root = document.querySelector(query)
    this.renderCallbacks = []
    this.template = this.root.innerHTML
    this.root.innerHTML = ''
    this.table = `${query}-state`
    this.state = JSON.parse(localStorage.getItem(this.table)) || {}
    document.addEventListener('DOMContentLoaded', _ => this.render())
  }

  //
  // Components

  define(tagName, componentClass) { componentClass.registerWithApp(tagName, this) }

  //
  // State

  missingState(state) { 
    this.state = {...state, ...this.state} 
    this.saveState()
  }

  addState(state) {
    this.state = { ...this.state, ...state}
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
    const focusedElementId = document.activeElement?.id
    // reset components
    this.root.innerHTML = this.template
    // apply attributes
    this.root.querySelectorAll('.for').forEach(elem => this.iterate(elem))
    this.root.querySelectorAll('.if').forEach(elem => this.applyVisibility(elem))
    // replace variables
    this.fill(this.state)
    // update focus
    if (focusedElementId) this.root.querySelector('#'+focusedElementId)?.focus()
    // render callbacks
    for (let callback of this.renderCallbacks) callback(this.state)
    // render components
    Component.renderLate(this)
  }

  onRender(callback) { this.renderCallbacks.push(callback) }

  //
  // Fill Queries

  fill() {
    let html = this.root.innerHTML
    Object.keys(this.state).forEach(key => {
      html = html.replace(new RegExp(`\\$${key}[^!=\\s|\\<|\\"]*`, 'g'), (match) => {
        const fillValue = new Query(match).read(this.state)
        return fillValue
      })
    })
    this.root.innerHTML = html
  }

  //
  // Iterables
  //
  // usage
  //   <elem class="for" list="$query">[repeat content]</elem>
  // 
  // TODO can .for and .if be made into modules?

  iterate(elem) {
    // retrieve items
    const attrName = elem.popAttribute('list')
    const query = new Query(attrName)
    if (!query.isValid(this.state)) { console.warn(`template failed iterating ${attrName}: missing from state`); return }
    const items = query.read(this.state)
    // repeat contents
    const children = elem.children
    let html = ""
    for (let i=0; i<items.length; i++) {
      for (let child of children) {
        html += this.replaceVariable(child.outerHTML, "item", query.str+'['+i+']')
      }
    }
    elem.innerHTML = html
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
      console.warn(`template failed setting visibility for ${query}: missing from state`) 
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
    if (!this.applyShow(elem)) this.applyHide(elem)
    if (elem.hasAttribute("equals")) elem.removeAttribute("equals") // cleanup
  }

  //
  // Helpers

  replaceVariable(content, key, value) {
    return content.replace(new RegExp("\\$"+key, 'g'), value)
  }

  setVisibleOnAttribute(elem, attrName, valueMeansVisible=true) {
    const query = elem.popAttributeQuery(attrName)
    if (query.isNull()) return false
    const elseElem = elem.nextElementSibling?.classList.contains('else') ? this.nextElementSibling : null
    // matches equals attribute
    const matchesEquals = this.equalsQuery(elem, query) ?? query.read(this.state) != null
    // set visibility
    if (matchesEquals !== valueMeansVisible) elem.innerHTML = ""
    else if (elseElem) elseElem.innerHTML = ""
    return true
  }
}