import "./ExhibitCard.css";

export default function ExhibitCard({ exhibit }) {
  return (
    <article className="exhibit-card">
      <div className="exhibit-card__header">
        <span className="exhibit-card__topic">
          {exhibit.topic}
        </span>

        <span className="exhibit-card__number">
          Exhibit {exhibit.number}
        </span>
      </div>

      <h2 className="exhibit-card__title">
        {exhibit.title}
      </h2>

      <p className="exhibit-card__question">
        {exhibit.question}
      </p>

      <div className="exhibit-card__solution">
        <h3 className="exhibit-card__label">
          The incorrect answer
        </h3>

        <p>{exhibit.incorrectAnswer}</p>
      </div>

      <p className="exhibit-card__prompt">
        Can you spot where the thinking went wrong?
      </p>
    </article>
  );
}