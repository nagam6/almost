import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { teacherRequest } from "../services/teacherApi";
import { useConfirmDialog } from "../components/ConfirmDialog";
import "./Teacher.css";

const blank = () => ({
  roomSlug: "",
  number: 1,
  topic: "",
  title: "",
  question: "",
  incorrectAnswer: "",
  options: [
    { id: "a", text: "", feedback: "" },
    { id: "b", text: "", feedback: "" },
    { id: "c", text: "", feedback: "" },
  ],
  correctOptionId: "",
  explanation: "",
});

function payload(form) {
  return Object.fromEntries(
    Object.keys(blank()).map((key) => [key, form[key]])
  );
}

function Results({ slug }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");

    teacherRequest(`/exhibits/${slug}/stats`, {
      signal: controller.signal,
    })
      .then(({ stats }) => setData(stats))
      .catch((err) => {
        if (err.name !== "AbortError") { setError(err.message); toast.error(err.message, { toastId: `teacher-stats-${slug}` }); }
      });

    return () => controller.abort();
  }, [slug, refresh]);

  return (
    <section className="teacher-panel" aria-labelledby="results-title">
      <div className="teacher-section-title">
        <h2 id="results-title">Where thinking takes a turn</h2>
        <button
          type="button"
          className="teacher-button teacher-button--secondary"
          onClick={() => setRefresh((value) => value + 1)}
        >
          Refresh results
        </button>
      </div>

      <p className="text-muted">
        First answers only. No student names, emails or written responses.
      </p>

      {error ? (
        <p role="alert" className="teacher-error">
          {error}
        </p>
      ) : !data ? (
        <p role="status">Loading results…</p>
      ) : (
        <>
          <div className="teacher-metrics">
            <div>
              <strong>{data.total}</strong>
              <span>Learners answered</span>
            </div>
            <div>
              <strong>
                {data.accuracy === null ? "—" : `${data.accuracy}%`}
              </strong>
              <span>
                Correct diagnosis · {data.correct}/{data.total}
              </span>
            </div>
          </div>

          {!data.total && (
            <p>
              No answers yet. Results will appear after a student
              submits a first attempt.
            </p>
          )}

          {data.options.map((option) => (
            <div className="teacher-result" key={option.id}>
              <div>
                <span>
                  {option.text}
                  {option.isCorrect && <strong> · Correct</strong>}
                </span>
                <span>
                  {option.count} / {data.total}
                </span>
              </div>
              <div className="teacher-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${
                      data.total
                        ? (option.count / data.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default function TeacherExhibitPage() {
  const { slug } = useParams();
  return <Editor key={slug || "new"} slug={slug} />;
}

function Editor({ slug }) {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirmDialog();
  const [form, setForm] = useState(blank);
  const [saved, setSaved] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [retry, setRetry] = useState(0);

  const editable = !saved || saved.status === "draft";

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");

    Promise.all([
      fetch("/api/rooms", { signal: controller.signal }).then(
        async (response) => {
          if (!response.ok) {
            throw new Error("Could not load rooms.");
          }
          return response.json();
        }
      ),
      slug
        ? teacherRequest(`/exhibits/${slug}`, {
            signal: controller.signal,
          })
        : Promise.resolve(null),
    ])
      .then(([roomData, exhibitData]) => {
        setRooms(roomData.rooms);

        if (exhibitData) {
          setSaved(exhibitData.exhibit);
          setForm(payload(exhibitData.exhibit));
        } else {
          setForm((current) => ({
            ...current,
            roomSlug: roomData.rooms[0]?.slug || "",
          }));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") { setLoadError(err.message); toast.error(err.message, { toastId: `teacher-exhibit-${slug}` }); }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug, retry]);

  useEffect(() => {
    const warn = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    const guardLink = (event) => {
      const link = event.target.closest?.("a[href]");

      if (dirty && link && link.target !== "_blank" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        const url = new URL(link.href, window.location.href);
        confirm("Leave without saving your changes?", "Leave page").then((accepted) => {
          if (!accepted) return;
          if (url.origin === window.location.origin) navigate(url.pathname + url.search + url.hash);
          else window.location.assign(url.href);
        });
      }
    };

    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardLink, true);

    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", guardLink, true);
    };
  }, [dirty, confirm, navigate]);

  function change(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);

    try {
      const data = await teacherRequest(
        slug ? `/exhibits/${slug}` : "/exhibits",
        {
          method: slug ? "PUT" : "POST",
          body: {
            ...payload(form),
            ...(saved ? { revision: saved.revision } : {}),
          },
        }
      );

      setSaved(data.exhibit);
      setForm(payload(data.exhibit));
      setDirty(false);
      toast.success("Draft saved. Preview it, then publish when you are ready.");

      if (!slug) {
        navigate(`/teacher/exhibits/${data.exhibit.slug}`, {
          replace: true,
        });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function transition(action) {
    const confirmation = {
      publish:
        "Publish this exhibit to everyone? Its content will become read-only.",
      archive:
        "Archive this exhibit? It will leave the museum; existing attempts and statistics will be kept.",
      restore:
        "Restore this exhibit to the museum? Students will be able to see it again.",
    };

    if (!(await confirm(confirmation[action], action === "publish" ? "Publish" : action === "archive" ? "Archive" : "Restore"))) return;

    setBusy(true);

    try {
      const data = await teacherRequest(
        `/exhibits/${slug}/${action}`,
        {
          method: "POST",
          body: { revision: saved.revision },
        }
      );

      setSaved(data.exhibit);
      toast.success(
        {
          publish: "Your exhibit is live in the museum.",
          archive: "Exhibit archived. Its results are preserved.",
          restore:
            "Exhibit restored. Students can see it in the museum again.",
        }[action]
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteDraft() {
    if (!saved || saved.status !== "draft") return;

    if (!(await confirm("Delete this draft permanently? This cannot be undone.", "Delete draft"))) {
      return;
    }

    setBusy(true);

    try {
      await teacherRequest(`/exhibits/${slug}`, {
        method: "DELETE",
        body: { revision: saved.revision },
      });

      setDirty(false);
      navigate("/teacher", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="container teacher-page" role="status">
        Opening your studio…
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="container teacher-page">
        <p role="alert">{loadError}</p>
        <button
          type="button"
          onClick={() => setRetry((value) => value + 1)}
        >
          Try again
        </button>
        <p>
          <Link to="/teacher">Back to studio</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="container teacher-page">
      {dialog}
      <Link to="/teacher">← My exhibits</Link>

      <header className="teacher-heading">
        <div>
          <p className="teacher-eyebrow">
            {saved?.status || "NEW EXHIBIT"}
          </p>
          <h1>
            {editable ? "A mistake worth exploring." : saved.title}
          </h1>
          <p>
            {editable
              ? "Build a challenge that helps learners understand the thinking behind the answer."
              : saved.status === "archived"
                ? "This exhibit is archived. Restore it to show it in the museum again."
                : "Published content is locked to keep student results consistent."}
          </p>
        </div>
      </header>

      {!rooms.length && (
        <p className="teacher-error">
          No museum rooms are available. Set up the rooms before
          creating an exhibit.
        </p>
      )}

      <form onSubmit={save} className="teacher-panel">
        <fieldset
          disabled={!editable || busy}
          className="teacher-fields"
        >
          <legend className="sr-only">Exhibit content</legend>

          <div className="teacher-two">
            <label>
              Room
              <select
                required
                value={form.roomSlug}
                onChange={(event) =>
                  change("roomSlug", event.target.value)
                }
              >
                <option value="">Choose a room</option>
                {rooms.map((room) => (
                  <option key={room.slug} value={room.slug}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Display number
              <input
                type="number"
                min="1"
                max="9999"
                required
                value={form.number}
                onChange={(event) =>
                  change("number", Number(event.target.value))
                }
              />
            </label>
          </div>

          <label>
            Topic
            <input
              required
              maxLength={100}
              value={form.topic}
              onChange={(event) =>
                change("topic", event.target.value)
              }
              placeholder="e.g. Percentages"
            />
          </label>

          <label>
            Exhibit title
            <input
              required
              maxLength={160}
              value={form.title}
              onChange={(event) =>
                change("title", event.target.value)
              }
              placeholder="e.g. The discount that fooled us"
            />
          </label>

          <label>
            The original question
            <textarea
              required
              rows={3}
              maxLength={2000}
              value={form.question}
              onChange={(event) =>
                change("question", event.target.value)
              }
            />
          </label>

          <label>
            The intentionally incorrect solution
            <textarea
              required
              rows={3}
              maxLength={2000}
              value={form.incorrectAnswer}
              onChange={(event) =>
                change("incorrectAnswer", event.target.value)
              }
            />
          </label>

          <div>
            <h3>Where did the thinking go wrong?</h3>
            <p className="text-muted">
              Write 2–6 diagnoses and explain each choice. Mark
              exactly one as correct.
            </p>
          </div>

          {form.options.map((option, index) => (
            <div className="teacher-option" key={option.id}>
              <label className="teacher-correct">
                <input
                  type="radio"
                  name="correctOption"
                  required
                  checked={form.correctOptionId === option.id}
                  onChange={() =>
                    change("correctOptionId", option.id)
                  }
                />
                Correct {index + 1}
              </label>

              <div className="teacher-option-fields">
                <label>
                  Choice {index + 1}
                  <input
                    required
                    maxLength={500}
                    value={option.text}
                    onChange={(event) =>
                      change(
                        "options",
                        form.options.map((item) =>
                          item.id === option.id
                            ? { ...item, text: event.target.value }
                            : item
                        )
                      )
                    }
                  />
                </label>

                <label>
                  Feedback after answering
                  <textarea
                    required
                    rows={2}
                    maxLength={600}
                    value={option.feedback || ""}
                    onChange={(event) =>
                      change(
                        "options",
                        form.options.map((item) =>
                          item.id === option.id
                            ? {
                                ...item,
                                feedback: event.target.value,
                              }
                            : item
                        )
                      )
                    }
                    placeholder="Explain why this diagnosis fits or doesn't fit the mistake."
                  />
                </label>
              </div>

              {editable && (
                <button
                  type="button"
                  disabled={form.options.length <= 2}
                  aria-label={`Remove choice ${index + 1}`}
                  onClick={() => {
                    change(
                      "options",
                      form.options.filter(
                        (item) => item.id !== option.id
                      )
                    );
                    if (form.correctOptionId === option.id) {
                      change("correctOptionId", "");
                    }
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {editable && (
            <button
              className="teacher-button teacher-button--secondary"
              type="button"
              disabled={form.options.length >= 6}
              onClick={() => {
                const id = ["a", "b", "c", "d", "e", "f"].find(
                  (value) =>
                    !form.options.some(
                      (option) => option.id === value
                    )
                );
                change("options", [
                  ...form.options,
                  { id, text: "", feedback: "" },
                ]);
              }}
            >
              + Add choice
            </button>
          )}

          <label>
            The reveal: corrected solution and explanation
            <textarea
              required
              rows={5}
              maxLength={3000}
              value={form.explanation}
              onChange={(event) =>
                change("explanation", event.target.value)
              }
              placeholder="Explain the misconception and walk through the correct solution. Learners see this after answering."
            />
          </label>
        </fieldset>

        <div className="teacher-actions">
          {editable && (
            <button
              className="teacher-button"
              disabled={busy || !rooms.length}
            >
              {busy ? "Saving…" : "Save draft"}
            </button>
          )}

          <button
            type="button"
            className="teacher-button teacher-button--secondary"
            onClick={() => setPreview((value) => !value)}
          >
            {preview ? "Hide preview" : "Preview challenge"}
          </button>

          {saved?.status === "draft" && (
            <>
              <button
                type="button"
                className="teacher-button"
                disabled={busy || dirty}
                onClick={() => transition("publish")}
              >
                Publish to museum
              </button>
              <button
                type="button"
                className="teacher-button teacher-button--secondary"
                disabled={busy}
                onClick={deleteDraft}
              >
                Delete draft
              </button>
            </>
          )}

          {saved?.status === "published" && (
            <>
              <Link to={`/museum/exhibits/${slug}`}>
                Open in museum ↗
              </Link>
              <button
                className="teacher-button teacher-button--secondary"
                type="button"
                disabled={busy}
                onClick={() => transition("archive")}
              >
                Archive
              </button>
            </>
          )}

          {saved?.status === "archived" && (
            <button
              className="teacher-button"
              type="button"
              disabled={busy}
              onClick={() => transition("restore")}
            >
              Restore to museum
            </button>
          )}
        </div>

        {dirty && (
          <p className="text-muted">
            You have unsaved changes. Save before publishing.
          </p>
        )}
      </form>

      {preview && (
        <section className="teacher-panel teacher-preview">
          <p className="teacher-eyebrow">
            STUDENT PREVIEW · ANSWERS HIDDEN
          </p>
          <h2>{form.title || "Your exhibit title"}</h2>
          <p>{form.question}</p>
          <div className="teacher-wrong">
            <strong>The incorrect solution</strong>
            <p>{form.incorrectAnswer}</p>
          </div>
          <h3>Where did the thinking go wrong?</h3>
          {form.options.map((option, index) => (
            <p className="teacher-preview-option" key={option.id}>
              {index + 1}. {option.text || "Your choice text"}
            </p>
          ))}
          <p className="text-muted">
            Preview only. No attempt is submitted here.
          </p>
        </section>
      )}

      {saved && saved.status !== "draft" && (
        <Results slug={slug} />
      )}
    </main>
  );
}
