import Component from './component.js'

export default class ListEntry extends Component {
  constructor() { 
    super() 
  }

  loadState() { 
    this.items = localStorage.getList(this.id) || []
    this.getAddState = () => null
    return this.items
  }

  //
  // Actions

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

  remove(index) {
    this.items = localStorage.removeFromList(this.id, index)
    this.render()
  }
}
