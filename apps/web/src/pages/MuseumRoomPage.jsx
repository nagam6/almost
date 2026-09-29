import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ExhibitCard from "../components/ExhibitCard";
import { getRoomExhibits } from "../services/api";
import AiCodeLab from "./AiCodeLab";
import NotFoundPage from "./NotFoundPage";
import "./MuseumRoomPage.css";

export default function MuseumRoomPage() {
  const { roomId } = useParams();

  return <RoomContent key={roomId} roomId={roomId} />;
}

function RoomContent({ roomId }) {
  const [room, setRoom] = useState(null);
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [path, setPath] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRoom() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const data = await getRoomExhibits(
          roomId,
          controller.signal
        );

        if (controller.signal.aborted) return;

        setRoom(data.room);
        setExhibits(data.exhibits);
      } catch (caught) {
        if (controller.signal.aborted) return;

        if (caught.status === 404) {
          setNotFound(true);
        } else {
          toast.error("We couldn't load this room. Please try again.", { toastId: `room-load-${roomId}` });
          setError(
            "We couldn't load this room. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRoom();

    return () => controller.abort();
  }, [roomId, retryCount]);

  if (notFound) {
    return <NotFoundPage />;
  }

  const isJavaScriptRoom = room?.slug === "javascript";
  const isInsidePath = isJavaScriptRoom && path !== null;

  return (
    <div className="museum-room-page container">
      {isInsidePath ? (
        <button
          className="museum-room-page__back"
          type="button"
          aria-label="Back to learning paths"
          onClick={() => setPath(null)}
        >
          ← Back
        </button>
      ) : (
        <Link
          className="museum-room-page__back"
          to="/museum"
          aria-label="Back to rooms"
        >
          ← Back
        </Link>
      )}

      {loading ? (
        <p role="status">Opening the room…</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              setRetryCount((count) => count + 1)
            }
          >
            Try again
          </button>
        </div>
      ) : room ? (
        <>
          <header className="museum-room-page__header">
            <p className="museum-room-page__eyebrow">
              {room.tagline}
            </p>

            <h1>{room.name}</h1>

            <p className="museum-room-page__description">
              {room.description}
            </p>
          </header>

          {isJavaScriptRoom && path === null ? (
            <section
              className="museum-room-page__paths"
              aria-label="Choose your learning path"
            >
              <button
                className="museum-path"
                type="button"
                onClick={() => setPath("teacher")}
              >
                <span
                  className="museum-path__icon"
                  aria-hidden="true"
                >
                  ◈
                </span>

                <span className="museum-path__label">
                  PATH 01 · FROM TEACHERS
                </span>

                <strong>Teacher Exhibits</strong>

                <span>
                  Explore the challenges teachers created
                  for the museum.
                </span>

                <span className="museum-path__enter">
                  Explore exhibits
                  <span aria-hidden="true">↗</span>
                </span>
              </button>

              <button
                className="museum-path museum-path--ai"
                type="button"
                onClick={() => setPath("ai")}
              >
                <span
                  className="museum-path__icon"
                  aria-hidden="true"
                >
                  {"{ }"}
                </span>

                <span className="museum-path__label">
                  PATH 02 · AI CODE LAB
                </span>

                <strong>Fix the AI</strong>

                <span>
                  Find the mistake in a JavaScript challenge
                  and repair the code.
                </span>

                <span className="museum-path__enter">
                  Enter the lab
                  <span aria-hidden="true">↗</span>
                </span>
              </button>
            </section>
          ) : path === "ai" ? (
            <AiCodeLab />
          ) : exhibits.length === 0 ? (
            <p>No teacher exhibits yet. Check back soon.</p>
          ) : (
            <>
              <p className="museum-room-page__eyebrow">
                {exhibits.length}{" "}
                {exhibits.length === 1
                  ? "teacher exhibit"
                  : "teacher exhibits"}
              </p>

              <div className="museum-room-page__grid">
                {exhibits.map((exhibit) => (
                  <ExhibitCard
                    key={exhibit.id}
                    exhibit={exhibit}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
