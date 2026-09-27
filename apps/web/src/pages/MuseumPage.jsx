import { Link } from "react-router-dom";
import { museumRooms } from "../data/museumRooms";
import "./MuseumPage.css";

export default function MuseumPage() {
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

      <section
        className="museum-rooms"
        aria-label="Choose a museum room"
      >
        <span
          className="museum-rooms__orbit"
          aria-hidden="true"
        />

        {museumRooms.map((room, index) => (
          <Link
            key={room.id}
            to={`/museum/${room.id}`}
            className={`museum-room museum-room--${room.id}`}
          >
            <div className="museum-room__top">
              <span className="museum-room__number">
                Room {String(index + 1).padStart(2, "0")}
              </span>

              <span className="museum-room__count">
                {room.exhibits.length} exhibits
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
    </div>
  );
}