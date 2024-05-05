import Component from './component.js'

// usage: construct with collect action, then interact using CRUD operators
//   .collectItem(read => return ...read(query))
//   .submitOnEnter(...queries)
//   .removeOnClick(...queries)

export default class ListEntry extends Component {
  constructor() { super() }

  initState() { this.getAddState = () => null }
  loadState() { return localStorage.getList(this.id) || [] }
  setState(items) { this.items = items }
  getState() { return this.items }

  //
  // Actions

  // eg .collectItem(read => return read(query))
  collectItem(getAddState) { this._getAddState = getAddState }
  submitAdd() { 
    this.add(this._getAddState((query) => this.read(query))) 
    this.render()
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
    this.items = localStorage.addToList(this.id, item)
    this.render()
  }

  remove(idx) {
    this.items = localStorage.removeFromList(this.id, idx)
    this.render()
  }

  update(idx, item) {
    this.items = localStorage.updateList(this.id, item, idx)
    this.render()
  }
}
