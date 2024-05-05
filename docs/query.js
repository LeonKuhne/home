export default class Query {

  // eg: $var.attr[5] or $var[5].more -> value
  constructor(str) {
    this.str = str
    this.var = Query.var(str)
  }

  isNull() { return !this.var }
  isValid(state) { return this.var && state.hasOwnProperty(this.var) }

  read(state) {
    if (!this.var) return this.str
    this.value = Query.varValue(this.var, state)
    this.extension = Query.extension(this.str, this.var)
    const item = state[this.var]
    if (!this.extension) return this.value
    return eval(`item${this.extension}`)
  }

  //
  // Static

  static var(str) {
    if (!str || !str.startsWith('$') || str.length < 3) return null
    // remove prefix and extensions
    return str.substring(1).match(/^[a-zA-Z0-9\-]*/)[0]
  }

  static varValue(varName, state) {
    if (!state.hasOwnProperty(varName)) return this.str
    return state[varName]
  }

  static extension(str, varName) { return str.replace("$" + varName, "") }
}
