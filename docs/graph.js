export default class SeriesGraph {
  constructor(names) {
    this.nodes = {}
    this.add(...names)
    this.connectSeries(names)
  }

  add(...names) { 
    for (let name of names) {
      if (name in this.nodes) continue
      this.nodes[name] = {parents: [], children: []}
    }
  }

  connectSeries(names) {
    for (let i = 1; i < names.length; i++) {
      this.connectTo(names[i-1], names[i])
    }
  }

  connectTo(parent, child) {
    this.nodes[parent].children.push(child)
    this.nodes[child].parents.push(parent)
  }

  asList() {
    return Object.entries(this.nodes)
      .map(([nodeName, props]) => ({
        name: nodeName, 
        id: nodeName.hashCode(),
        children: props.children.map(name => ({
          id: (nodeName + name).hashCode(),
          child: name.hashCode()
        })),
      }))
  }
}