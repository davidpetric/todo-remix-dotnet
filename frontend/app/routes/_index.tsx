import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Todo } from "~/client/api";
import { apiClientFactory } from "~/client/apiClient";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Todo",
      meta: "",
    },
  ];
};

const apiClient = apiClientFactory();

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    listTodo();
  }, []);

  const listTodo = async () => {
    setIsLoading(true);

    const response = await apiClient.listTodos();

    const todos = response.data ?? [];
    setTodos(todos);

    setIsLoading(false);
  };

  const deleteTodo = async (id: string) => {
    const response = await apiClient.deleteTodo(id);
    if (response.status == 200) {
      setTodos((prevState) =>
        prevState.filter((prevItem) => prevItem.id !== id)
      );
    }
  };

  const addTodo = async () => {
    const todo: Todo = {
      id: Math.random().toString(),
      name: todoInput,
      done: false,
    };

    const response = await apiClient.createTodo(todo);
    if (response.status == 201) {
      setTodos([...todos, todo]);
      setTodoInput("");
    }
  };

  const handleCheckboxChange = async (id: string, checked: boolean) => {
    const response = await apiClient.updateDone(id, { done: checked });
    if (response.status != 200) {
      console.error(`updateDone api call failed: ${response}`);
      return;
    }

    const nextTodos = todos.map((t, i) => {
      if (t.id === id) {
        t.done = checked;
        return t;
      } else {
        return t;
      }
    });

    setTodos(nextTodos);
  };

  return (
    <div className="p-10 text-xl">
      {isLoading && <h1>loading..</h1>}
      {!isLoading && (
        <div className="max-h-100 overflow-auto" id="todo-list">
          {todos
            .filter((x) => x.id)
            .map((t, i) => (
              <div
                key={t.id}
                className={" m-10 " + `${t.done ? "line-through" : ""}`}
              >
                <input
                  className="accent-green-400"
                  type="checkbox"
                  checked={t.done ?? false}
                  onChange={async (e) =>
                    handleCheckboxChange(t.id!, e.target.checked)
                  }
                ></input>
                <span className="pl-2">{t.name}</span>
                <span
                  className="pl-2 cursor-pointer"
                  onClick={async () => deleteTodo(t.id!)}
                >
                  🗑️
                </span>
              </div>
            ))}
        </div>
      )}

      <div className="flex gap-10">
        <input
          id="todo-add-input"
          value={todoInput}
          onChange={(e) => {
            setTodoInput(e.target.value);
          }}
          className="bg-blue-950 placeholder:italic placeholder:text-slate-400 block  w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1"
        />
        <button
          id="todo-add-btn"
          disabled={todoInput == undefined || todoInput == ""}
          className="bg-blue-950 block rounded-md dh-10 w-20 disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={async () => {
            addTodo();
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
