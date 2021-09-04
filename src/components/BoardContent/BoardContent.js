import React from "react";

import Column from "components/Column/Column";
import "./BoardContent.scss";

function BoardContent(props) {
  return (
    <div className="board-content">
      <Column />
      <Column />
      <Column />
      <Column />
      <Column />
    </div>
  );
}

export default BoardContent;
