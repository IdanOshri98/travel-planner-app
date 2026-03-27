import { useState, useEffect } from 'react';
import { DATA_MODE } from "../config";
import { loadTodos, saveTodos } from "../utils/todoStorage";

import useTodoStore from "../store/useTodoStore";
import { fetchTodos, createTodo, updateTodo, removeTodo } from "../services/todoService";


export default function TodoListPage({trip, onBack}) {

  const [newTodo, setNewTodo] = useState('')
  
  const todos = useTodoStore((state) => state.todos);
  const setTodos = useTodoStore((state) => state.setTodos);
  const addTodoToStore = useTodoStore((state) => state.addTodoToStore);
  const toggleTodoInStore = useTodoStore((state) => state.toggleTodoInStore);
  const deleteTodoFromStore = useTodoStore((state) => state.deleteTodoFromStore);

  useEffect(() => {
    if(!trip?.id) return;

    if (DATA_MODE === "demo") {
      const storedTodos = loadTodos(trip.id);
      setTodos(storedTodos);
      return;
    }

  fetchTodos(trip.id)
    .then(data => setTodos(data))
    .catch(err => console.error('Error fetching todos:', err))
}, [trip?.id, setTodos])



  const addTodo = async (e) => {
    e.preventDefault()

    if (!newTodo.trim()) return 
    
    const todoToAdd = {
    id: crypto.randomUUID(),
    text: newTodo.trim(),
    completed: false,
  };

  if (DATA_MODE === "demo") {
    addTodoToStore(todoToAdd);
    saveTodos(trip.id, useTodoStore.getState().todos);
    setNewTodo('');
    return;
  }

    try{
        
      const savedTodo = await createTodo(trip.id, newTodo.trim())
      addTodoToStore(savedTodo)
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

 
  const toggleTodo = async (id) => {

    const todoToUpdate = todos.find(todo => todo.id === id)
    if (!todoToUpdate) return;

    if (DATA_MODE === "demo") {
      toggleTodoInStore(id);
      saveTodos(trip.id, useTodoStore.getState().todos);
      return;
  }
  
    try{ 

      

      const updatedTodo = await updateTodo(trip.id, id, !todoToUpdate.completed)
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo  ))
    }catch (error) {
      console.error('Error toggling todo:', error)
    }  
  }



  const deleteTodo = async (id) => {

    const exists= todos.find(todo => todo.id === id)
    if (!exists) return;

    if (DATA_MODE === "demo") {
      deleteTodoFromStore(id);
      saveTodos(trip.id, useTodoStore.getState().todos);
      return;
    }

    try {
      await removeTodo(trip.id, id)
      deleteTodoFromStore(id)

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
