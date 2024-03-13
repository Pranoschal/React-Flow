import React from "react";
import FlowGraphWithProvider from "./components/FlowGraphWithProvider.tsx";
import "./App.css";

const DATA = [
  {
    task_name: "task1",
    sequence: 1,
  },
  {
    task_name: "task2",
    sequence: 1,
  },
  {
    task_name: "task3",
    sequence: 2,
  },
  {
    task_name: "task4",
    sequence: 2,
  },
  {
    task_name: "task5",
    sequence: 2,
  },
  {
    task_name: "task6",
    sequence: 3,
  },
  {
    task_name: "task7",
    sequence: 4,
  },
  {
    task_name: "task8",
    sequence: 5,
  },
];
function App() {
  return (
    <div className="App">
      <FlowGraphWithProvider tasks={DATA} />
    </div>
  );
}

export default App;
