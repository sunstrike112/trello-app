import React from "react";

import Task from "components/Task/Task";
import "./Column.scss";

function Column(props) {
  return (
    <div className="column">
      <header>BrainStorm</header>
      <ul className="task-list">
        <Task />
        <li className="task-item">Add what you'd like to work on below</li>
        <li className="task-item">Add what you'd like to work on below</li>
        <li className="task-item">Add what you'd like to work on below</li>
        <li className="task-item">Add what you'd like to work on below</li>
      </ul>
      <footer>Add another card</footer>
    </div>
  );
}

export default Column;
