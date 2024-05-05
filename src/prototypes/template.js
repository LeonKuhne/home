import Query from "./query.js"

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