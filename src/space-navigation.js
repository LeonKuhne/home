
export default class SpaceNavigation {

  constructor(baseTable, tableName, app) {
    this.baseTable = baseTable
    this.tableName = tableName
    this.app = app
    // elements
    this.modal = document.querySelector('.modal')
    // setup
    if (!this.modal) this.showMenuOnHeaderClick()
    else { // menu is visible
      this.createNewSpaceOnEnter()
      this.deleteSpaceOnRemove()
      this.closeMenuOnBackgroundClick()
      this.closeMenuOnEscapeKey()
      this.closeMenuOnExitButton()
    }
  }

  //
  // Show Menu

  showMenuOnHeaderClick() {
    document.querySelector('.app-name').addEventListener('click', _ => {
      const keys = [{name: 'Home', url: '/', table: this.baseTable}]
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i)
        if (key.endsWith('-state')) continue
        keys.push({name: key, url: '?name=' + key, table: key})
      }
      this.app.addState({ modal: "show", spaces: keys })
      this.app.render()
    })
  }

  // 
  // Update Spaces

  createNewSpaceOnEnter() {
    this.modal.querySelector('.create').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return
      const spaceName = e.target.value
      if (!spaceName) return
      // navigate to new space
      location.href = `?name=${spaceName}`
    })
  }

  deleteSpaceOnRemove() {
    this.modal.querySelectorAll('.space .remove').forEach(remove => {
      const spaceName = remove.getAttribute('name')
      remove.addEventListener('click', _ => {
        if (confirm(`Are you sure you want to delete space '${spaceName}'?\nWARNING: This will delete all of its data.`)) {
          localStorage.removeItem(spaceName)
          if (spaceName === this.tableName) location.href = '/' 
        }
      })
    })
  }

  //
  // Hide Menu

  closeMenuOnBackgroundClick() {
    document.body.querySelector('.modal-bg').addEventListener('click', e => {
      this.app.addState({ modal: 'hide' })
      this.app.render()
    })
  }

  closeMenuOnEscapeKey() {
    document.body.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return
      this.app.addState({ modal: 'hide' })
      this.app.render()
    })
  }

  closeMenuOnExitButton() {
    this.modal.querySelector('.close').addEventListener('click', _ => {
      this.app.addState({ modal: 'hide' })
      this.app.render()
    })
  }
}