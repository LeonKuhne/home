import Query from "./query.js"

const bodyTemplate = document.body.innerHTML
var completeState = {}
var stateQueries = []
const renderCallbacks = []

//
// State - TODO use a class instance for state

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
  const focusedElementId = document.activeElement?.id
  document.body.innerHTML = bodyTemplate
  document.body.iterate(completeState)
  document.body.check(completeState)
  document.body.fill(completeState)
  // TODO apply the state queries
  //for (let [key, value] of Object.entries(state))
  //  completeState[new Query(key).read(state)] = value
  if (focusedElementId) document.getElementById(focusedElementId)?.focus()
  for (let callback of renderCallbacks) callback(completeState)
}

Document.prototype.onRender = function(callback) { renderCallbacks.push(callback) }

HTMLElement.prototype.hide = function(value) { if (!value) this.style.display = 'none' }
HTMLElement.prototype.show = function(value) { if (!value) this.style.display = 'block' }

//
// Fill Variables

// replace eg. $var.attr[5] with value, where state[val] exists
HTMLElement.prototype.fill = function(state) {
  Object.keys(state).forEach(key => {
    const value = state[key]
    this.innerHTML = this.innerHTML.replace(new RegExp(`\\$${key}[^!=\\s|\\<|\\"]*`, 'g'), (match) => {
      const extension = match.substring(key.length+1)
      const fillValue = extension ? eval(`value${extension}`) : value
      console.info("template replace: ", match, fillValue)
      return fillValue
    })
  })
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
  for (let element of this.querySelectorAll('.for')) {

    // retrieve items
    const attrName = element.getAttribute('list')
    const query = new Query(attrName)
    if (!query.isValid(state)) { console.warn(`template failed iterating ${attrName}: missing from state`); continue }
    element.removeAttribute('list')
    const items = query.read(state)

    // repeat contents
    const children = element.children
    let html = ""
    for (let i=0; i<items.length; i++) {
      for (let child of children) {
        html += replaceVariable(child.outerHTML, "item", '$'+query.var+'['+i+']')
      }
    }
    element.innerHTML = html
  }
}

//
// Conditionals
// 
// usage
//   <elem class="if" show="show" hide="hide" equals="equals">[content]</elem>

// @returns true if equals attribute matches another attribute value
HTMLElement.prototype.isEqual = function(state, attrName, valueMeansVisible=true) {
  // retrieve attribute
  const attrValue = this.getAttribute(attrName)
  if (!attrValue) return false
  const query = new Query(attrValue)
  if (!query.isValid(state)) {
    console.warn(`template failed setting visibility for ${attrValue}: missing from state`) 
    return false
  }
  // check if equals 
  return this.isValueEqual(state, query.read(state), valueMeansVisible)
}

// @returns true if equals attribute matches value
HTMLElement.prototype.isValueEqual = function(state, value, valueMeansVisible=true) {
  if (!this.hasAttribute("equals")) return !!value === valueMeansVisible
  valueMeansVisible = new Query(this.getAttribute("equals")).read(state)
  return value === valueMeansVisible
}

HTMLElement.prototype.setVisibleOnAttribute = function(state, attrName, valueMeansVisible=true) {
  // set if/else visibility
  const elseElem = this.nextElementSibling?.classList.contains('else') ? this.nextElementSibling : null
  if (!this.isEqual(state, attrName, valueMeansVisible)) this.innerHTML = ""
  else if (elseElem) elseElem.innerHTML = ""

  // cleanup attributes
  this.removeAttribute(attrName)
  if (this.hasAttribute("equals")) this.removeAttribute("equals")
  return true
}
HTMLElement.prototype.applyShow = function(state) { return this.setVisibleOnAttribute(state, "show", true) }
HTMLElement.prototype.applyHide = function(state) { return this.setVisibleOnAttribute(state, "hide", false) }

HTMLElement.prototype.check = function(state) {
  for (let element of this.querySelectorAll('.if')) {
    if(!element.applyShow(state)) element.applyHide(state)
  }
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