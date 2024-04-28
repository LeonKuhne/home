const bodyTemplate = document.body.innerHTML
var completeState = {}
const renderCallbacks = []

//
// State

Document.prototype.setState = function(state) { completeState = state }
Document.prototype.addState = function(state) { completeState = { ...completeState, ...state } }
Document.prototype.removeState = function(key) { delete completeState[key] }

//
// Render

document.addEventListener('DOMContentLoaded', () => document.render())

Document.prototype.render = function(state = {}) {
  completeState = { ...completeState, ...state }
  document.body.innerHTML = bodyTemplate
  document.body.iterate(completeState)
  document.body.check(completeState)
  document.body.fill(completeState)
  for (let callback of renderCallbacks) callback()
}

Document.prototype.onRender = function(callback) { renderCallbacks.push(callback) }

HTMLElement.prototype.hide = function(value) { if (!value) this.style.display = 'none' }
HTMLElement.prototype.show = function(value) { if (!value) this.style.display = 'block' }

//
// Variables

HTMLElement.prototype.var = function(attribute) { return this.getAttribute(attribute)?.substring(1) }

//
// Fill Variables

HTMLElement.prototype.fill = function(state, content=null) {
  Object.keys(state).forEach(key => this.replace(key, state[key], content))
}

HTMLElement.prototype.replace = function (key, value) {
  this.innerHTML = this.innerHTML.replace(new RegExp("\\$"+key, 'g'), value)
}

//
// Loop Variables

HTMLElement.prototype.iterate = function(state) {
  for (let element of this.querySelectorAll('.for')) {
    const varName = element.var("list")
    if (!state.hasOwnProperty(varName)) {
      console.warn(`template failed iterating ${element.getAttribute('list')}: missing from state`) 
      continue
    }
    // repeat contents
    const items = state[varName]
    const children = element.children
    let html = ""
    for (let item of items) {
      for (let child of children) {
        html += child.outerHTML.replace('\$item', item)
      }
    }
    element.innerHTML = html
  }
}

//
// Check Variables

HTMLElement.prototype.setVisibleOnAttribute = function(state, query, valueMeansVisible=true) {
  const varName = this.var(query)
  if (!varName || !state.hasOwnProperty(varName)) return false;
  if (state[varName] == valueMeansVisible) this.show()
  else this.hide()
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
