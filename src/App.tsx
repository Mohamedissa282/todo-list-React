import { useEffect, useState } from "react";
import { Construction } from "lucide-react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

type Priority = "Non commencé" | "En cours" | "Terminé";

type Todo = {
  id?: string; // id venant de Firestore
  text: string;
  priority: Priority;
}

function App() {
  const [input, setInput] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("En cours");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Priority | "Tous">("Tous");
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());

  // Charger les todos depuis Firestore
  useEffect(() => {
    const fetchTodos = async () => {
      const querySnapshot = await getDocs(collection(db, "todos"));
      const data: Todo[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text as string,
        priority: doc.data().priority as Priority
      }));
      setTodos(data);
    };
    fetchTodos();
  }, []);

  // Ajouter un todo
  const addTodo = async () => {
    if (input.trim() === "") return;

    const newTodo: Todo = {
      text: input.trim(),
      priority
    };

    // Ajouter dans Firestore
    const docRef = await addDoc(collection(db, "todos"), newTodo);

    setTodos([{ ...newTodo, id: docRef.id }, ...todos]);
    setInput("");
    setPriority("En cours");
  };

  // Supprimer un todo
  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, "todos", id));
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Changer le statut
  const changeStatus = async (id: string, newStatus: Priority) => {
    const todoRef = doc(db, "todos", id);
    await updateDoc(todoRef, { priority: newStatus });
    setTodos(todos.map(todo => todo.id === id ? { ...todo, priority: newStatus } : todo));
  };

  // Sélection et suppression multiple
  const toggleSelectTodo = (id: string) => {
    const newSelected = new Set(selectedTodos);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedTodos(newSelected);
  };

  const finishSelected = async () => {
    for (let id of selectedTodos) {
      await deleteDoc(doc(db, "todos", id));
    }
    setTodos(todos.filter(todo => !selectedTodos.has(todo.id!)));
    setSelectedTodos(new Set());
  };

  let filteredTodos: Todo[] = filter === "Tous" ? todos : todos.filter(todo => todo.priority === filter);
  const urgentCount = todos.filter(t => t.priority === "Non commencé").length;
  const mediumCount = todos.filter(t => t.priority === "En cours").length;
  const lowCount = todos.filter(t => t.priority === "Terminé").length;
  const totalCount = todos.length;

  return (
    <div className="flex justify-center">
      <div className="w-2/3 flex flex-col gap-4 my-15 bg-base-300 p-5 rounded-2xl">
        <div className="flex gap-4">
          <input
            type="text"
            className="input w-full"
            placeholder="Ajouter une tâche..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <select
            className="select w-full"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="Non commencé">Non commencé</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
          </select>
          <button onClick={addTodo} className="btn btn-primary">
            Ajouter
          </button>
        </div>

        <div className="space-y-2 flex-1 h-fit">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <button className={`btn btn-soft ${filter === "Tous" ? "btn-primary" : ""}`} onClick={() => setFilter("Tous")}>Tous ({totalCount})</button>
              <button className={`btn btn-soft ${filter === "Non commencé" ? "btn-primary" : ""}`} onClick={() => setFilter("Non commencé")}>Non commencé ({urgentCount})</button>
              <button className={`btn btn-soft ${filter === "En cours" ? "btn-primary" : ""}`} onClick={() => setFilter("En cours")}>En cours ({mediumCount})</button>
              <button className={`btn btn-soft ${filter === "Terminé" ? "btn-primary" : ""}`} onClick={() => setFilter("Terminé")}>Terminé ({lowCount})</button>
            </div>
            <button onClick={finishSelected} className="btn btn-primary" disabled={selectedTodos.size === 0}>
              Finir la sélection ({selectedTodos.size})
            </button>
          </div>

         {filteredTodos.length > 0 ? (
  <ul className="divide-y divide-primary/20">
    {filteredTodos.map(todo => (
      <li key={todo.id} className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={selectedTodos.has(todo.id!)}
              onChange={() => toggleSelectTodo(todo.id!)}
            />
            <span className="text-md font-bold">{todo.text}</span>
            <span
              className={`badge badge-sm badge-soft
                ${todo.priority === "Non commencé" ? "badge-error"
                  : todo.priority === "En cours" ? "badge-warning"
                    : "badge-success"}`}
            >
              {todo.priority}
            </span>
          </div>
          <button
            onClick={() => deleteTodo(todo.id!)}
            className="btn btn-sm btn-error btn-soft"
          >
            Supprimer
          </button>
        </div>
      </li>
    ))}
  </ul>
) : (
  <div className="flex justify-center items-center flex-col p-5">
    <div>
      <Construction strokeWidth={1} className="w-40 h-40 text-primary" />
    </div>
    <p className="text-sm">Aucune tâche pour ce filtre</p>
  </div>
)}
        </div>
      </div>
    </div>
  );
}

export default App;
