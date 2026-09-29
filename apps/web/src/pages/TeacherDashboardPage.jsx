import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../components/AuthProvider";
import { teacherRequest } from "../services/teacherApi";
import "./Teacher.css";

export function TeacherOnly({ children }) {
  const { user } = useAuth();
  if (user?.role !== "teacher")
    return (
      <div className="container teacher-page">
        <h1>Teacher access only</h1>
        <p>This workspace is for approved teachers.</p>
        <Link to="/museum">Explore the museum</Link>
      </div>
    );
  return children;
}
export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    Promise.all([
      teacherRequest(`/exhibits?page=${page}`, { signal: controller.signal }),
      teacherRequest("/summary", { signal: controller.signal }),
    ])
      .then(([list, insight]) => setData({ ...list, summary: insight.summary }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          toast.error(err.message, { toastId: "teacher-dashboard-load" });
        }
      });
    return () => controller.abort();
  }, [page, refresh]);
  return (
    <main className="container teacher-page">
      <header className="teacher-heading">
        <div>
          <p className="teacher-eyebrow">THE OTHER SIDE OF ALMOST</p>
          <h1>
            Teacher Studio<span>.</span>
          </h1>
          <p>
            Hi {user.name}. Turn a wrong turn into someone’s next discovery.
          </p>
        </div>
        <Link className="teacher-button" to="/teacher/new">
          + Create an exhibit
        </Link>
      </header>
      <div className="teacher-intro">
        <strong>A little mistake. A bigger understanding.</strong>
        <p>
          Create a challenge, publish it to the shared museum, and discover
          where learners get stuck.
        </p>
      </div>
      <section aria-labelledby="my-exhibits">
        <div className="teacher-section-title">
          <h2 id="my-exhibits">My exhibits</h2>
          <button
            className="teacher-button teacher-button--secondary"
            onClick={() => setRefresh((v) => v + 1)}
          >
            Refresh
          </button>
        </div>
        {error ? (
          <p role="alert" className="teacher-error">
            {error}
          </p>
        ) : !data ? (
          <p role="status">Loading your exhibits…</p>
        ) : (
          <>
            <div className="teacher-metrics teacher-panel">
              <div>
                <strong>{data.summary.states.published || 0}</strong>
                <span>Published exhibits</span>
              </div>
              <div>
                <strong>{data.summary.learners}</strong>
                <span>Distinct learners</span>
              </div>
              <div>
                <strong>{data.summary.attempts}</strong>
                <span>First attempts across your exhibits</span>
              </div>
              <div>
                <strong>
                  {data.summary.accuracy === null
                    ? "—"
                    : `${data.summary.accuracy}%`}
                </strong>
                <span>
                  Correct diagnoses · {data.summary.correct}/
                  {data.summary.attempts}
                </span>
              </div>
            </div>
            <p className="text-muted">
              Results include archived exhibits. Each learner is counted once in
              the learner total.
            </p>
            <p className="text-muted">
              {data.total} exhibits · Only your own content appears here.
            </p>
            {!data.exhibits.length ? (
              <div className="teacher-empty">
                <h3>Your first exhibit starts with a mistake.</h3>
                <p>
                  Choose a familiar misconception and help learners rethink it.
                </p>
                <Link to="/teacher/new">Create your first exhibit →</Link>
              </div>
            ) : (
              <div className="teacher-cards">
                {data.exhibits.map((item) => (
                  <article className="teacher-card" key={item.slug}>
                    <div className="teacher-card-top">
                      <span
                        className={`teacher-badge teacher-badge--${item.status}`}
                      >
                        {item.status}
                      </span>
                      <span className="text-muted">{item.topic}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p className="text-muted">{item.roomSlug} room</p>
                    <Link
                      className="teacher-card-link"
                      to={`/teacher/exhibits/${item.slug}`}
                    >
                      {item.status === "draft"
                        ? "Continue editing"
                        : "View exhibit & results"}{" "}
                      →
                    </Link>
                  </article>
                ))}
              </div>
            )}
            {data.pages > 1 && (
              <div className="teacher-actions">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {data.pages}
                </span>
                <button
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
