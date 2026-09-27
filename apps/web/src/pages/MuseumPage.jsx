import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../services/api";
import "./MuseumPage.css";

export default function MuseumPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRooms() {
      setLoading(true);
      setError("");

      try {
        const data = await getRooms(controller.signal);

        if (!controller.signal.aborted) {
          setRooms(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "We couldn’t load the rooms. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRooms();

    return () => controller.abort();
  }, [retryCount]);

  return (
    <div className="museum-page container">
      <header className="museum-page__header">
        <p className="museum-page__eyebrow">
          Welcome to the museum
        </p>

        <h1>Every mistake opens a door.</h1>

        <p className="museum-page__description">
          Choose a room. Discover a different way to think.
        </p>
      </header>

      {loading && (
        <div className="museum-page__state" role="status">
          Opening the museum…
        </div>
      )}

      {!loading && error && (
        <div className="museum-page__state">
          <p role="alert">{error}</p>

          <button
            className="museum-page__retry"
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <div className="museum-page__state" role="status">
          The museum is getting ready. Check back soon.
        </div>
      )}

      {!loading && !error && rooms.length > 0 && (
        <>
          <section
            className="museum-rooms"
            aria-label="Choose a museum room"
          >
            <span
              className="museum-rooms__orbit"
              aria-hidden="true"
            />

            {rooms.map((room, index) => (
              <Link
                key={room.slug}
                to={`/museum/${room.slug}`}
                className={`museum-room museum-room--${room.slug}`}
              >
                <div className="museum-room__top">
                  <span className="museum-room__number">
                    Room {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <span
                  className="museum-room__symbol"
                  aria-hidden="true"
                >
                  {room.symbol}
                </span>

                <h2>{room.name}</h2>

                <p className="museum-room__tagline">
                  {room.tagline}
                </p>

                <p className="museum-room__description">
                  {room.description}
                </p>

                <span className="museum-room__enter">
                  Enter room <span aria-hidden="true">↗</span>
                </span>
              </Link>
            ))}
          </section>

          <p className="museum-page__note">
            No perfect answers required. Just curiosity.
          </p>
        </>
      )}
    </div>
  );
}