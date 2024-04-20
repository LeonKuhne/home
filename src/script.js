import './template.js'
import './db.js'

const todoTableName = "todo-list"

document.setState({
  title: "Home",
  todoList: localStorage.getList(todoTableName)
})

document.onRender(() => {
  document.getElementById('add-todo').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const todo = e.target.value
      const todoList = localStorage.addToList(todoTableName, todo)
      document.render({ todoList })
      e.target.value = ""
    }
  })

  document.querySelectorAll('.remove-todo').forEach((element, index) => {
    element.addEventListener('click', () => {
      const todoList = localStorage.removeFromList(todoTableName, index)
      document.render({ todoList })
    })
  })
})