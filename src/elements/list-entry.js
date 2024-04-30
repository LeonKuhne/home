import Component from './component.js'

export default class ListEntry extends Component {
  constructor() { 
    super() 
    this.getState = () => this.items
  }

  loadState() { 
    this.table = this.key
    this.items = localStorage.getList(this.table) || []
    this.getAddState = () => null
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
    this.items = localStorage.addToList(this.table, item)
    this.render()
  }

  remove(index) {
    this.items = localStorage.removeFromList(this.table, index)
    this.render()
  }
}
