export default class TodoList extends HTMLElement {
  constructor() { super() }
  static registerByDefault = true

  connectedCallback() { 
    this.table = this.getAttribute('table')
    this.items = localStorage.getList(this.table)
    this.getAddState = () => null
    if (TodoList.registerByDefault) this.register()
  }

  disconnectCallback() { if (TodoList.registerByDefault) this.unregister() } 

  //
  // Register (with document template)

  register() { document.addState({ [this.table]: this.items }) }
  unregister() { document.removeState(this.table) }

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
    // TODO use this.render instead
    document.render({ [this.table]: this.items })
  }

  remove(index) {
    this.items = localStorage.removeFromList(this.table, index)
    // TODO use this.render instead
    document.render({ [this.table]: this.items })
  }
}
