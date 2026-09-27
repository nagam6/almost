import "./ExhibitCard.css";
import { Link } from "react-router-dom";

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
      
      <Link
  className="exhibit-card__link"
  to={`/museum/exhibits/${exhibit.id}`}
  aria-label={`Explore exhibit: ${exhibit.title}`}
>
  Explore mistake <span aria-hidden="true">↗</span>
</Link>

    </article>
  );
}