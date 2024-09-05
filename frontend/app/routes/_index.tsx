import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Configuration } from "~/client";
import {
  BackendVersion1000CultureneutralPublicKeyTokennullApi,
  Todo,
} from "~/client/api";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Todo",
    },
  ];
};

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState<string>("");

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
      // TODO: This is work in progress, move fast and test things
      const config = new Configuration();
      config.basePath = "https://localhost:7239";

      const apiClient =
        new BackendVersion1000CultureneutralPublicKeyTokennullApi(config);

      const response = await apiClient.listTodos();

      // TODO: need to configure generator to map correct type
      const data = response.data as Todo[];
      setTodos(data);
    };

    fetchTodos();
  }, []);

  return (
    <div className="p-10 text-xl">
      <div className="max-h-100 overflow-auto">
        {todos
          .filter((x) => x.id !== undefined)
          .map((t, i) => (
            <div
              key={t.id}
              className={" m-10 " + `${t.done ? "line-through" : ""}`}
            >
              <input
                className="accent-green-400"
                type="checkbox"
                checked={t.done ?? false}
                onChange={(e) => handleCheckboxChange(t.id, e.target.checked)}
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
          onClick={() => {
            todos.push({
              id: Math.random().toString(),
              todo: todoInput,
              done: false,
            });
            setTodoInput("");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
