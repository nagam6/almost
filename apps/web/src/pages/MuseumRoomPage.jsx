import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ExhibitCard from "../components/ExhibitCard";
import { getRoomExhibits } from "../services/api";
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
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error.status === 404) {
          setNotFound(true);
        } else {
          setError("We couldn't load this room. Please try again.");
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

  return (
    <div className="museum-room-page container">
      <Link className="museum-room-page__back" to="/museum">
        ← All rooms
      </Link>

      {loading ? (
        <p role="status">Opening the room…</p>
      ) : error ? (
        <div>
          <p role="alert">{error}</p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      ) : room ? (
        <>
          <header className="museum-room-page__header">
            <p className="museum-room-page__eyebrow">
              {exhibits.length}{" "}
              {exhibits.length === 1 ? "exhibit" : "exhibits"}
            </p>

            <h1>{room.name}</h1>

            <p className="museum-room-page__description">
              {room.tagline} {room.description}
            </p>
          </header>

          {exhibits.length === 0 ? (
            <p>No exhibits yet. Check back soon.</p>
          ) : (
            <div className="museum-room-page__grid">
              {exhibits.map((exhibit) => (
                <ExhibitCard
                  key={exhibit.id}
                  exhibit={exhibit}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}