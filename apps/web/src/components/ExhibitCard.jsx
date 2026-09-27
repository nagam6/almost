export default function ExhibitCard({ exhibit }) {
  return (
    <article className="exhibit-card">
      <div className="exhibit-card__header">
        <span>{exhibit.topic}</span>
        <span>Exhibit {exhibit.number}</span>
      </div>

      <h2>{exhibit.title}</h2>
      <p>{exhibit.question}</p>

      <div className="exhibit-card__solution">
        <h3>The incorrect answer</h3>
        <p>{exhibit.incorrectAnswer}</p>
      </div>

      <p>Can you spot where the thinking went wrong?</p>
    </article>
  );
}