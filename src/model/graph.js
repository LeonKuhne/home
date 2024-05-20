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
    const nodes = []
    for (const [name, props] of Object.entries(this.nodes)) {
      // children
      const children = {}
      for (const childName of props.children) {
        if (childName in children) {
          children[childName].count++
          continue
        }
        children[childName] = {
          lineId: (name + childName).hashCode(),
          childId: childName.hashCode(),
          count: 1
        }
      }
      // node
      const node = {
        name, 
        id: name.hashCode(),
        children: Object.values(children),
        parents: props.parents.map(name => name.hashCode())
      }
      nodes.push(node)
    }
    return nodes 
  }
}