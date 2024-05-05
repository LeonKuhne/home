import Component from './component.js'

// usage: construct with collect action, then interact using CRUD operators
//   .collectItem(read => return ...read(query))
//   .submitOnEnter(...queries)
//   .removeOnClick(...queries)

export default class ListEntry extends Component {
  constructor() { super() }

  loadState() { 
    this.items = localStorage.getList(this.id) || []
    this.getAddState = () => null
    return this.items
  }

  //
  // Actions

  // eg .collectItem(read => return read(query))
  collectItem(getAddState) { this._getAddState = getAddState }
  submitAdd() { this.add(this._getAddState((query) => this.read(query))) }

  // 
  // Shortcuts (extra)

  submitOnClick(...queries) {
    for (let query of queries) {
      this.on(query, 'click', _ => this.submitAdd())
    }
  }

  submitOnEnter(...queries) { 
    for (let query of queries) { 
      this.on(query, 'keypress', e => {
        if (e.key === 'Enter') this.submitAdd()
      })
    }
  }

  removeOnClick(...queries) {
    for (let query of queries) {
      this.on(query, 'click', (_, index) => this.remove(index))
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
