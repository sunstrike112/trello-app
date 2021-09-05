import React from "react";

import "./Card.scss";

function Card(props) {
  const { card } = props;

  const onMouseDown = (e) => {
    if (e.cancelable) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="card-item">
      {card.cover && (
        <img className="card-cover" src={card.cover} onMouseDown={onMouseDown} />
      )}
      {card.title}
    </div>
  );
}

export default Card;
