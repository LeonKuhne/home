Storage.prototype.getList = function(key) {
  return JSON.parse(localStorage.getItem(key)) ?? []
}

Storage.prototype.addToList = function(key, item) {
  return this.modifyList(key, list => {
    list.unshift(item)
    return list
  })
}

Storage.prototype.removeFromList = function(key, idx) {
  return this.modifyList(key, list => {
    list.splice(idx, 1)
    return list
  })
}

Storage.prototype.updateList = function(key, item, idx) {
  return this.modifyList(key, list => {
    list[idx] = item
    return list
  })
}

Storage.prototype.modifyList = function(key, modify) {
  const list = modify(this.getList(key))
  localStorage.setItem(key, JSON.stringify(list))
  return list
}