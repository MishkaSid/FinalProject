import "./card.css";
function Card({title, description, handleNavigation,buttonText}) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>
      <button
        onClick={() =>
          handleNavigation({handleNavigation})}>
        {buttonText}
      </button>
    </div>
  );
}

export default Card;
