import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { checkAiChallenge, getAiChallenge } from "../services/aiApi";
import "./MuseumRoomPage.css";
import { playCorrect, playWrong } from "../services/sounds";

export default function AiCodeLab() {
  const [challenge, setChallenge] = useState(null);
  const [answerMode, setAnswerMode] = useState("choose");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [editedLine, setEditedLine] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  async function loadChallenge() {
    setLoading(true);
    setError("");
    setLoginRequired(false);
    setChallenge(null);
    setResult(null);
    setAnswerMode("choose");
    setSelectedOptionId("");
    setEditedLine("");

    try {
      const nextChallenge = await getAiChallenge();
      setChallenge(nextChallenge);
    } catch (caught) {
      setError(caught.message);
      toast.error(caught.message);
      setLoginRequired(caught.status === 401);
    } finally {
      setLoading(false);
    }
  }

 async function checkAnswer(event) {
  event.preventDefault();

  if (!challenge || loading) return;

  setLoading(true);
  setError("");

  try {
    const feedback = await checkAiChallenge({
      token: challenge.token,
      mode: answerMode === "choose" ? "choice" : "edit",
      ...(answerMode === "choose"
        ? { selectedOptionId }
        : { correctedLine: editedLine }),
    });

    setResult(feedback);

    if (feedback.correct) {
      playCorrect();
    } else {
      playWrong();
    }

    toast[feedback.correct ? "success" : "info"](
      feedback.correct
        ? "You caught the AI's mistake."
        : "Almost. Take another look at the explanation.",
    );
  } catch (caught) {
    setError(caught.message);
    toast.error(caught.message);
    setLoginRequired(caught.status === 401);
  } finally {
    setLoading(false);
  }
}
  function changeMode(mode) {
    setAnswerMode(mode);
    setResult(null);
    setError("");
  }

  return (
    <section className="ai-lab" aria-labelledby="ai-lab-title">
      <div className="ai-lab__heading">
        <p className="museum-room-page__eyebrow">AI CODE LAB</p>
        <h2 id="ai-lab-title">The AI got close. You get it right.</h2>
        <p>
          The AI made one mistake in this short piece of code. Find it, then
          show what should change.
        </p>
      </div>

      {!challenge && (
        <button
          className="ai-lab__check"
          type="button"
          onClick={loadChallenge}
          disabled={loading}
        >
          {loading ? "Creating your challenge…" : "Create an AI challenge ↗"}
        </button>
      )}

      {error && (
        <p className="ai-lab__note" role="alert">
          {error} {loginRequired && <Link to="/login">Log in to continue</Link>}
        </p>
      )}

      {challenge && (
        <>
          <div className="ai-lab__grid">
            <div className="ai-lab__panel">
              <span className="ai-lab__tag">
                {challenge.source === "live"
                  ? "AI-GENERATED MISTAKE"
                  : "REVIEWED DEMO CHALLENGE"}
              </span>

              <h3>{challenge.title}</h3>
              <p>{challenge.context}</p>
              <p className="ai-lab__note">{challenge.question}</p>

              <pre className="ai-lab__code">
                <code>{challenge.code}</code>
              </pre>

              {challenge.source === "reviewed" && (
                <p className="ai-lab__note">
                  The AI is temporarily unavailable, so we opened a reviewed
                  challenge for you.
                </p>
              )}
            </div>

            <div className="ai-lab__panel">
              <h3>How will you fix it?</h3>

              <div
                className="ai-lab__modes"
                role="group"
                aria-label="Choose how to answer"
              >
                <button
                  type="button"
                  className={answerMode === "choose" ? "is-active" : ""}
                  aria-pressed={answerMode === "choose"}
                  onClick={() => changeMode("choose")}
                >
                  Choose the mistake
                </button>

                <button
                  type="button"
                  className={answerMode === "edit" ? "is-active" : ""}
                  aria-pressed={answerMode === "edit"}
                  onClick={() => changeMode("edit")}
                >
                  Fix the line yourself
                </button>
              </div>

              <form onSubmit={checkAnswer}>
                {answerMode === "choose" ? (
                  <fieldset className="ai-lab__options" disabled={loading}>
                    <legend>What did the AI get wrong?</legend>

                    {challenge.options.map((option) => (
                      <label key={option.id} className="ai-lab__option">
                        <input
                          type="radio"
                          name="ai-answer"
                          value={option.id}
                          checked={selectedOptionId === option.id}
                          onChange={() => {
                            setSelectedOptionId(option.id);
                            setResult(null);
                          }}
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <label className="ai-lab__edit">
                    Replace only this line: <code>{challenge.wrongLine}</code>
                    <input
                      type="text"
                      value={editedLine}
                      onChange={(event) => {
                        setEditedLine(event.target.value);
                        setResult(null);
                      }}
                      placeholder="Type the corrected line of code"
                      maxLength={150}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={loading}
                    />
                    <small>
                      We check your line as text. Your code is never executed.
                    </small>
                  </label>
                )}

                <button
                  className="ai-lab__check"
                  type="submit"
                  disabled={
                    loading ||
                    (answerMode === "choose"
                      ? !selectedOptionId
                      : !editedLine.trim())
                  }
                >
                  {loading ? "Checking…" : "Check the result ↗"}
                </button>
              </form>

              {result && (
                <div
                  className={`ai-lab__result ${
                    result.correct ? "ai-lab__result--correct" : ""
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  <strong>
                    {result.correct
                      ? "You caught the AI's mistake."
                      : "Almost. Here's what the AI missed."}
                  </strong>

                  {!result.correct && <p>{result.hint}</p>}
                  <p>{result.explanation}</p>
                  <p>The corrected line:</p>

                  <pre className="ai-lab__code">
                    <code>{result.correctedLine}</code>
                  </pre>

                  {!result.correct && (
                    <p>You can change your answer and try again.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            className="ai-lab__next"
            type="button"
            onClick={loadChallenge}
            disabled={loading}
          >
            Try another AI mistake →
          </button>
        </>
      )}
    </section>
  );
}
