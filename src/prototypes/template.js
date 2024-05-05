import Query from "./query.js"

const bodyTemplate = document.body.innerHTML
document.body.innerHTML = ""
var completeState = {}
var stateQueries = []
const renderCallbacks = []

//
// State - TODO use a class instance for state

Document.prototype.getState = function() { return completeState }
Document.prototype.setState = function(state) { completeState = state }
Document.prototype.addState = function(state) { 
  for (let [key, value] of Object.entries(state)) {
    if (key.startsWith('$')) stateQueries.push(new Query(key))
    else completeState[key] = value
  }
}
Document.prototype.removeState = function(key) { delete completeState[key] }

//
// Render

document.addEventListener('DOMContentLoaded', () => document.render())

Document.prototype.render = function(state = {}) {
  this.addState(state)
  const focusedElementId = this.activeElement?.id
  this.body.innerHTML = bodyTemplate
  this.body.querySelectorAll('.for').forEach(elem => elem.iterate(completeState))
  this.body.querySelectorAll('.if').forEach(elem => elem.check(completeState))
  this.body.fill(completeState)
  // TODO apply the state queries
  //for (let [key, value] of Object.entries(state))
  //  completeState[new Query(key).read(state)] = value
  if (focusedElementId) this.getElementById(focusedElementId)?.focus()
  for (let callback of renderCallbacks) callback(completeState)
}


Document.prototype.onRender = function(callback) { renderCallbacks.push(callback) }

// 
// Lifecyle


//
// Fill Variables

// replace eg. $var.attr[5] with value, where state[val] exists
HTMLElement.prototype.fill = function(state) {
  let html = this.innerHTML
  Object.keys(state).forEach(key => {
    html = html.replace(new RegExp(`\\$${key}[^!=\\s|\\<|\\"]*`, 'g'), (match) => {
      const fillValue = new Query(match).read(state)
      console.info("template replace: ", match, fillValue)
      return fillValue
    })
  })
  this.innerHTML = html
}

function replaceVariable(content, key, value) {
  return content.replace(new RegExp("\\$"+key, 'g'), value)
}

HTMLElement.prototype.replace = function (key, value) {
  this.innerHTML = replaceVariable(this.innerHTML, key, value)
}

//
// Iterables
//
// usage
//   <elem class="for" list="$query">[repeat content]</elem>

HTMLElement.prototype.iterate = function(state) {
  // retrieve items
  const attrName = this.popAttribute('list')
  const query = new Query(attrName)
  if (!query.isValid(state)) { console.warn(`template failed iterating ${attrName}: missing from state`); return }
  const items = query.read(state)

  // repeat contents
  const children = this.children
  let html = ""
  for (let i=0; i<items.length; i++) {
    for (let child of children) {
      html += replaceVariable(child.outerHTML, "item", '$'+query.var+'['+i+']')
    }
  }
  this.innerHTML = html
}

//
// Conditionals
// 
// usage
//   <elem class="if" show="show" hide="hide" equals="equals">[content]</elem>

// @returns true if equals attribute value matches attribute value
// @returns null if equals attribute doesnt exist
HTMLElement.prototype.equalsQuery = function(state, query) {
  if (!query.isValid(state)) {
    console.warn(`template failed setting visibility for ${query}: missing from state`) 
    return false
  }
  // compare to equals attribute
  return this.isValueEqual(state, x => x == query.read(state))
}

// @returns true if equals attribute matches value
// @returns null if equals attribute doesnt exist
HTMLElement.prototype.isValueEqual = function(state, equals) {
  if (!this.hasAttribute("equals")) return null 
  return equals(new Query(this.getAttribute("equals")).read(state))
}

HTMLElement.prototype.setVisibleOnAttribute = function(state, attrName, valueMeansVisible=true) {
  const query = this.popAttributeQuery(attrName)
  if (query.isNull()) return false
  const elseElem = this.nextElementSibling?.classList.contains('else') ? this.nextElementSibling : null
  // matches equals attribute
  const matchesEquals = this.equalsQuery(state, query) ?? query.read(state) != null
  // set visibility
  if (matchesEquals !== valueMeansVisible) this.innerHTML = ""
  else if (elseElem) elseElem.innerHTML = ""
  return true
}

HTMLElement.prototype.applyShow = function(state) { return this.setVisibleOnAttribute(state, "show", true) }
HTMLElement.prototype.applyHide = function(state) { return this.setVisibleOnAttribute(state, "hide", false) }
HTMLElement.prototype.check = function(state) {
  if (!this.applyShow(state)) this.applyHide(state)
  if (this.hasAttribute("equals")) this.removeAttribute("equals") // cleanup
}

//
// Util

HTMLElement.prototype.popAttributeQuery = function(attrName) {
  if (!this.hasAttribute(attrName)) return
  return new Query(this.popAttribute(attrName))
}

HTMLElement.prototype.popAttribute = function(attrName) {
  if (!this.hasAttribute(attrName)) return
  const value = this.getAttribute(attrName)
  if (value !== undefined) this.removeAttribute(attrName)
  return value
}

// Search (extra)

HTMLElement.prototype.findParentWithId = function(child, id) { 
  return isChildOf(child, element => element.id === id) 
}

HTMLElement.prototype.findParentWith = function(child, filter) {
  while (child) {
    if (filter(child)) return true
    child = child.parentElement
  }
  console.warn(`couldn't find parent component for #${e.target.id}`)
  return false
}


// Read (extra)

HTMLElement.prototype.read = function(query) { return this.querySelector(query)?.value || null }

// Hooks (extra)

HTMLElement.prototype.on = function(query, eventType, action) {
  this.querySelectorAll(query).forEach((element, index) => {
    element.addEventListener(eventType, event => action(event, index))
  })
}

// Hide/Show (extra)
HTMLElement.prototype.hide = function(value) { if (!value) this.style.display = 'none' }
HTMLElement.prototype.show = function(value) { if (!value) this.style.display = 'block' }