const bodyTemplate = document.body.innerHTML
var completeState = {}
const renderCallbacks = []

//
// State - TODO use a class instance for state

Document.prototype.setState = function(state) { completeState = state }
Document.prototype.addState = function(state) { completeState = { ...completeState, ...state } }
Document.prototype.removeState = function(key) { delete completeState[key] }

//
// Render

document.addEventListener('DOMContentLoaded', () => document.render())

Document.prototype.render = function(state = {}) {
  completeState = { ...completeState, ...state }
  const focusedElementId = document.activeElement?.id
  document.body.innerHTML = bodyTemplate
  document.body.iterate(completeState)
  document.body.check(completeState)
  document.body.fill(completeState)
  if (focusedElementId) document.getElementById(focusedElementId)?.focus()
  for (let callback of renderCallbacks) callback()
}

Document.prototype.onRender = function(callback) { renderCallbacks.push(callback) }

HTMLElement.prototype.hide = function(value) { if (!value) this.style.display = 'none' }
HTMLElement.prototype.show = function(value) { if (!value) this.style.display = 'block' }

//
// Variables

HTMLElement.prototype.var = function(attribute) { 
  const value = this.getAttribute(attribute)
  if (!value || !value.startsWith('$')) return null
  return value.substring(1) 
}

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
    for (let i=0; i<items.length; i++) {
      for (let child of children) {
        html += replaceVariable(child.outerHTML, "item", '$'+varName+'['+i+']')
      }
    }
    element.innerHTML = html
  }
}

//
// Check Variables

HTMLElement.prototype.equalsValue = function(state) {
  const equalsVar = this.var("equals")
  if (state.hasOwnProperty(equalsVar)) return state[equalsVar]
  return this.getAttribute("equals")
}

HTMLElement.prototype.setVisibleOnAttribute = function(state, query, valueMeansVisible=true) {
  const varName = this.var(query)
  if (!varName || !state.hasOwnProperty(varName)) return false
  const elseElem = this.nextElementSibling?.classList.contains('else') ? this.nextElementSibling : null
  if (this.hasAttribute("equals")) valueMeansVisible = this.equalsValue(state)
  if (state[varName] == valueMeansVisible) {
    this.show()
    elseElem?.hide()
  } else {
    this.hide()
    elseElem?.show()
  }
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
