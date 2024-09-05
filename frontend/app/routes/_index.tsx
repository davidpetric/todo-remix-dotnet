import type { MetaFunction } from "@remix-run/node";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Todo",
    },
  ];
};

export interface Todo {
  id: string;
  todo: string;
  done: boolean;
}

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

  return (
    <div className="p-10">
      <div className="max-h-100 overflow-auto">
        {todos.map((t, i) => (
          <div
            key={t.id}
            className={"m-2 " + `${t.done ? "line-through" : ""}`}
          >
            <input
              type="checkbox"
              checked={t.done ?? false}
              onChange={(e) => handleCheckboxChange(t.id, e.target.checked)}
            ></input>
            <span>{t.todo}</span>

            <span
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

      <div className="flex gap-5 ">
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
