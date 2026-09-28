import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExhibit } from "../services/api";
import NotFoundPage from "./NotFoundPage";
import "./ExhibitPage.css";
import "./ExhibitAttempt.css";
import { useAuth } from "../components/AuthProvider";
import { getMyAttempt, submitAttempt } from "../services/attemptsApi";

function ExhibitChallenge({ exhibit, user }) {
  const [selectedId, setSelectedId] = useState("");
  const [reasoning, setReasoning] = useState("");

  const [attempt, setAttempt] = useState(null);
  const [checking, setChecking] = useState(Boolean(user));
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [expired, setExpired] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setChecking(true); setLoadError(""); setExpired(false);
    getMyAttempt(exhibit.slug, controller.signal)
      .then(({ attempt: saved }) => {
        if (controller.signal.aborted) return;
        setAttempt(saved);
        if (saved) { setSelectedId(saved.selectedOptionId); setReasoning(saved.reasoning || ""); }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setLoadError(error.message);
        if (error.status === 401) setExpired(true);
      })
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [exhibit.slug, user?.id, retryCount]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current || attempt || !selectedId || !user || checking || loadError) return;
    submitting.current = true;
    setSaving(true); setSubmitError("");
    try {
  const data = await submitAttempt(exhibit.slug, {
  selectedOptionId: selectedId,
  reasoning,
  exhibitVersion: exhibit.version,
});
      setAttempt(data.attempt);
      setSelectedId(data.attempt.selectedOptionId);
      setReasoning(data.attempt.reasoning || "");
    } catch (error) {
      setSubmitError(error.message);
      if (error.status === 401) setExpired(true);
    } finally { submitting.current = false; setSaving(false); }
  }
  const locked = !user || user.role !== "student" || checking || Boolean(loadError) || saving || Boolean(attempt) || expired;
  const loginLink = <Link to="/login" state={{ from: `/museum/exhibits/${exhibit.slug}` }}>Log in to answer</Link>;

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

          <form onSubmit={handleSubmit}>
          <fieldset className="exhibit-page__options" disabled={locked}>
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
            disabled={locked}
          />

          {!user && <p className="attempt-note">{loginLink} to save your answer and see the explanation.</p>}
          {user && user.role !== "student" && <p className="attempt-note">Teacher accounts can browse. Learning attempts are for student accounts.</p>}
          {checking && <p role="status">Checking your previous attempt…</p>}
          {loadError && <div className="attempt-error" role="alert"><p>{loadError}</p>
            {expired ? loginLink : <button type="button" className="attempt-button" onClick={() => setRetryCount((n) => n + 1)}>Try again</button>}
          </div>}
          {submitError && <div className="attempt-error" role="alert"><p>{submitError}</p>{expired && loginLink}</div>}
          {user?.role === "student" && !attempt && <button type="submit" className="attempt-button" disabled={locked || !selectedId}>
            {saving ? "Saving your thinking…" : "Check my thinking →"}
          </button>}
          </form>
          {attempt && <div className={`attempt-result ${attempt.isCorrect ? "attempt-result--correct" : "attempt-result--rethink"}`} role="status" aria-live="polite">
            <p className="attempt-result__label">FIRST ATTEMPT SAVED</p>
            <h3>{attempt.isCorrect ? "You found the mistake." : "A useful moment to rethink."}</h3>
            {attempt.selectedOptionFeedback && <p className="attempt-result__choice-feedback"><strong>About your choice:</strong> {attempt.selectedOptionFeedback}</p>}
            <p><strong>The correct diagnosis:</strong> {attempt.correctOptionText}</p>
            <p>{attempt.explanation}</p>
            <p className="attempt-note">Your first answer is saved. This result will still be here when you return.</p>
            <Link to={`/museum/${exhibit.roomSlug}`}>Explore another exhibit →</Link>
          </div>}
        </section>
      </div>
    </div>
  );
}

function ExhibitLoader({ exhibitId }) {
  const auth = useAuth();
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

  if (auth.loading) return <p className="container" role="status">Checking your session…</p>;
  if (auth.error) return <div className="container"><p role="alert">{auth.error}</p><button type="button" onClick={auth.retry}>Retry session</button></div>;
  return exhibit ? <ExhibitChallenge key={`${exhibit.slug}:${auth.user?.id || "guest"}`} exhibit={exhibit} user={auth.user} /> : null;
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
