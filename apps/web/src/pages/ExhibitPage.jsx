import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { museumRooms } from "../data/museumRooms";
import { exhibitChallenges } from "../data/exhibitChallenges";
import NotFoundPage from "./NotFoundPage";
import "./ExhibitPage.css";

function ExhibitChallenge({ exhibit, challenge, room }) {
  const [selectedId, setSelectedId] = useState("");
  const [reasoning, setReasoning] = useState("");

  return (
    <div className="exhibit-page container">
      <Link
        className="exhibit-page__back"
        to={`/museum/${room.id}`}
      >
        ← Back to {room.name}
      </Link>

      <header className="exhibit-page__header">
        <p className="exhibit-page__eyebrow">
          Exhibit {exhibit.number} · {exhibit.topic}
        </p>

        <h1>{exhibit.title}</h1>

        <p className="exhibit-page__intro">
          Follow the reasoning. Find the moment it goes wrong.
        </p>
      </header>

      <div className="exhibit-page__grid">
        <section
          className="exhibit-panel"
          aria-labelledby="question-title"
        >
          <h2 id="question-title">The question</h2>

          <p className="exhibit-page__question">
            {exhibit.question}
          </p>

          <div className="exhibit-page__wrong-answer">
            <h3>The incorrect solution</h3>
            <p>{exhibit.incorrectAnswer}</p>
          </div>

          <p className="exhibit-page__hint">
            This answer is intentionally incorrect.
            Your challenge is to understand why.
          </p>
        </section>

        <section
          className="exhibit-panel"
          aria-labelledby="challenge-title"
        >
          <h2 id="challenge-title">Your turn to rethink</h2>

          <fieldset className="exhibit-page__options">
            <legend>Where did the thinking go wrong?</legend>

            {challenge.options.map((option) => (
              <label
                key={option.id}
                className={`exhibit-page__option ${
                  selectedId === option.id
                    ? "exhibit-page__option--selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name={`answer-${exhibit.id}`}
                  value={option.id}
                  checked={selectedId === option.id}
                  onChange={() => setSelectedId(option.id)}
                />

                <span>{option.text}</span>
              </label>
            ))}
          </fieldset>

          <label
            className="exhibit-page__reason-label"
            htmlFor="reasoning"
          >
            What made you choose it?{" "}
            <span className="text-muted">(optional)</span>
          </label>

          <textarea
            id="reasoning"
            className="exhibit-page__reason"
            value={reasoning}
            onChange={(event) => setReasoning(event.target.value)}
            placeholder="Walk us through your thinking..."
            maxLength={1000}
            rows={4}
          />

          <p className="exhibit-page__preview-note">
            Preview mode — you can explore the choices.
            Answers are not submitted or saved yet.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function ExhibitPage() {
  const { exhibitId } = useParams();

  const room = museumRooms.find((item) =>
    item.exhibits.some((exhibit) => exhibit.id === exhibitId)
  );

  const exhibit = room?.exhibits.find(
    (item) => item.id === exhibitId
  );

  const challenge = exhibitChallenges[exhibitId];

  if (!room || !exhibit || !challenge) {
    return <NotFoundPage />;
  }

  return (
    <ExhibitChallenge
      key={exhibit.id}
      exhibit={exhibit}
      challenge={challenge}
      room={room}
    />
  );
}