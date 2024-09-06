import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Todo } from "~/client/api";
import { apiClientFactory } from "~/client/apiClient";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Todo",
    },
  ];
};

const apiClient = apiClientFactory();

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCheckboxChange = (id: string, checked: boolean) => {
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

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      const response = await apiClient.listTodos();

      const todos = response.data ?? [];
      setTodos(todos);
      setIsLoading(false);
    };

    fetchTodos();
  }, []);

  return (
    <div className="p-10 text-xl">
      {isLoading && <h1>loading..</h1>}
      {!isLoading && (
        <div className="max-h-100 overflow-auto">
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
                  onChange={(e) =>
                    handleCheckboxChange(t.id!, e.target.checked)
                  }
                ></input>
                <span className="pl-2">{t.name}</span>

                <span
                  className="pl-2"
                  onClick={() => {
                    setTodos((prevState) =>
                      prevState.filter((prevItem) => prevItem.id !== t.id)
                    );
                  }}
                >
                  🗑️
                </span>
              </div>
            ))}
        </div>
      )}

      <div className="flex gap-10">
        <input
          value={todoInput}
          onChange={(e) => {
            setTodoInput(e.target.value);
          }}
          className="bg-blue-950 placeholder:italic placeholder:text-slate-400 block  w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1"
        />

        <button
          className="bg-blue-950 block rounded-md dh-10 w-20"
          onClick={async () => {
            const todo: Todo = {
              id: Math.random().toString(),
              name: todoInput,
              done: false,
            };

            todos.push(todo);

            const response = await apiClient.createTodo(todo);
            setTodoInput("");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
