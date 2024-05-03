export default class Task {
  constructor(name, metadata={}) {
    this.name = name
    for (const key in metadata) {
      this[key] = metadata[key]
    }
  }
}