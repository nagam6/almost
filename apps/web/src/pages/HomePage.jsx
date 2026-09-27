import "./HomePage.css";
import MistakePreview from "../components/MistakePreview";

export default function HomePage() {
  return (
    <div className="home-page">
      <section
        className="home-hero container"
        aria-labelledby="home-title"
      >
        <p className="home-hero__eyebrow">
          A museum of mistakes
        </p>

        <h1 id="home-title" className="home-hero__title">
          Almost right.
          <span>Worth another thought.</span>
        </h1>

        <p className="home-hero__description">
          A wrong answer can start a great discovery.
          Explore mistakes, uncover the thinking behind them,
          and build a better understanding.
        </p>

        <a className="home-hero__button" href="#how-it-works">
          Discover how it works
          <span aria-hidden="true"> ↗</span>
        </a>
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

        <h2 id="how-title">Mistakes belong here. So do you.</h2>

        <p className="home-how__intro">
          Each exhibit is reviewed by a teacher, with its
          author’s identity hidden from classmates.
          The focus stays on the thinking.
        </p>

        <ol className="home-how__steps">
          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">
              01
            </span>
            <h3>Explore a mistake</h3>
            <p>
              Look at a question and an incorrect solution.
              Take a moment to follow the reasoning.
            </p>
          </li>

          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">
              02
            </span>
            <h3>Spot the turning point</h3>
            <p>
              Where did the thinking go wrong?
              Choose the explanation that makes sense to you.
            </p>
          </li>

          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">
              03
            </span>
            <h3>Discover the why</h3>
            <p>
              Reveal the explanation and corrected solution.
              Understand the mistake, beyond the right answer.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}