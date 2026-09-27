import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="container">
      <h1>Almost there.</h1>
      <p className="text-muted">
        We couldn’t find the page you’re looking for.
      </p>
      <Link to="/">Back to home</Link>
    </section>
  );
}