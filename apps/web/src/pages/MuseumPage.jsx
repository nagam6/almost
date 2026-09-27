import ExhibitCard from "../components/ExhibitCard";

const exampleExhibit = {
  id: "discount-example",
  number: "001",
  topic: "Percentages",
  title: "Back to the original price?",
  question:
    "An item costs ₪100. Its price drops by 20%, then the new price rises by 20%. What is the final price?",
  incorrectAnswer:
    "₪100 — the 20% decrease and the 20% increase cancel each other out.",
};

export default function MuseumPage() {
  return (
    <div className="container">
      <h1>The Museum</h1>
      <p className="text-muted">
        A preview of the mistakes you can explore.
      </p>

      <ExhibitCard exhibit={exampleExhibit} />
    </div>
  );
}