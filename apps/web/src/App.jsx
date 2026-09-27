import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <AppLayout>
      <div className="container">
        <h1>Every mistake has a story.</h1>

        <p className="text-muted">
          Explore the thinking behind a wrong answer.
        </p>
      </div>
    </AppLayout>
  );
}