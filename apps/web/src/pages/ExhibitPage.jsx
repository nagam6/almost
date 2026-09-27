import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExhibit } from "../services/api";
import NotFoundPage from "./NotFoundPage";
import "./ExhibitPage.css";

function ExhibitChallenge({ exhibit }) {
  const [selectedId, setSelectedId] = useState("");
  const [reasoning, setReasoning] = useState("");

  return (
    <div className="exhibit-page container">
      <Link
        className="exhibit-page__back"
        to={`/museum/${exhibit.roomSlug}`}
      >
        ← Back to room
      </Link>

      <header className="exhibit-page__header">
        <p className="exhibit-page__eyebrow">
          Exhibit {String(exhibit.number).padStart(3, "0")} ·{" "}
          {exhibit.topic}
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

          <p
            className="exhibit-page__question"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {exhibit.question}
          </p>

          <div className="exhibit-page__wrong-answer">
            <h3>The incorrect solution</h3>
            <p>{exhibit.incorrectAnswer}</p>
          </div>

          <p className="exhibit-page__hint">
            This answer is intentionally incorrect. Your challenge
            is to understand why.
          </p>
        </section>

        <section
          className="exhibit-panel"
          aria-labelledby="challenge-title"
        >
          <h2 id="challenge-title">Your turn to rethink</h2>

          <fieldset className="exhibit-page__options">
            <legend>Where did the thinking go wrong?</legend>

            {exhibit.options.map((option) => (
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
                  name={`answer-${exhibit.slug}`}
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

function ExhibitLoader({ exhibitId }) {
  const [exhibit, setExhibit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadExhibit() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const data = await getExhibit(
          exhibitId,
          controller.signal
        );

        if (controller.signal.aborted) return;

        setExhibit(data);
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error.status === 404) {
          setNotFound(true);
        } else {
          setError(
            "We couldn't load this exhibit. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadExhibit();

    return () => controller.abort();
  }, [exhibitId, retryCount]);

  if (notFound) {
    return <NotFoundPage />;
  }

  if (loading || error) {
    return (
      <div className="exhibit-page container">
        <Link className="exhibit-page__back" to="/museum">
          ← All rooms
        </Link>

        {loading ? (
          <p role="status">Loading the exhibit…</p>
        ) : (
          <div>
            <p role="alert">{error}</p>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  return exhibit ? <ExhibitChallenge exhibit={exhibit} /> : null;
}

export default function ExhibitPage() {
  const { exhibitId } = useParams();

  return (
    <ExhibitLoader
      key={exhibitId}
      exhibitId={exhibitId}
    />
  );
}