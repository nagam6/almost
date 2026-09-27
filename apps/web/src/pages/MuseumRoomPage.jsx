import { Link, useParams } from "react-router-dom";
import ExhibitCard from "../components/ExhibitCard";
import { museumRooms } from "../data/museumRooms";
import NotFoundPage from "./NotFoundPage";
import "./MuseumRoomPage.css";

export default function MuseumRoomPage() {
  const { roomId } = useParams();

  const room = museumRooms.find(
    (item) => item.id === roomId
  );

  if (!room) {
    return <NotFoundPage />;
  }

  return (
    <div className="museum-room-page container">
      <Link className="museum-room-page__back" to="/museum">
        ← All rooms
      </Link>

      <header className="museum-room-page__header">
        <p className="museum-room-page__eyebrow">
          {room.exhibits.length} sample exhibits
        </p>

        <h1>{room.name}</h1>

        <p className="museum-room-page__description">
          {room.tagline} {room.description}
        </p>
      </header>

      <div className="museum-room-page__grid">
        {room.exhibits.map((exhibit) => (
          <ExhibitCard
            key={exhibit.id}
            exhibit={exhibit}
          />
        ))}
      </div>
    </div>
  );
}