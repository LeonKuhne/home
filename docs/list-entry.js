import Component from './component.js'

// usage: construct with collect action, then interact using CRUD operators
//   .collectItem(read => return ...read(query))
//   .submitOnEnter(...queries)
//   .removeOnClick(...queries)

export default class ListEntry extends Component {
  constructor() { super() }

  initState() { 
    this.getAddState = () => null 
  }

  createState() { 
    this.state = { items: [], scrollTop: 0 }
  }

  setState() {
    this.scrollTop = this.state.scrollTop
  }

  renderedState() {
    this.addEventListener('scroll', e => {
      // set all children to a fixed height
      const heights = []
      for (let child of this.children) {
        heights.push(child.style.height)
        child.style.height = '100px'
      }

      // set scroll pos
      this.state.scrollTop = e.target.scrollTop
      this.updateTemplate(false)

      // reset children's fixed height
      for (let i=0; i<this.children.length; i++) {
        this.children[i].style.height = heights[i]
      }
    })
  }

  //
  // Actions

  // eg .collectItem(read => return read(query))
  collectItem(getAddState) { this._getAddState = getAddState }
  submitAdd() { 
    this.add(this._getAddState((query) => this.read(query))) 
    this.updateTemplate()
  }

  // 
  // Shortcuts (extra)

  submitOnClick(...queries) { this.onClick(_ => this.submitAdd(), ...queries) }
  submitOnEnter(...queries) { this.onEnter(_ => this.submitAdd(), ...queries) }
  removeOnClick(...queries) { this.onClick((index) => this.remove(index), ...queries) }
  onEnter(callback, ...queries) {
    this.onAction('keypress', (e, idx) => {
      if (e.key === 'Enter') callback(e, idx)
    }, ...queries)
  }
  onClick(callback, ...queries) { this.onAction('click', callback, ...queries) }
  onAction(action, callback, ...queries) {
    for (let query of queries) {
      this.on(query, action, (e, idx) => callback(e, idx))
    }
  }

  //
  // Update List 

  add(item) {
    this.state.items.push(item)
    this.updateTemplate()
  }

  remove(idx) {
    this.state.items.splice(idx, 1)
    this.updateTemplate()
  }

  update(idx, item) {
    this.state.items[idx] = item
    this.updateTemplate()
  }
}
