import { Link } from "react-router-dom";
import MistakePreview from "../components/MistakePreview";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="home-page">
      <section
        className="home-hero container"
        aria-labelledby="home-title"
      >
        <div className="home-hero__copy">
          <p className="home-hero__eyebrow">
            The museum of mistakes
          </p>

        <h1 id="home-title" className="home-hero__title">
          Almost right.
          <span>Worth another thought.</span>
        </h1>

          <p className="home-hero__description">
            Every mistake leaves a clue. Step inside, follow
            the reasoning, and find the moment everything changes.
          </p>

          <div className="home-hero__actions">
            <Link className="home-hero__button" to="/museum">
              Enter the museum
              <span aria-hidden="true">↗</span>
            </Link>

            <a className="home-hero__text-link" href="#how-it-works">
              How it works ↓
            </a>
          </div>
        </div>

        <aside
          className="home-hero__artifact"
          aria-label="A sample mistake about the order of operations"
        >
          <div className="home-hero__artifact-top">
            <span>ALMOST / ARCHIVE</span>
            <span>EXHIBIT 001</span>
          </div>

          <p className="home-hero__artifact-label">
            THE WRONG TURN
          </p>

          <p className="home-hero__equation">
            2 + 3 × 4
          </p>

          <p className="home-hero__answer">
            <s>= 20</s>
            <span>= 14</span>
          </p>

          <p className="home-hero__annotation">
            Multiply first.
            <br />
            Now look again.
          </p>

          <div className="home-hero__artifact-bottom">
            <span>EVERY ERROR HAS A STORY</span>
          </div>
        </aside>
      </section>

      <MistakePreview />

      <section
        id="how-it-works"
        className="home-how container"
        aria-labelledby="how-title"
      >
        <p className="home-how__eyebrow">
          A different way to learn
        </p>

        <h2 id="how-title">
          Mistakes belong here. So do you.
        </h2>

        <p className="home-how__intro">
          Teachers turn common misconceptions into exhibits.
          Students discover where the thinking went wrong,
          while teachers see anonymous patterns in the answers.
        </p>

        <ol className="home-how__steps">
          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">
              01
            </span>
            <h3>Explore the exhibit</h3>
            <p>
              Read the question and the incorrect solution.
              Follow the thinking behind it.
            </p>
          </li>

          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">
              02
            </span>
            <h3>Find the wrong turn</h3>
            <p>
              Choose where the reasoning changed course.
              Your first answer helps reveal a learning pattern.
            </p>
          </li>

          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">
              03
            </span>
            <h3>Reveal and rethink</h3>
            <p>
              See feedback for your choice and the corrected
              solution. Then try again just for practice.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}