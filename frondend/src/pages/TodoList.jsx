import { useState, useEffect } from 'react'


export default function TodoListPage({trip, onBack}) {

  useEffect(() => {
  fetch(`http://localhost:5000/trips/${trip.id}/todos`)
    .then(res => res.json())
    .then(data => setTodos(data))
    .catch(err => console.error('Error fetching todos:', err))
}, [trip.id])

  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')


  const addTodo = async (e) => {
    e.preventDefault()

    if (!newTodo.trim()) return 
    
    try{
      const response = await fetch(`http://localhost:5000/trips/${trip.id}/todos`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({text: newTodo})
        }
      )

      if(!response.ok)  throw new Error('Failed to add todo')
      
      const savedTodo = await response.json()

      setTodos(prev => [...prev, savedTodo])
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

 
  const toggleTodo = async (id) => {

    const todoToUpdate = todos.find(todo => todo.id === id)
    if (!todoToUpdate) return

    try{ 

      const response = await fetch(`http://localhost:5000/trips/${trip.id}/todos/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({completed: !todoToUpdate.completed})
        }
      )
      if(!response.ok) throw new Error('Failed to toggle todo')

      const updatedTodo = await response.json()
      
      setTodos(prev => 
      prev.map(todo => todo.id === id ? updatedTodo : todo  ))

    }catch (error) {
      console.error('Error toggling todo:', error)
    }  
  }



  const deleteTodo = async (id) => {

    const todoToDelete = todos.find(todo => todo.id === id)
    if (!todoToDelete) return

    try {
      const response = await fetch(`http://localhost:5000/trips/${trip.id}/todos/${id}`,
        {  method: 'DELETE'  } )

      if(!response.ok) throw new Error('Failed to delete todo')

      setTodos(prev => prev.filter(todo => todo.id !== id))

    }catch (error) {
      console.error('Error deleting todo:', error)
    }

  }




  const sortedTodos = [...todos].sort((a, b) => a.completed - b.completed)

  return (
    <div className="todo-page">
      <div className="todo-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Todo List - {trip.destination}</h1>
      </div>

      <form onSubmit={addTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <button type="submit" className="add-todo-btn">Add Task</button>
      </form>

      <div className="todos-list">
        {sortedTodos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div 
              className="todo-checkbox"
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.completed ? '✓' : ''}
            </div>
            <span className="todo-text">{todo.text}</span>
            <button
              type = "button"
              className="todo-delete"
              onClick={() => deleteTodo(todo.id)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
