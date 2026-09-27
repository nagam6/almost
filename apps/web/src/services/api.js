export async function getRooms(signal) {
  const response = await fetch("/api/rooms", { signal });

  if (!response.ok) {
    throw new Error("Unable to load museum rooms.");
  }

  const data = await response.json();

  if (!Array.isArray(data.rooms)) {
    throw new Error("Invalid rooms response.");
  }

  return data.rooms;
}

export async function getRoomExhibits(roomSlug, signal) {
  const response = await fetch(
    `/api/rooms/${encodeURIComponent(roomSlug)}/exhibits`,
    { signal }
  );

  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? "Room not found."
        : "Unable to load room exhibits."
    );

    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  if (!data.room || !Array.isArray(data.exhibits)) {
    throw new Error("Invalid room response.");
  }

  return {
    room: data.room,
    exhibits: data.exhibits.map((exhibit) => ({
      ...exhibit,
      id: exhibit.slug,
    })),
  };
}
export async function getExhibit(slug, signal) {
  const response = await fetch(
    `/api/exhibits/${encodeURIComponent(slug)}`,
    { signal }
  );

  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? "Exhibit not found."
        : "Unable to load exhibit."
    );

    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  if (!data.exhibit || !Array.isArray(data.exhibit.options)) {
    throw new Error("Invalid exhibit response.");
  }

  return data.exhibit;
}