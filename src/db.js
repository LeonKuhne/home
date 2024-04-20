Storage.prototype.getList = function(key) {
  return JSON.parse(localStorage.getItem(key)) ?? []
}

Storage.prototype.addToList = function(key, item) {
  const list = this.getList(key)
  list.unshift(item)
  localStorage.setItem(key, JSON.stringify(list))
  return list
}

Storage.prototype.removeFromList = function(key, index) {
  const list = this.getList(key)
  list.splice(index, 1)
  localStorage.setItem(key, JSON.stringify(list))
  return list
}

