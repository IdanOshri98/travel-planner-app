import { create } from "zustand";

const useTodoStore = create((set) => ({
  todos: [],

  setTodos: (todos) => set({ todos }),

  addTodoToStore: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
    })),

  toggleTodoInStore: (id) =>
  set((state) => {
    const updated = state.todos.map((todo) =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    );

    return { todos: updated };
  }),

  deleteTodoFromStore: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),
}));

export default useTodoStore;