import { useState } from "react";
import "./MistakePreview.css";

const options = [
  {
    id: "same-percentage",
    text: "The same percentage always means the same amount.",
    feedback:
      "A percentage depends on the amount it is calculated from. Here, that amount changes after the discount.",
  },
  {
    id: "different-base",
    text: "The increase is calculated from a smaller price.",
    feedback:
      "Exactly! The discount is calculated from ₪100, but the increase is calculated from ₪80.",
  },
  {
    id: "order-only",
    text: "Reversing the order would bring the price back to ₪100.",
    feedback:
      "Reversing the order also gives ₪96: ₪100 → ₪120 → ₪96. The two changes do not cancel out.",
  },
];

export default function MistakePreview() {
  const [selectedId, setSelectedId] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);

  const selectedOption = options.find((option) => option.id === selectedId);

  const isCorrect = selectedId === "different-base";

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedId || isRevealed) return;

    setIsRevealed(true);
  }

  function handleReset() {
    setSelectedId("");
    setIsRevealed(false);
  }

  return (
    <section
      className="mistake-preview container"
      aria-labelledby="preview-title"
    >
      <div className="mistake-preview__intro">
        <p className="mistake-preview__eyebrow">A little preview</p>

        <h2 id="preview-title">Looks right. Is it?</h2>

        <p>
          Step into your first exhibit. Follow the reasoning, then find the
          mistake.
        </p>
      </div>

      <div className="mistake-preview__card">
        <span className="mistake-preview__badge">
          Percentages · Sample exhibit
        </span>

        <h3>The discount that came back?</h3>

        <p>
          A bag costs ₪100. Its price drops by 20%, then the new price rises by
          20%. What is the final price?
        </p>

        <div className="mistake-preview__wrong-answer">
          <p className="mistake-preview__label">The incorrect solution</p>
          <p>“₪100. Minus 20%, plus 20% — they cancel out.”</p>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset className="mistake-preview__choices" disabled={isRevealed}>
            <legend>Where did the thinking go wrong?</legend>

            {options.map((option) => (
              <label
                key={option.id}
                className={`mistake-preview__option ${
                  selectedId === option.id
                    ? "mistake-preview__option--selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="preview-answer"
                  value={option.id}
                  checked={selectedId === option.id}
                  onChange={() => setSelectedId(option.id)}
                  required
                />
                <span>{option.text}</span>
              </label>
            ))}
          </fieldset>

          {!isRevealed && (
            <button
              className="mistake-preview__button"
              type="submit"
              disabled={!selectedId}
            >
              Reveal the explanation
            </button>
          )}
        </form>

        <div aria-live="polite" aria-atomic="true">
          {isRevealed && (
            <div className="mistake-preview__feedback">
              <h4>
                {isCorrect
                  ? "You spotted it!"
                  : "Almost. Let’s take another look."}
              </h4>

              <p>{selectedOption?.feedback}</p>

              <p className="mistake-preview__calculation">
                ₪100 × 0.80 = ₪80
                <br />
                ₪80 × 1.20 = ₪96
              </p>

              <p>
                <strong>The final price is ₪96.</strong> The key is asking: “20%
                of which amount?”
              </p>
            </div>
          )}
        </div>

        {isRevealed && (
          <button
            className="mistake-preview__reset"
            type="button"
            onClick={handleReset}
          >
            Try again
          </button>
        )}
      </div>
    </section>
  );
}
