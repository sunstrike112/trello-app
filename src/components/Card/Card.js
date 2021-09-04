import React from "react";

import Column from "components/Column/Column";
import "./Card.scss";

function Card(props) {
  const { card } = props;

  return (
    <div className="card-item">
      {card.cover && <img className="card-cover" src={card.cover} draggable="false" />}
      {card.title}
    </div>
  );
}

export default Card;
