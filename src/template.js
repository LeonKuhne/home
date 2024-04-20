const bodyTemplate = document.body.innerHTML
var completeState = {}
const renderCallbacks = []

Document.prototype.setState = function(state) {
  completeState = state
}

document.addEventListener('DOMContentLoaded', () => {
  document.render()
})

Document.prototype.render = function(state = {}) {
  completeState = { ...completeState, ...state }
  document.body.innerHTML = bodyTemplate
  document.body.iterate(completeState)
  document.body.fill(completeState)
  for (let callback of renderCallbacks) callback()
}

Document.prototype.onRender = function(callback) {
  renderCallbacks.push(callback)
}

//
// Fill

HTMLElement.prototype.fill = function(state, content=null) {
  Object.keys(state).forEach(key => this.replace(key, state[key], content))
}

//
// Replace

HTMLElement.prototype.replace = function (key, value) {
  this.innerHTML = this.innerHTML.replace(new RegExp("\\$"+key, 'g'), value)
}

//
// Loop

HTMLElement.prototype.iterate = function(state) {
  // find all elements with class name 'for'
  for (let element of this.querySelectorAll('.for')) {
    const items = state[element.getAttribute('list').substring(1)]
    // repeat
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